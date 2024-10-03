import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LanguageService } from '../../Core/Services/language.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(private http: HttpClient, private languageService: LanguageService) {}

  // Load resume data based on the current language
  getResumeData(lang: string): Observable<any> {
    const filePath = `Resources/Json/${lang}/Resume_${lang}.json`; // Path to the JSON file based on language
    return this.http.get(filePath).pipe(
      catchError(() => this.getFallbackResumeData()), // Fall back to default language if error occurs
    );
  }

  // Get fallback resume data in case the desired language file doesn't exist
  private getFallbackResumeData(): Observable<any> {
    const filePath = `Resources/Json/${this.languageService.defaultLang}/Resume_${this.languageService.defaultLang}.json`; // Path to the JSON file based on language
    return this.http.get(filePath).pipe(
      catchError(() => of({})) // Return an empty object on error
    );
  }
}
