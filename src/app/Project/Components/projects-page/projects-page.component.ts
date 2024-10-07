import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../Services/project-service';
import { ProjectModel } from '../../Models/project-model';
import { ProjectItemComponent } from '../project-item/project-item.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [ProjectItemComponent],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css'
})
export class ProjectsPageComponent implements OnInit {
  projects: ProjectModel[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data: ProjectModel[]) => {
      this.projects = data;
    });
  }
}