import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, HttpBackend } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom, inject } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

// factory gets HttpClient via deps, NOT inject()
export function HttpLoaderFactory(handler: HttpBackend) {
  return new MultiTranslateHttpLoader(handler, [
    { prefix: './Resources/Json/i18n/Common/', suffix: '.json' },
    { prefix: './Resources/Json/i18n/Resume/resume.', suffix: '.json' },
    { prefix: './Resources/Json/i18n/Project/project.', suffix: '.json' },
    { prefix: './Resources/Json/i18n/Project/appointment/appointment.', suffix: '.json' },
  ]);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpBackend] // inject HttpBackend, not HttpClient
        }
      })
    )
  ],
}).catch(err => console.error(err));
