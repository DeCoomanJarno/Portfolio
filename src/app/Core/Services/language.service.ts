import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public defaultLang = 'en';
  private currentLangSubject = new BehaviorSubject<string>(this.defaultLang);
  currentLanguage$ = this.currentLangSubject.asObservable();

  private translations: Translations = {};
  private defaultTranslations: Translations = {};

  setLanguage(lang: string): void {
    this.currentLangSubject.next(lang);
  }

  getTranslation(id: string): Translations {
    const translation = this.translations[id] || this.defaultTranslations[id] || id;
    return translation as Translations;
  }
}
