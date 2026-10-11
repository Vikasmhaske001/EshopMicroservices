import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/notifications/notification.service';
import { catchError, of, switchMap } from 'rxjs';
import { CatalogService } from '../catalog.service';
import { Product } from '../../../shared/models/product.model';
import { AuthService } from '../../../core/auth/auth.service';
import { BasketService } from '../../basket/basket.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, InrPipe, LoadingSpinner],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly authService = inject(AuthService);
  private readonly basketService = inject(BasketService);
  private readonly notifications = inject(NotificationService);

  // undefined = still loading, null = not found / request failed, Product = loaded
  protected readonly product = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.catalogService.getProductById(params.get('id')!)),
      catchError(() => of(null as Product | null))
    ),
    { initialValue: undefined }
  );

  protected readonly quantity = signal(1);
  protected readonly adding = signal(false);

  decreaseQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  increaseQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  addToBasket(product: Product): void {
    // The catalog is deliberately public (Phase 2) but the basket is not - send an anonymous
    // visitor to log in rather than let the POST fail and get swept into the refresh/logout flow.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.adding.set(true);
    this.basketService.addItem(product, this.quantity()).subscribe({
      next: () => {
        this.adding.set(false);
        this.quantity.set(1);
        this.notifications.success(`Added ${product.name} to your basket`, { action: 'View Basket' })
          .onAction()
          .subscribe(() => this.router.navigateByUrl('/basket'));
      },
      error: () => this.adding.set(false),
    });
  }
}
