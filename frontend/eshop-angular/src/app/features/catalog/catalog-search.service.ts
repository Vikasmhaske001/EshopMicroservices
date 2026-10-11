import { Injectable, signal } from '@angular/core';

/** The product search term, shared between the header search box (which sits on every page) and
 *  the product list (which filters by it). The header debounces typing; the list just reads. */
@Injectable({ providedIn: 'root' })
export class CatalogSearch {
  private readonly termSignal = signal('');

  readonly term = this.termSignal.asReadonly();

  set(term: string): void {
    this.termSignal.set(term.trim());
  }

  clear(): void {
    this.termSignal.set('');
  }
}
