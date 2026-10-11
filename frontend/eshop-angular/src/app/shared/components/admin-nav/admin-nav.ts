import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Switches between the admin screens. Without it Orders could only be reached by typing the URL. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="admin-nav" aria-label="Admin sections">
      <a routerLink="/admin/products" routerLinkActive="active">Products</a>
      <a routerLink="/admin/orders" routerLinkActive="active">Orders</a>
    </nav>
  `,
  styleUrl: './admin-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNav {}
