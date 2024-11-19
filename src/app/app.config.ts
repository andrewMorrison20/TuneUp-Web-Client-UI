import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './authentication/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Register routes
    provideAnimationsAsync(), // Enable animations
    provideHttpClient(), // Register HttpClient
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, // Use class-based interceptor
      multi: true, // Allow multiple interceptors
    },
  ],
};
