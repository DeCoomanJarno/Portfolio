import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface Translations {
  [key: string]: string | Translations; // Allow for nested translations
}
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public defaultLang = 'EN'; // Default to English
  private currentLangSubject = new BehaviorSubject<string>(this.defaultLang); // Create a BehaviorSubject to hold the current language
  currentLanguage$ = this.currentLangSubject.asObservable(); // Expose the observable

  private translations: Translations = {}; // Cache for current translations
  private defaultTranslations: Translations = {}; // Cache for default translations

  constructor(private http: HttpClient) {
    // Load default translations at startup
    this.loadTranslations(this.defaultLang);
  }

  // Load a translation file based on the language code
  private loadTranslations(lang: string): void {
    const filePath = `Resources/Json/${lang}/ResourceFile_${lang}.json`; // Construct file path
    this.http.get<Translations>(filePath).pipe(
      catchError(err => {
        console.error(`Error loading translations for language: ${lang}`, err);
        return of({}); // Return an empty object on error
      })
    ).subscribe(translations => {
      this.translations = translations; // Cache the translations
    });

    // Load default translations if the current language is not available
    if (lang === this.defaultLang) {
      this.http.get<Translations>(`Resources/Json/${this.defaultLang}/ResourceFile_${this.defaultLang}.json`)
        .pipe(catchError(() => of({}))) // Catch errors and return empty object
        .subscribe(defaultTranslations => {
          this.defaultTranslations = defaultTranslations; // Cache default translations
        });
    }
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
