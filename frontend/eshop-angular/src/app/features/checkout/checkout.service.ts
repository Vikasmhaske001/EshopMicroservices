import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';

// The catalog price/CVV length are real constraints; nothing here talks to a real payment
// processor - see docs/ANGULAR_IMPLEMENTATION_PLAN.md Phase 5.
export interface BasketCheckoutRequest {
  userName: string;
  customerId: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}

export interface CheckoutResult {
  isSuccess: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly checkoutUrl = `${inject(API_BASE_URL)}/basket-service/basket/checkout`;

  checkout(dto: BasketCheckoutRequest): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(this.checkoutUrl, { basketCheckoutDto: dto });
  }
}
