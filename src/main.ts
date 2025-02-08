import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import '@material/web/all';
import 'bootstrap';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withHashLocation())] // Enable hash-based routing
}).catch(err => console.error(err));