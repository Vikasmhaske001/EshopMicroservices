import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { CatalogService, GetProductsParams } from '../catalog.service';
import { ProductCard } from '../product-card/product-card';
import { PaginationControl } from '../../../shared/components/pagination-control/pagination-control';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const PAGE_SIZE = 9;
const CATEGORY_SAMPLE_SIZE = 50; // backend's MaxPageSize - the only way to enumerate categories today

@Component({
  selector: 'app-product-list',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    ProductCard,
    PaginationControl,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });

  protected readonly pageIndex = signal(1);
  protected readonly category = signal<string | undefined>(undefined);
  protected readonly sortBy = signal<'name' | 'price'>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly loading = signal(false);

  private readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' }
  );

  protected readonly sortOption = computed<SortOption>(() => `${this.sortBy()}-${this.sortDirection()}`);

  protected readonly categories = toSignal(
    this.catalogService.getProducts({ pageNumber: 1, pageSize: CATEGORY_SAMPLE_SIZE }).pipe(
      map((result) => [...new Set(result.data.flatMap((p) => p.categories))].sort()),
      catchError(() => of([] as string[]))
    ),
    { initialValue: [] as string[] }
  );

  private readonly queryParams = computed<GetProductsParams>(() => ({
    pageNumber: this.pageIndex(),
    pageSize: PAGE_SIZE,
    category: this.category(),
    search: this.searchTerm(),
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection(),
  }));

  protected readonly result = toSignal(
    toObservable(this.queryParams).pipe(
      tap(() => this.loading.set(true)),
      switchMap((params) =>
        this.catalogService.getProducts(params).pipe(
          catchError(() => of(null)),
          finalize(() => this.loading.set(false))
        )
      )
    ),
    { initialValue: null }
  );

  constructor() {
    this.seedStateFromUrl();

    // Any change to the search term (once debounced) is a new filter, not a new page of the
    // current filter - jumping back to page 1 avoids landing on a page that no longer exists.
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

    const search = initial.get('search');
    if (search) {
      this.searchControl.setValue(search, { emitEvent: false });
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

  onSortChange(value: SortOption): void {
    const [sortBy, sortDirection] = value.split('-') as ['name' | 'price', 'asc' | 'desc'];
    this.sortBy.set(sortBy);
    this.sortDirection.set(sortDirection);
    this.pageIndex.set(1);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
  }
}
