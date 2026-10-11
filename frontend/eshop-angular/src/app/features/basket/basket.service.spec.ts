import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BasketService } from './basket.service';
import { API_BASE_URL } from '../../core/api/api-config';
import { Product } from '../../shared/models/product.model';
import { ShoppingCart } from '../../shared/models/shopping-cart.model';

const API_BASE = 'http://test-api';
const BASKET_URL = `${API_BASE}/basket-service/basket`;

const TEST_PRODUCT: Product = {
  id: 'product-1',
  name: 'Test Product',
  categories: ['Test'],
  description: 'A product used only in this test.',
  imageFile: 'test.png',
  price: 100,
};

function emptyCart(): ShoppingCart {
  return { userName: 'test', items: [], totalPrice: 0, checkoutEventId: null };
}

describe('BasketService', () => {
  let service: BasketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: API_BASE },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    // AuthService reports unauthenticated with no stored token, so BasketService's own
    // constructor effect stays on the "clear the cart" branch and issues no HTTP call here.
    service = TestBed.inject(BasketService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('itemCount sums quantities across every line, not the number of distinct products', () => {
    service.loadBasket().subscribe();

    httpMock.expectOne(BASKET_URL).flush({
      cart: {
        ...emptyCart(),
        items: [
          { quantity: 2, color: '', price: 10, discountAmount: 0, effectivePrice: 10, productId: 'a', productName: 'A' },
          { quantity: 3, color: '', price: 10, discountAmount: 0, effectivePrice: 10, productId: 'b', productName: 'B' },
        ],
      },
    });

    expect(service.itemCount()).toBe(5);
  });

  it('addItem() re-fetches the server cart before storing, so it cannot overwrite items it never saw', () => {
    service.addItem(TEST_PRODUCT).subscribe();

    // mutateCart's pre-fetch.
    const getReq1 = httpMock.expectOne(BASKET_URL);
    expect(getReq1.request.method).toBe('GET');
    getReq1.flush({ cart: emptyCart() });

    const postReq = httpMock.expectOne(BASKET_URL);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body.cart.items).toEqual([
      {
        quantity: 1,
        color: '',
        price: 100,
        discountAmount: 0,
        effectivePrice: 100,
        productId: 'product-1',
        productName: 'Test Product',
      },
    ]);
    postReq.flush({ userName: 'test' });

    // mutateCart's post-store reload.
    httpMock.expectOne(BASKET_URL).flush({
      cart: {
        ...emptyCart(),
        items: [
          {
            quantity: 1,
            color: '',
            price: 100,
            discountAmount: 0,
            effectivePrice: 100,
            productId: 'product-1',
            productName: 'Test Product',
          },
        ],
      },
    });

    expect(service.cart()?.items.length).toBe(1);
  });

  it('addItem() increments the existing line instead of adding a duplicate for the same product', () => {
    service.addItem(TEST_PRODUCT, 2).subscribe();

    httpMock.expectOne(BASKET_URL).flush({
      cart: {
        ...emptyCart(),
        items: [
          {
            quantity: 1,
            color: '',
            price: 100,
            discountAmount: 0,
            effectivePrice: 100,
            productId: 'product-1',
            productName: 'Test Product',
          },
        ],
      },
    });

    const postReq = httpMock.expectOne(BASKET_URL);
    expect(postReq.request.body.cart.items).toEqual([
      {
        quantity: 3,
        color: '',
        price: 100,
        discountAmount: 0,
        effectivePrice: 100,
        productId: 'product-1',
        productName: 'Test Product',
      },
    ]);
    postReq.flush({ userName: 'test' });

    httpMock.expectOne(BASKET_URL).flush({ cart: emptyCart() });
  });

  it('updateQuantity() below 1 removes the line instead of storing a zero or negative quantity', () => {
    service.updateQuantity('product-1', 0).subscribe();

    httpMock.expectOne(BASKET_URL).flush({
      cart: {
        ...emptyCart(),
        items: [
          {
            quantity: 1,
            color: '',
            price: 100,
            discountAmount: 0,
            effectivePrice: 100,
            productId: 'product-1',
            productName: 'Test Product',
          },
        ],
      },
    });

    const postReq = httpMock.expectOne(BASKET_URL);
    expect(postReq.request.body.cart.items).toEqual([]);
    postReq.flush({ userName: 'test' });

    httpMock.expectOne(BASKET_URL).flush({ cart: emptyCart() });
  });

  it('clearBasket() calls DELETE and resets the local cart to empty', () => {
    service.clearBasket().subscribe();

    const req = httpMock.expectOne(BASKET_URL);
    expect(req.request.method).toBe('DELETE');
    req.flush({ isSuccess: true });

    expect(service.cart()?.items).toEqual([]);
    expect(service.itemCount()).toBe(0);
  });
});
