import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { AuthService } from '../../core/auth/auth.service';
import { Product } from '../../shared/models/product.model';
import { ShoppingCart } from '../../shared/models/shopping-cart.model';

const EMPTY_CART: ShoppingCart = { userName: '', items: [], totalPrice: 0, checkoutEventId: null };

@Injectable({ providedIn: 'root' })
export class BasketService {
  private readonly http = inject(HttpClient);
  private readonly basketUrl = `${inject(API_BASE_URL)}/basket-service/basket`;

  private readonly cartSignal = signal<ShoppingCart | null>(null);
  readonly cart = this.cartSignal.asReadonly();
  readonly itemCount = computed(
    () => this.cartSignal()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  constructor() {
    const authService = inject(AuthService);

    // Keep the header badge correct across login/logout without every component having to
    // remember to load or clear the basket itself.
    effect(() => {
      if (authService.isAuthenticated()) {
        this.loadBasket().subscribe({ error: () => {} });
      } else {
        this.cartSignal.set(null);
      }
    });
  }

  loadBasket(): Observable<ShoppingCart> {
    return this.http.get<{ cart: ShoppingCart }>(this.basketUrl).pipe(
      map((res) => res.cart),
      tap((cart) => this.cartSignal.set(cart))
    );
  }

  addItem(product: Product, quantity = 1): Observable<ShoppingCart> {
    return this.mutateCart((cart) => {
      const existing = cart.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          quantity,
          color: '', // the catalog has no color/variant concept - this field is vestigial
          price: product.price,
          discountAmount: 0, // recalculated server-side from Discount.Grpc on every store
          effectivePrice: product.price,
          productId: product.id,
          productName: product.name,
        });
      }
    });
  }

  updateQuantity(productId: string, quantity: number): Observable<ShoppingCart> {
    if (quantity < 1) {
      return this.removeItem(productId);
    }

    return this.mutateCart((cart) => {
      const item = cart.items.find((i) => i.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    });
  }

  removeItem(productId: string): Observable<ShoppingCart> {
    return this.mutateCart((cart) => {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    });
  }

  clearBasket(): Observable<void> {
    return this.http.delete<{ isSuccess: boolean }>(this.basketUrl).pipe(
      map(() => void 0),
      tap(() => this.cartSignal.set(EMPTY_CART))
    );
  }

  /** Always re-fetches the server's current cart before mutating it, rather than trusting
   *  whatever is already in cartSignal - POST /basket replaces the whole cart, so mutating from
   *  stale or absent local state (e.g. adding to basket before the basket page has ever loaded)
   *  would silently wipe out items the server still has. */
  private mutateCart(mutate: (cart: ShoppingCart) => void): Observable<ShoppingCart> {
    return this.loadBasket().pipe(
      switchMap((cart) => {
        const draft: ShoppingCart = { ...cart, items: cart.items.map((item) => ({ ...item })) };
        mutate(draft);
        return this.http.post<{ userName: string }>(this.basketUrl, { cart: draft });
      }),
      switchMap(() => this.loadBasket())
    );
  }
}
