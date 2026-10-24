import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { NotificationService } from './core/notifications/notification.service';
import { BasketService } from './features/basket/basket.service';
import { CatalogSearch } from './features/catalog/catalog-search.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly basketService = inject(BasketService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly catalogSearch = inject(CatalogSearch);

  protected readonly searchControl = new FormControl<string>('', { nonNullable: true });

  protected readonly userInitial = computed(
    () => this.authService.currentUser()?.userName.charAt(0).toUpperCase() ?? ''
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** "Shop" covers the whole shopping flow (list, product, basket, checkout, sign-in), as in the
   *  design - it only steps aside for the sections that have their own nav entry. */
  protected readonly shopActive = computed(() => {
    const url = this.currentUrl();
    return !['/orders', '/admin', '/account'].some((prefix) => url.startsWith(prefix));
  });

  protected readonly isAdmin = computed(() => this.authService.roles().includes('Admin'));

  constructor() {
    // Header -> shared term, debounced 300ms like the product list always did.
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.applySearch(value));

    // Shared term -> input, for changes that did not start here (deep link, "Clear filters").
    effect(() => {
      const term = this.catalogSearch.term();
      if (term !== this.searchControl.value.trim()) {
        this.searchControl.setValue(term, { emitEvent: false });
      }
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.catalogSearch.clear();
  }

  private applySearch(value: string): void {
    this.catalogSearch.set(value);
    // Searching from any other page lands on the product list, which owns the results.
    if (this.router.url.split('?')[0] !== '/products') {
      this.router.navigate(['/products']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.notifications.info('You have been signed out.');
  }
}
