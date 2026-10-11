import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CatalogService } from './catalog.service';

interface LookupEntry {
  category: string;
  imageFile: string;
}

const EMPTY = new Map<string, LookupEntry>();

/** Basket and order lines only store a product id and name - no category or picture. This looks
 *  both up once from the catalog (backend max page size, same approach the product list uses for
 *  its category chips) so those screens can draw the right illustration or photo. */
@Injectable({ providedIn: 'root' })
export class CatalogLookup {
  private readonly catalogService = inject(CatalogService);

  private readonly entries = toSignal(
    this.catalogService.getProducts({ pageNumber: 1, pageSize: 50 }).pipe(
      map(
        (result) =>
          new Map(
            result.data.map(
              (p) => [p.id, { category: p.categories[0] ?? '', imageFile: p.imageFile ?? '' }] as [string, LookupEntry]
            )
          )
      ),
      catchError(() => of(EMPTY))
    ),
    { initialValue: EMPTY }
  );

  /** productId -> first category name. Empty until loaded, and stays empty if the catalog fails. */
  readonly categoryById = computed(() => this.project((e) => e.category));

  /** productId -> stored picture file name. */
  readonly imageFileById = computed(() => this.project((e) => e.imageFile));

  private project(pick: (entry: LookupEntry) => string): Map<string, string> {
    return new Map([...this.entries()].map(([id, entry]) => [id, pick(entry)] as [string, string]));
  }
}
