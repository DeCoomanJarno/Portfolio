import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  private readonly destroyRef = inject(DestroyRef);

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: ProjectPreviewModel[]) => {
      this.projects = data;
    });
  }
}
