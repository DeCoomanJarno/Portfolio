import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './Core/Components/header/header';
import { FooterComponent } from './Core/Components/Footer/footer';
import { BackToTopComponent } from './Core/Components/back-to-top/back-to-top';
import { LocaleService } from './Core/Services/locale.service';
import { ThemeService } from './Core/Services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [HeaderComponent, RouterModule, FooterComponent, BackToTopComponent],
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);

  constructor(localeService: LocaleService) {
    localeService.init();
  }
}
