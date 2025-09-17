import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Translations {
  [key: string]: string | Translations; // Allow for nested translations
}
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public defaultLang = 'en'; // Default to English
  private currentLangSubject = new BehaviorSubject<string>(this.defaultLang); // Create a BehaviorSubject to hold the current language
  currentLanguage$ = this.currentLangSubject.asObservable(); // Expose the observable

  private translations: Translations = {}; // Cache for current translations
  private defaultTranslations: Translations = {}; // Cache for default translations

  constructor(private http: HttpClient) {
    // Load default translations at startup
    this.loadTranslations(this.defaultLang);
  }

  private loadTranslations(lang: string): void {
  
 
  }
  

  // Set the current language
  setLanguage(lang: string): void {
    this.currentLangSubject.next(lang); // Update the current language
    this.loadTranslations(lang); // Load and cache new language translations
  }

  // Get a translated string by ID, with fallback to ID if not found
  getTranslation(id: string): Translations {
    const translation = this.translations[id] || this.defaultTranslations[id] || id;
    return translation as Translations; // Return the found translation or the ID itself
  }
}
