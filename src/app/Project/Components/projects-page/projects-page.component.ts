import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../Services/project-service';
import { ProjectPreviewModel } from '../../Models/project-model';
import { ProjectItemComponent } from '../project-item/project-item.component';

@Component({
    selector: 'app-projects-page',
    imports: [ProjectItemComponent],
    templateUrl: './projects-page.component.html',
    styleUrl: './projects-page.component.css'
})
export class ProjectsPageComponent implements OnInit {
  projects: ProjectPreviewModel[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data: ProjectPreviewModel[]) => {
      this.projects = data;
    });
  }
}