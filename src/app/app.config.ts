import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';

import { provideClientHydration } from '@angular/platform-browser';
import { AuthInterceptor } from './auth/auth-inteceptor.service' // Ajuste o caminho conforme necessário

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};