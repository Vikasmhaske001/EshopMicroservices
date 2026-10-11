import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TimeoutError, catchError, first, map, of, switchMap, throwError, timeout, timer } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { EsInput } from '../../../shared/components/form-field/es-input';
import { FormField } from '../../../shared/components/form-field/form-field';
import { ProductImage } from '../../../shared/components/product-image/product-image';
import { AppError } from '../../../shared/models/app-error.model';
import { Order } from '../../../shared/models/order.model';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { AppValidators } from '../../../shared/validators/app-validators';
import { BasketService } from '../../basket/basket.service';
import { CatalogLookup } from '../../catalog/catalog-lookup.service';
import { OrdersService } from '../../orders/orders.service';
import { BasketCheckoutRequest, CheckoutService } from '../checkout.service';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';
const PAYMENT_METHOD_CREDIT_CARD = 1;
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 20000;

@Component({
  selector: 'app-checkout-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InrPipe,
    ErrorBanner,
    EsInput,
    FormField,
    ProductImage,
  ],
  templateUrl: './checkout-form.html',
  styleUrl: './checkout-form.scss',
})
export class CheckoutForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly basketService = inject(BasketService);
  private readonly ordersService = inject(OrdersService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly notifications = inject(NotificationService);
  protected readonly categoryById = inject(CatalogLookup).categoryById;

  protected readonly form = this.fb.nonNullable.group({
    // Limits mirror Ordering.Application's AddressDtoValidator/PaymentDtoValidator, so the user is
    // told here instead of getting a rejected order after the async checkout.
    firstName: ['', [Validators.required, AppValidators.notBlank, AppValidators.personName, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, AppValidators.notBlank, AppValidators.personName, Validators.maxLength(50)]],
    emailAddress: [
      this.authService.currentUser()?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(50)],
    ],
    addressLine: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(180)]],
    country: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(50)]],
    state: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(50)]],
    zipCode: ['', [Validators.required, AppValidators.pincode]],
    cardName: ['', [Validators.required, AppValidators.notBlank, Validators.maxLength(50)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    expiration: [
      '',
      [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), AppValidators.cardNotExpired()],
    ],
    // Ordering stores CVV in a 3-character column, so 4-digit (Amex) codes are not accepted yet.
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  protected readonly submitting = signal(false);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    // Make sure we have the current basket even if the user navigated straight here without
    // visiting /basket first (e.g. a bookmark, or right after logging back in).
    this.basketService.loadBasket().subscribe({ error: () => {} });
  }

  onSubmit(): void {
    const cart = this.basketService.cart();
    if (!cart || cart.items.length === 0) {
      this.errorMessage.set('Your basket is empty - add something before checking out.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const customerId = this.authService.currentUser()?.id;
    if (!customerId) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.statusMessage.set('Placing your order...');

    const dto: BasketCheckoutRequest = {
      userName: '',
      customerId: EMPTY_GUID,
      totalPrice: cart.totalPrice,
      paymentMethod: PAYMENT_METHOD_CREDIT_CARD,
      ...this.form.getRawValue(),
    };

    this.ordersService
      .getOrdersByCustomer(customerId)
      .pipe(
        switchMap((existingOrders) => {
          const existingIds = new Set(existingOrders.map((order) => order.id));

          return this.checkoutService.checkout(dto).pipe(
            switchMap((result) => {
              if (!result.isSuccess) {
                return throwError(() => new Error('ALREADY_CHECKED_OUT'));
              }

              this.statusMessage.set('Confirming your order...');
              // The basket was just deleted server-side by a successful checkout - refresh so
              // the header badge drops to zero instead of showing stale items.
              this.basketService.loadBasket().subscribe({ error: () => {} });

              return this.pollForNewOrder(customerId, existingIds);
            })
          );
        })
      )
      .subscribe({
        next: (order) => {
          this.notifications.success('Order placed successfully. Thank you for shopping with us!');
          this.router.navigate(['/orders', order.id]);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.statusMessage.set(null);
          this.errorMessage.set(this.describeError(error));
        },
      });
  }

  /** Checkout is fire-and-forget over RabbitMQ - Ordering creates the order asynchronously, so
   *  there is no order to redirect to in the checkout response itself. Polling for a new order id
   *  that wasn't in the customer's list before this checkout is the only way to know when (and
   *  which) it landed. */
  private pollForNewOrder(customerId: string, existingIds: Set<string>) {
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.ordersService.getOrdersByCustomer(customerId).pipe(
          // A single failed attempt (transient 5xx, brief network blip) shouldn't kill the whole
          // poll - just treat it as "no new order yet" and let the next tick try again. The
          // overall timeout() below is still the real bound.
          catchError(() => of([] as Order[]))
        )
      ),
      map((orders) => orders.find((order) => !existingIds.has(order.id))),
      first((order): order is Order => order !== undefined),
      timeout(POLL_TIMEOUT_MS)
    );
  }

  private describeError(error: unknown): string {
    if (error instanceof Error && error.message === 'ALREADY_CHECKED_OUT') {
      return 'This basket was already checked out. Refresh your basket and try again.';
    }
    if (error instanceof TimeoutError) {
      return "Your order is taking longer than expected. It's likely still processing - check My Orders shortly.";
    }
    const appError = error as AppError;
    return appError.detail ?? appError.title ?? 'Something went wrong placing your order.';
  }
}
