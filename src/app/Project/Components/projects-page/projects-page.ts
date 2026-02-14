import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../Services/project-service';
import { ProjectPreviewModel } from '../../Models/project-model';
import { ProjectItemComponent } from '../project-item/project-item';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-projects-page',
    imports: [ProjectItemComponent, TranslatePipe],
    templateUrl: './projects-page.html',
    styleUrl: './projects-page.css'
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
