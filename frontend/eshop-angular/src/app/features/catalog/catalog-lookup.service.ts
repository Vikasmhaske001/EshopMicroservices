import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CatalogService } from './catalog.service';

const EMPTY = new Map<string, string>();

/** Basket and order lines only store a product id and name - no category or image. This looks the
 *  category up once from the catalog (backend max page size, same approach the product list uses
 *  for its category chips) so those screens can draw the right illustration. */
@Injectable({ providedIn: 'root' })
export class CatalogLookup {
  private readonly catalogService = inject(CatalogService);

  /** productId -> first category name. Empty until loaded, and stays empty if the catalog fails. */
  readonly categoryById = toSignal(
    this.catalogService.getProducts({ pageNumber: 1, pageSize: 50 }).pipe(
      map((result) => new Map(result.data.map((p) => [p.id, p.categories[0] ?? ''] as [string, string]))),
      catchError(() => of(EMPTY))
    ),
    { initialValue: EMPTY }
  );
}
