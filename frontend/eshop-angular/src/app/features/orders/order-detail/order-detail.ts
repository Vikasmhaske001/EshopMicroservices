import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Order, getOrderStatusLabel, getOrderTotal } from '../../../shared/models/order.model';
import { OrdersService } from '../orders.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, MatButtonModule, CurrencyPipe, LoadingSpinner],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);

  // undefined = still loading, null = not found / request failed, Order = loaded
  protected readonly order = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const customerId = this.authService.currentUser()?.id;
        const orderId = params.get('id');
        if (!customerId || !orderId) {
          return of(null as Order | null);
        }

        return this.ordersService.getOrdersByCustomer(customerId).pipe(
          map((orders) => orders.find((order) => order.id === orderId) ?? null),
          catchError(() => of(null as Order | null))
        );
      })
    ),
    { initialValue: undefined }
  );

  protected readonly statusLabel = computed(() => {
    const order = this.order();
    return order ? getOrderStatusLabel(order.status) : '';
  });

  protected readonly total = computed(() => {
    const order = this.order();
    return order ? getOrderTotal(order) : 0;
  });

  maskCardNumber(cardNumber: string): string {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  }
}
