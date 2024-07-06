import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS, withInterceptorsFromDi} from '@angular/common/http';
import { routes } from './app.routes';

import { provideClientHydration } from '@angular/platform-browser';
import { AuthInterceptor } from './auth/auth-inteceptor.service' // Ajuste o caminho conforme necessário
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';




export const appConfig: ApplicationConfig = {
  providers: [
    {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      return 'https://raw.githubusercontent.com/AlissoNNunes1/recanto-frontend/main/src/assets/${config.src}';

    },
  },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
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
