import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectModel } from '../Models/project-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private jsonUrl = 'Resources/Json/EN/Projects_EN.json'; // Path relative to the src folder

  constructor(private http: HttpClient) { }

  getProjects(): Observable<ProjectModel[]> {
    return this.http.get<ProjectModel[]>(this.jsonUrl).pipe();
  }

  getProjectById(id: string): Observable<ProjectModel> {
    return this.getProjects().pipe(
      map(projects => projects.find(project => project.id === id)!)
    );
  }
}
