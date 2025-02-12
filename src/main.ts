import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import '@material/web/all';
import 'bootstrap';
import {provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes,withHashLocation()) // Enables hash-based routing
  ]
}).catch(err => console.error(err));
