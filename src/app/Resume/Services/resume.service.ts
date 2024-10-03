import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LanguageService } from '../../Core/Services/language.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  constructor(private http: HttpClient, private languageService: LanguageService) {}

  getResumeData(): Observable<any> {
    return this.languageService.currentLanguage.pipe(
      switchMap((language: any) => {
        const filePath = `Resources/Json/${language}/Resume_${language}.json`;
        return this.http.get(filePath);
      })
    );
  }
}
