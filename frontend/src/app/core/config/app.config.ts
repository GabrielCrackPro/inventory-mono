import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { errorInterceptor } from '@core/interceptors/error';
import { loadingInterceptor } from '@core/interceptors/loading';
import { tokenInterceptor } from '@core/interceptors/token';
import { routes } from './app.routes';
import { iconProviders } from './icon.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([errorInterceptor, tokenInterceptor, loadingInterceptor])),
    ...iconProviders,
    provideAnimationsAsync(),
  ],
};
