import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProjectModel, ProjectPreviewModel } from '../Models/project-model';
import { LanguageService } from '../../Core/Services/language.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private jsonUrl = 'Resources/Json/EN/Projects_EN.json'; // Path relative to the src folder

  constructor(private http: HttpClient, private languageService: LanguageService) { }

  getProjects(): Observable<ProjectPreviewModel[]> {
    return this.http.get<ProjectPreviewModel[]>(this.jsonUrl).pipe();
  }

  getProjectById(id: string): Observable<ProjectPreviewModel> {
    return this.getProjects().pipe(
      map(projects => projects.find(project => project.id === id)!)
    );
  }

  getProjectJsonById(id: string, lang: string): Observable<ProjectModel> {
    if(lang == this.languageService.defaultLang)
        return this.http.get<ProjectModel>(`Resources/Projects/${id}/Json/${id}_${lang}.json`);
    return forkJoin({
      curLangData: this.http.get<ProjectModel>(`Resources/Projects/${id}/Json/${id}_${lang}.json`),
      defaultLangData: this.http.get<ProjectModel>(`Resources/Projects/${id}/Json/${id}_${this.languageService.defaultLang}.json`)
        }).pipe(
          map(({ curLangData, defaultLangData }) => {
            // Deep merge: current language data overwrites the default language data
            return this.deepMerge(defaultLangData, curLangData);
          }))
  }
  
deepMerge(target: any, source: any): any {
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
