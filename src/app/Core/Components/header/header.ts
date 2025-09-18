import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonDataService } from '../../Services/common-data.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, TranslateModule, MatIconModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  public isDarkMode = false;
  public languages: string[] = [];
  private _currentLang!: string;

  get currentLang() {
    return this._currentLang;
  }

  set currentLang(lang: string) {
    this._currentLang = lang;
    localStorage.setItem('selected-lang', lang); // Opslaan
    this.translateService.use(lang);              // Vertaling laden
  }
  constructor(
    public commonDataService: CommonDataService,
    public translateService: TranslateService
  ) {
    this.languages = [...this.translateService.getLangs()];

    // Herstel taal bij refresh
    const savedLang = localStorage.getItem('selected-lang');
    this._currentLang = savedLang || this.translateService.getBrowserLang() || 'nl';

    // Herstel thema
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyThemeClass();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('color-theme', this.isDarkMode ? 'dark' : 'light');
    this.applyThemeClass();
  }

  private applyThemeClass() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    // any additional logic for switching language
  }
}
