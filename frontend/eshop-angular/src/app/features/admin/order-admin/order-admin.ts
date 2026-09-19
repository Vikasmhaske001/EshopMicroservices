import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Order, OrderStatus, getOrderStatusLabel, getOrderTotal } from '../../../shared/models/order.model';
import { PaginationControl } from '../../../shared/components/pagination-control/pagination-control';
import { OrdersService } from '../../orders/orders.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-order-admin',
  imports: [MatFormFieldModule, MatSelectModule, MatProgressBarModule, CurrencyPipe, PaginationControl],
  templateUrl: './order-admin.html',
  styleUrl: './order-admin.scss',
})
export class OrderAdmin {
  private readonly ordersService = inject(OrdersService);

  protected readonly loading = signal(true);
  protected readonly orders = signal<Order[]>([]);
  protected readonly pageIndex = signal(0); // Ordering's own pagination is 0-based
  protected readonly totalPages = signal(1);
  protected readonly updatingId = signal<string | null>(null);

  protected readonly statusOptions = [
    { value: OrderStatus.Draft, label: 'Draft' },
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Completed, label: 'Completed' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' },
  ];

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getAllOrders(this.pageIndex(), PAGE_SIZE).subscribe({
      next: (result) => {
        this.orders.set(result.data);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // PaginationControl is 1-based (matches product-list's convention); Ordering's PageIndex is 0-based.
  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
    this.loadOrders();
  }

  changeStatus(order: Order, status: OrderStatus): void {
    if (order.status === status) {
      return;
    }

    this.updatingId.set(order.id);
    this.ordersService.updateOrder({ ...order, status }).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadOrders();
      },
      error: () => this.updatingId.set(null),
    });
  }

  statusLabel(order: Order): string {
    return getOrderStatusLabel(order.status);
  }

  orderTotal(order: Order): number {
    return getOrderTotal(order);
  }
}
