import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { API_BASE_URL } from '../../core/api/api-config';
import { Product } from '../../shared/models/product.model';

const API_BASE = 'http://test-api';
const PRODUCTS_URL = `${API_BASE}/catalog-service/products`;

const TEST_PRODUCT: Product = {
  id: 'product-1',
  name: 'Test Product',
  categories: ['Test'],
  description: 'A product used only in this test.',
  imageFile: 'test.png',
  price: 42,
};

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_BASE },
      ],
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProducts() sends only the params that were actually provided, and unwraps the products envelope', () => {
    let result: unknown;
    service.getProducts({ pageNumber: 2, search: 'phone' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === PRODUCTS_URL && r.params.get('pageNumber') === '2' && r.params.get('search') === 'phone'
    );
    expect(req.request.params.has('category')).toBe(false);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortDirection')).toBe(false);

    req.flush({ products: { pageIndex: 2, pageSize: 10, count: 1, data: [TEST_PRODUCT], totalPages: 1 } });

    expect(result).toEqual({ pageIndex: 2, pageSize: 10, count: 1, data: [TEST_PRODUCT], totalPages: 1 });
  });

  it('getProductById() unwraps the single-product envelope', () => {
    let result: Product | undefined;
    service.getProductById('product-1').subscribe((p) => (result = p));

    httpMock.expectOne(`${PRODUCTS_URL}/product-1`).flush({ product: TEST_PRODUCT });

    expect(result).toEqual(TEST_PRODUCT);
  });

  it('getProductsByCategory() URL-encodes the category and unwraps the flat array envelope', () => {
    let result: Product[] | undefined;
    service.getProductsByCategory('Smart Phone').subscribe((p) => (result = p));

    httpMock.expectOne(`${PRODUCTS_URL}/category/Smart%20Phone`).flush({ products: [TEST_PRODUCT] });

    expect(result).toEqual([TEST_PRODUCT]);
  });

  it('createProduct() POSTs the payload and unwraps the new id', () => {
    let result: string | undefined;
    const { id: _id, ...payload } = TEST_PRODUCT;
    service.createProduct(payload).subscribe((newId) => (result = newId));

    const req = httpMock.expectOne(PRODUCTS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'new-id' });

    expect(result).toBe('new-id');
  });

  it('updateProduct() PUTs the full product', () => {
    service.updateProduct(TEST_PRODUCT).subscribe();

    const req = httpMock.expectOne(PRODUCTS_URL);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(TEST_PRODUCT);
    req.flush({ isSuccess: true });
  });

  it('deleteProduct() sends DELETE to the product-specific URL', () => {
    service.deleteProduct('product-1').subscribe();

    const req = httpMock.expectOne(`${PRODUCTS_URL}/product-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ isSuccess: true });
  });
});
