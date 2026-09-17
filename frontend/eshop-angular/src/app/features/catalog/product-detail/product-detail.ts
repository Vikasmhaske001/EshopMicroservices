import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of, switchMap } from 'rxjs';
import { CatalogService } from '../catalog.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);

  // undefined = still loading, null = not found / request failed, Product = loaded
  protected readonly product = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.catalogService.getProductById(params.get('id')!)),
      catchError(() => of(null as Product | null))
    ),
    { initialValue: undefined }
  );
}
