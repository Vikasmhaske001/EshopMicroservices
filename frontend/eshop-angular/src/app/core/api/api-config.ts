import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

/** Where product pictures are served from: Catalog.Api's static files, reached through the gateway.
 *  A product's stored `imageFile` is just the file name inside this folder. */
export const IMAGE_BASE_URL = new InjectionToken<string>('IMAGE_BASE_URL', {
  providedIn: 'root',
  factory: () => `${inject(API_BASE_URL)}/catalog-service/images/products`,
});
