import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Order, OrderItem, getOrderTotal } from '../../../shared/models/order.model';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CatalogLookup } from '../../catalog/catalog-lookup.service';
import { OrdersService } from '../orders.service';

// Two pictures plus a "+N" tile fit the fixed-width thumbnail column (3 tiles, overlapped).
const MAX_THUMBS = 2;

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, InrPipe, MatProgressBarModule, ProductImage, StatusBadge],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList {
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  protected readonly categoryById = inject(CatalogLookup).categoryById;

  protected readonly loading = signal(true);
  protected readonly orders = signal<Order[]>([]);

  constructor() {
    const customerId = this.authService.currentUser()?.id;
    if (!customerId) {
      this.loading.set(false);
      return;
    }

    this.ordersService.getOrdersByCustomer(customerId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  orderTotal(order: Order): number {
    return getOrderTotal(order);
  }

  itemCount(order: Order): number {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  thumbs(order: Order): OrderItem[] {
    return order.orderItems.slice(0, MAX_THUMBS);
  }

  hiddenThumbs(order: Order): number {
    return Math.max(0, order.orderItems.length - MAX_THUMBS);
  }

  /** "HTC U11+ Plus, IPhone X" - the product names on the order, for a quick scan. */
  productNames(order: Order): string {
    return order.orderItems.map((item) => item.productName).join(', ');
  }
}
