import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LanguageService } from '../../Core/Services/language.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(private http: HttpClient, private languageService: LanguageService) {}

  getResumeData(lang: string): Observable<any> {
    const currentLangPath = `Resources/Json/${lang}/Resume_${lang}.json`;
    const defaultLangPath = `Resources/Json/${this.languageService.defaultLang}/Resume_${this.languageService.defaultLang}.json`;
  
    // Fetch current language and default language JSON files
    return forkJoin({
      currentLangData: this.http.get<any>(currentLangPath).pipe(catchError(() => of({}))),
      defaultLangData: this.http.get<any>(defaultLangPath).pipe(catchError(() => of({}))),
    }).pipe(
      map(({ currentLangData, defaultLangData }) => {
        // Deep merge: current language data overwrites the default language data
        return this.deepMerge(defaultLangData, currentLangData);
      })
    );
  }
  
 private deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      // Handle arrays: Merge arrays from source and target
      target[key] = source[key].map((item, index) => {
        if (typeof item === 'object' && target[key]?.[index]) {
          // Recursively merge objects in arrays
          return this.deepMerge(target[key][index] || {}, item);
        }
        return item; // Use source item if not an object or no target item exists
      });
    } else if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Recursively merge objects
      target[key] = this.deepMerge(target[key] || {}, source[key]);
    } else {
      // Overwrite primitive values
      target[key] = source[key];
    }
  }
  return target;
}

}
