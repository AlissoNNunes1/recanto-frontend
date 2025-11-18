import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './auth/auth-inteceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        return 'https://raw.githubusercontent.com/AlissoNNunes1/recanto-frontend/main/src/assets/${config.src}';
      },
    },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};

// Configuracao global da aplicacao
// Providers de HTTP, animacoes, routing, autenticacao
// Hidratacao do cliente para SSR
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
