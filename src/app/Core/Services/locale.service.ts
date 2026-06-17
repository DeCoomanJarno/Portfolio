import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'selected-lang';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  readonly languages = ['en', 'nl'];
  readonly current = signal('en');

  init(): void {
    this.translate.addLangs(this.languages);
    this.translate.setFallbackLang('en');

    const saved = this.readStoredLang();
    const browser = this.translate.getBrowserLang();
    const lang = saved ?? (browser && this.languages.includes(browser) ? browser : 'en');
    this.use(lang);
  }

  use(lang: string): void {
    if (!this.languages.includes(lang)) return;
    this.current.set(lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable
    }
  }

  private readStoredLang(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && this.languages.includes(stored) ? stored : null;
    } catch {
      return null;
    }
  }
}
