import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./product-admin/product-admin').then((m) => m.ProductAdmin),
  },
  {
    path: 'orders',
    loadComponent: () => import('./order-admin/order-admin').then((m) => m.OrderAdmin),
  },
];
