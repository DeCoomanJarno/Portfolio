import { Component, OnInit } from '@angular/core';
import { ProjectModel } from '../../Models/project-model';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../Services/project-service';

@Component({
  selector: 'app-project-item-page',
  standalone: true,
  imports: [],
  templateUrl: './project-item-page.component.html',
  styleUrl: './project-item-page.component.css'
})
export class ProjectItemPageComponent implements OnInit {
  project: ProjectModel | undefined;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id') || '';
    this.projectService.getProjectById(projectId).subscribe(project => this.project = project); // Find the project by ID
  }

}
