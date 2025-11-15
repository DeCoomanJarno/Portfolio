import { AfterViewInit, Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonDataService } from '../../Services/common-data.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ButtonModule } from '@angularlibrary/ui-lib';
import { HttpClient } from '@angular/common/http';
import { LogoComponent } from "../logo/logo";
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, TranslateModule, MatIconModule, FormsModule, MatFormFieldModule, MatSelectModule, ButtonModule, LogoComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  public isDarkMode = false; 
  public languages: string[] = [];
  private _currentLang!: string;
  private lastScrollTop = 0;

  get currentLang() {
    return this._currentLang;
  }

  set currentLang(lang: string) {
    this._currentLang = lang;
    localStorage.setItem('selected-lang', lang); // Opslaan
    this.translateService.use(lang);              // Vertaling laden
  }
  constructor(private http: HttpClient,    
    public commonDataService: CommonDataService,
    public translateService: TranslateService,
    private router: Router
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
  const navbar = document.querySelector('.navbar') as HTMLElement;
  const collapse = document.querySelector('.navbar-collapse.show') as HTMLElement;
  if (!navbar) return;

  const currentScroll = window.scrollY || document.documentElement.scrollTop;

  // Only hide navbar if menu is NOT open
  if (!collapse) {
    if (currentScroll > this.lastScrollTop && currentScroll > 80) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
  }

  this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('color-theme', this.isDarkMode ? 'dark' : 'light');
    this.applyThemeClass();
  }

  private applyThemeClass() {
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  setLanguage(lang: string) {
    if (lang === this.currentLang) return; // avoid re-setting same lang
    const currentUrl = this.router.url;
    this.currentLang = lang;

    this.translateService.onLangChange
      .pipe(take(1)) // only handle this change
      .subscribe(() => {
        this.router.navigateByUrl(currentUrl);
      });
    this.translateService.use(lang);
  }
}
