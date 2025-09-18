import { Component } from '@angular/core';

import {  RouterModule } from '@angular/router';
import { HeaderComponent } from './Core/Components/header/header';
import { FooterComponent } from './Core/Components/Footer/footer';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentModule } from './WebApplications/appointment/appointment-module';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    imports: [HeaderComponent, RouterModule, FooterComponent, AppointmentModule],
    styleUrls: ['./app.css'],
    providers: []
})
export class AppComponent { 
    constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'nl']);
    translate.setFallbackLang('en');
    
    // Determine initial language (localStorage -> browser -> fallback)
    const savedLang = localStorage.getItem('selected-lang');
    const lang = savedLang || translate.getBrowserLang() || 'en';
    translate.use(lang);

    // Update <html lang="...">
    document.documentElement.lang = lang;

    // Listen to language changes
    translate.onLangChange.subscribe(event => {
      document.documentElement.lang = event.lang;
    });
  }

}
