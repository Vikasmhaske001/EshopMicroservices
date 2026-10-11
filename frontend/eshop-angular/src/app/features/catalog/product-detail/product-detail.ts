import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { QuantityStepper } from '../../../shared/components/quantity-stepper/quantity-stepper';
import { Product } from '../../../shared/models/product.model';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { BasketService } from '../../basket/basket.service';
import { CatalogService } from '../catalog.service';
import { ImageCredits } from '../image-credits.service';

const TOAST_DURATION_MS = 4000;
const RELATED_LIMIT = 4;

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, InrPipe, LoadingSpinner, ProductImage, QuantityStepper],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly authService = inject(AuthService);
  private readonly basketService = inject(BasketService);
  private readonly imageCredits = inject(ImageCredits);

  // undefined = still loading, null = not found / request failed, Product = loaded
  protected readonly product = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.catalogService.getProductById(params.get('id')!)),
      catchError(() => of(null as Product | null))
    ),
    { initialValue: undefined }
  );

  protected readonly category = computed(() => this.product()?.categories[0] ?? '');

  /** Photo credit for the product's picture (Creative Commons licences require it). */
  protected readonly credit = computed(() => {
    const file = this.product()?.imageFile;
    return file ? (this.imageCredits.credits()[file] ?? null) : null;
  });

  /** "More in {category}": same category, minus the product being viewed. Empty hides the section. */
  protected readonly related = toSignal(
    toObservable(this.product).pipe(
      switchMap((product) => {
        const category = product?.categories[0];
        if (!product || !category) {
          return of([] as Product[]);
        }
        return this.catalogService.getProductsByCategory(category).pipe(
          map((products) => products.filter((p) => p.id !== product.id).slice(0, RELATED_LIMIT)),
          catchError(() => of([] as Product[]))
        );
      })
    ),
    { initialValue: [] as Product[] }
  );

  protected readonly quantity = signal(1);
  protected readonly adding = signal(false);
  /** Name of the product just added; shown in the inline confirmation for a few seconds. */
  protected readonly toast = signal<string | null>(null);

  protected readonly lineTotal = computed(() => (this.product()?.price ?? 0) * this.quantity());

  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Navigating to another product ("More in ...") reuses this component: start fresh.
    effect(() => {
      this.product();
      this.quantity.set(1);
      this.dismissToast();
    });
  }

  setQuantity(value: number): void {
    this.quantity.set(Math.max(1, value));
  }

  addToBasket(product: Product): void {
    // The catalog is deliberately public but the basket is not - send an anonymous visitor to
    // log in rather than let the POST fail and get swept into the refresh/logout flow.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.adding.set(true);
    this.basketService.addItem(product, this.quantity()).subscribe({
      next: () => {
        this.adding.set(false);
        this.quantity.set(1);
        this.showToast(product.name);
      },
      error: () => this.adding.set(false),
    });
  }

  dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast.set(null);
  }

  private showToast(name: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(name);
    this.toastTimer = setTimeout(() => this.toast.set(null), TOAST_DURATION_MS);
  }
}
