import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BasketService } from '../basket.service';
import { BasketItem } from '../basket-item/basket-item';

@Component({
  selector: 'app-basket-page',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule, CurrencyPipe, BasketItem],
  templateUrl: './basket-page.html',
  styleUrl: './basket-page.scss',
})
export class BasketPage {
  protected readonly basketService = inject(BasketService);
  protected readonly loading = signal(true);

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
