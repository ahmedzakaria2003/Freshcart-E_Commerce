import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter,  withInMemoryScrolling,  withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { headerInterceptor } from './core/interceptors/header.interceptor';



export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, 
    withViewTransitions(), withInMemoryScrolling({scrollPositionRestoration:"top"})),
     provideClientHydration(),
      provideHttpClient(withFetch() ,    withInterceptors([ headerInterceptor,loadingInterceptor]),
    ),
    provideAnimations(),
    provideToastr(),
    importProvidersFrom(NgxSpinnerModule)

    ]
};
