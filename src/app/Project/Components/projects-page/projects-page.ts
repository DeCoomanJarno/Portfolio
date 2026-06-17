import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

import { ProjectService } from '../../Services/project-service';
import { ProjectCategory, ProjectPreviewModel } from '../../Models/project-model';
import { ProjectItemComponent } from '../project-item/project-item';

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectItemComponent, TranslatePipe],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss'
})
export class ProjectsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly allProjects = signal<ProjectPreviewModel[]>([]);

  readonly categories = Object.values(ProjectCategory);
  readonly selectedCategory = signal<ProjectCategory>(ProjectCategory.All);

  readonly projects = computed(() => {
    const category = this.selectedCategory();
    const projects = this.allProjects();
    return category === ProjectCategory.All
      ? projects
      : projects.filter(project => project.category === category);
  });

  constructor(projectService: ProjectService) {
    projectService.getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => this.allProjects.set(projects ?? []));
  }
}
