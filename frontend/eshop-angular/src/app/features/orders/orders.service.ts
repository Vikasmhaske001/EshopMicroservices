import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { Order } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${inject(API_BASE_URL)}/ordering-service/orders`;

  // There is no "get one order by id" endpoint for customers (only an Admin-only DELETE shares
  // that path shape) - fetching the customer's orders and finding the one we want is the only
  // way the real API supports this.
  getOrdersByCustomer(customerId: string): Observable<Order[]> {
    return this.http
      .get<{ orders: Order[] }>(`${this.ordersUrl}/customer/${customerId}`)
      .pipe(map((res) => res.orders));
  }
}
