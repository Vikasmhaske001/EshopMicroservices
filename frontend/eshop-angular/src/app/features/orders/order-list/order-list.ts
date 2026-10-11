import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { Order, getOrderStatusLabel, getOrderTotal } from '../../../shared/models/order.model';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, InrPipe, MatButtonModule, MatProgressBarModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList {
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);

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

  statusLabel(order: Order): string {
    return getOrderStatusLabel(order.status);
  }

  orderTotal(order: Order): number {
    return getOrderTotal(order);
  }
}
