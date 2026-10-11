import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PaginationControl } from '../../../shared/components/pagination-control/pagination-control';
import { Product } from '../../../shared/models/product.model';
import { BasketService } from '../../basket/basket.service';
import { CatalogSearch } from '../catalog-search.service';
import { CatalogService, GetProductsParams } from '../catalog.service';
import { ProductCard } from '../product-card/product-card';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface CategoryStat {
  name: string;
  count: number;
}

const PAGE_SIZE = 9;
const CATEGORY_SAMPLE_SIZE = 50; // backend's MaxPageSize - the only way to enumerate categories today
const SKELETON_COUNT = 8;

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, PaginationControl],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly basketService = inject(BasketService);
  private readonly catalogSearch = inject(CatalogSearch);

  protected readonly searchTerm = this.catalogSearch.term;
  protected readonly pageIndex = signal(1);
  protected readonly category = signal<string | undefined>(undefined);
  protected readonly sortBy = signal<'name' | 'price'>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly addingId = signal<string | null>(null);

  protected readonly skeletons = Array.from({ length: SKELETON_COUNT }, (_, i) => i);

  protected readonly sortOption = computed<SortOption>(() => `${this.sortBy()}-${this.sortDirection()}`);

  /** Total product count and per-category counts, from one big unfiltered page. */
  protected readonly stats = toSignal(
    this.catalogService.getProducts({ pageNumber: 1, pageSize: CATEGORY_SAMPLE_SIZE }).pipe(
      map((result) => {
        const counts = new Map<string, number>();
        for (const product of result.data) {
          for (const name of product.categories) {
            counts.set(name, (counts.get(name) ?? 0) + 1);
          }
        }
        const categories: CategoryStat[] = [...counts.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return { total: result.count, categories };
      }),
      catchError(() => of({ total: 0, categories: [] as CategoryStat[] }))
    ),
    { initialValue: { total: 0, categories: [] as CategoryStat[] } }
  );

  /** productId -> quantity already in the basket, for the "In basket" state on cards. */
  protected readonly basketQuantities = computed(() => {
    const quantities = new Map<string, number>();
    for (const item of this.basketService.cart()?.items ?? []) {
      quantities.set(item.productId, item.quantity);
    }
    return quantities;
  });

  private readonly reloadTick = signal(0);

  private readonly queryParams = computed<GetProductsParams>(() => ({
    pageNumber: this.pageIndex(),
    pageSize: PAGE_SIZE,
    category: this.category(),
    search: this.searchTerm(),
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection(),
  }));

  protected readonly result = toSignal(
    toObservable(computed(() => ({ params: this.queryParams(), tick: this.reloadTick() }))).pipe(
      tap(() => {
        this.loading.set(true);
        this.failed.set(false);
      }),
      switchMap(({ params }) =>
        this.catalogService.getProducts(params).pipe(
          catchError(() => {
            this.failed.set(true);
            return of(null);
          }),
          finalize(() => this.loading.set(false))
        )
      )
    ),
    { initialValue: null }
  );

  protected readonly hasFilters = computed(() => !!this.category() || this.searchTerm() !== '');

  constructor() {
    this.seedStateFromUrl();

    // Any change to the search term is a new filter, not a new page of the current filter -
    // jumping back to page 1 avoids landing on a page that no longer exists.
    effect(() => {
      this.searchTerm();
      this.pageIndex.set(1);
    });

    effect(() => {
      const params = this.queryParams();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: params.pageNumber,
          category: params.category || null,
          search: params.search || null,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection,
        },
        replaceUrl: true,
      });
    });
  }

  private seedStateFromUrl(): void {
    const initial = this.route.snapshot.queryParamMap;

    const page = Number(initial.get('page'));
    if (page > 0) {
      this.pageIndex.set(page);
    }

    const category = initial.get('category');
    if (category) {
      this.category.set(category);
    }

    // Only an explicit ?search= overrides the shared term - arriving here from the header search
    // (which sets the term first) must not be clobbered by an empty URL.
    const search = initial.get('search');
    if (search) {
      this.catalogSearch.set(search);
    }

    const sortBy = initial.get('sortBy');
    if (sortBy === 'name' || sortBy === 'price') {
      this.sortBy.set(sortBy);
    }

    const sortDirection = initial.get('sortDirection');
    if (sortDirection === 'asc' || sortDirection === 'desc') {
      this.sortDirection.set(sortDirection);
    }
  }

  onCategoryChange(value: string): void {
    this.category.set(value || undefined);
    this.pageIndex.set(1);
  }

  onSortChange(value: string): void {
    const [sortBy, sortDirection] = value.split('-') as ['name' | 'price', 'asc' | 'desc'];
    this.sortBy.set(sortBy);
    this.sortDirection.set(sortDirection);
    this.pageIndex.set(1);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
  }

  clearFilters(): void {
    this.category.set(undefined);
    this.catalogSearch.clear();
    this.pageIndex.set(1);
  }

  retry(): void {
    this.reloadTick.update((tick) => tick + 1);
  }

  addToBasket(product: Product): void {
    // The catalog is public but the basket is not - send an anonymous visitor to log in rather
    // than let the POST fail and get swept into the refresh/logout flow.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.addingId.set(product.id);
    this.basketService.addItem(product, 1).subscribe({
      next: () => this.addingId.set(null),
      error: () => this.addingId.set(null),
    });
  }
}
