import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Order matters: errorInterceptor sits outermost so it's the final consumer of any error
    // that survives auth/refresh handling; refreshInterceptor sits closest to the backend so its
    // internal next() calls for a retry go straight through without re-attaching headers via
    // authInterceptor a second time.
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, refreshInterceptor]))
  ]
};
