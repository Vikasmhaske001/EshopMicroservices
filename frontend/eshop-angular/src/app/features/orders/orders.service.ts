import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { Order } from '../../shared/models/order.model';
import { PaginatedResult } from '../../shared/models/paginated-result.model';

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

  // Admin-only: unfiltered, cross-customer listing. Ordering's pagination is 0-based
  // (PageIndex defaults to 0) - unlike Catalog's 1-based PageNumber, so callers must not
  // assume the two services share a convention.
  getAllOrders(pageIndex = 0, pageSize = 10): Observable<PaginatedResult<Order>> {
    const params = new HttpParams().set('pageIndex', pageIndex).set('pageSize', pageSize);
    return this.http
      .get<{ orders: PaginatedResult<Order> }>(this.ordersUrl, { params })
      .pipe(map((res) => res.orders));
  }

  // Admin-only: the backend has no "update just the status" endpoint - it replaces the whole
  // order, so callers must send back the full OrderDto with only the field(s) they changed.
  updateOrder(order: Order): Observable<void> {
    return this.http
      .put<{ isSuccess: boolean }>(this.ordersUrl, { order })
      .pipe(map(() => void 0));
  }
}
