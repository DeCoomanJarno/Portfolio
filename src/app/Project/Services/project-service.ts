import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProjectModel, ProjectPreviewModel } from '../Models/project-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private jsonUrl = 'Resources/Json/Projects.json'; // single source of truth

  constructor(private http: HttpClient) { }

  getProjects(): Observable<ProjectPreviewModel[]> {
    return this.http.get<ProjectPreviewModel[]>(this.jsonUrl);
  }

  getProjectById(id: string): Observable<ProjectPreviewModel | undefined> {
    return this.getProjects().pipe(
      map(projects => projects.find(p => p.id === id))
    );
  }

  getProjectJsonById(id: string): Observable<ProjectModel | undefined> {
    return this.http.get<ProjectModel>(`Resources/Projects/${id}/Json/${id}.json`);
  }
}
