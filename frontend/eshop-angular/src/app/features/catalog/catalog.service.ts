import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-config';
import { PaginatedResult } from '../../shared/models/paginated-result.model';
import { Product } from '../../shared/models/product.model';

export interface GetProductsParams {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price';
  sortDirection?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${inject(API_BASE_URL)}/catalog-service/products`;

  getProducts(params: GetProductsParams = {}): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    }

    return this.http
      .get<{ products: PaginatedResult<Product> }>(this.productsUrl, { params: httpParams })
      .pipe(map((res) => res.products));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<{ product: Product }>(`${this.productsUrl}/${id}`)
      .pipe(map((res) => res.product));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<{ products: Product[] }>(`${this.productsUrl}/category/${encodeURIComponent(category)}`)
      .pipe(map((res) => res.products));
  }

  // Admin-only writes (backend enforces AuthorizationPolicies.AdminOnly independently of the
  // adminGuard on the client - this is convenience, not the real access control).
  createProduct(product: Omit<Product, 'id'>): Observable<string> {
    return this.http
      .post<{ id: string }>(this.productsUrl, product)
      .pipe(map((res) => res.id));
  }

  updateProduct(product: Product): Observable<void> {
    return this.http.put<{ isSuccess: boolean }>(this.productsUrl, product).pipe(map(() => void 0));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<{ isSuccess: boolean }>(`${this.productsUrl}/${id}`).pipe(map(() => void 0));
  }
}
