import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CatalogLookup } from '../../catalog/catalog-lookup.service';
import { BasketService } from '../basket.service';
import { BasketItem } from '../basket-item/basket-item';

@Component({
  selector: 'app-basket-page',
  imports: [RouterLink, MatProgressBarModule, InrPipe, BasketItem, ProductImage],
  templateUrl: './basket-page.html',
  styleUrl: './basket-page.scss',
})
export class BasketPage {
  protected readonly basketService = inject(BasketService);
  protected readonly categoryById = inject(CatalogLookup).categoryById;
  protected readonly loading = signal(true);

  protected readonly itemCount = this.basketService.itemCount;

  /** Before discounts. Only shown as its own row when some line is actually discounted. */
  protected readonly subtotal = computed(() =>
    (this.basketService.cart()?.items ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  protected readonly discount = computed(() =>
    (this.basketService.cart()?.items ?? []).reduce((sum, item) => sum + item.discountAmount * item.quantity, 0)
  );

  constructor() {
    this.basketService.loadBasket().subscribe({
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  onQuantityChange(productId: string, quantity: number): void {
    this.basketService.updateQuantity(productId, quantity).subscribe();
  }

  onRemove(productId: string): void {
    this.basketService.removeItem(productId).subscribe();
  }

  onClear(): void {
    this.basketService.clearBasket().subscribe();
  }
}
