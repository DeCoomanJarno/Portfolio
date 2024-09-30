import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProjectModel } from '../Models/project-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private jsonUrl = 'Resources/Projects.json'; // Path relative to the src folder

  constructor(private http: HttpClient) { }

  getProjects(): Observable<ProjectModel[]> {
    return this.http.get<ProjectModel[]>(this.jsonUrl).pipe();
  }
}
