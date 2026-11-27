/**
 * app.config.ts — Global Angular Application Configuration
 *
 * Registers application-wide providers:
 * - `provideRouter(routes)` for client-side navigation.
 * - `provideHttpClient(withInterceptors([authInterceptor]))` so every HTTP request
 *   automatically passes through `authInterceptor` to attach the JWT token.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
