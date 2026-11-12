import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './Core/Components/header/header';
import { FooterComponent } from './Core/Components/Footer/footer';
import { BackToTopComponent } from './Core/Components/back-to-top/back-to-top';
import { LocaleService } from './Core/Services/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [HeaderComponent, RouterModule, FooterComponent, BackToTopComponent],
  styleUrls: ['./app.scss'],
})
export class AppComponent {

  constructor(localeService: LocaleService) {
    localeService.init();
  }
}
