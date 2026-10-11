import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Order, getOrderTotal } from '../../../shared/models/order.model';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CatalogLookup } from '../../catalog/catalog-lookup.service';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, InrPipe, LoadingSpinner, ProductImage, StatusBadge],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly ordersService = inject(OrdersService);
  private readonly lookup = inject(CatalogLookup);
  protected readonly categoryById = this.lookup.categoryById;
  protected readonly imageFileById = this.lookup.imageFileById;

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

  protected readonly total = computed(() => {
    const order = this.order();
    return order ? getOrderTotal(order) : 0;
  });

  protected readonly itemCount = computed(
    () => this.order()?.orderItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  maskCardNumber(cardNumber: string): string {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  }
}
