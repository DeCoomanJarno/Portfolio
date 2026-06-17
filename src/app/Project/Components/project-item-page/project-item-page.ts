import { ChangeDetectionStrategy, Component, DestroyRef, NgZone, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import hljs from 'highlight.js';

import { ProjectModel, ProjectPreviewModel } from '../../Models/project-model';
import { ProjectService } from '../../Services/project-service';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';

@Component({
  selector: 'app-project-item-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconPipe, TranslatePipe, MatTooltipModule, RouterLink],
  templateUrl: './project-item-page.html',
  styleUrl: './project-item-page.scss'
})
export class ProjectItemPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly translate = inject(TranslateService);

  readonly project = signal<ProjectModel | undefined>(undefined);
  readonly preview = signal<ProjectPreviewModel | undefined>(undefined);
  readonly copiedIndex = signal<number | null>(null);

  constructor() {
    const projectId = this.route.snapshot.paramMap.get('id') || '';

    this.projectService.getProjectById(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(preview => this.preview.set(preview));

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadProject(projectId));

    this.loadProject(projectId);
  }

  imageSrc(value: string): string {
    return value.startsWith('http')
      ? value
      : `Resources/Projects/${this.preview()?.id}/Images/${value}`;
  }

  convertToHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  copyCode(code: string, index: number): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 1500);
    });
  }

  private loadProject(projectId: string): void {
    this.projectService.getProjectJsonById(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(project => {
        this.project.set(project);
        this.ngZone.runOutsideAngular(() => setTimeout(() => hljs.highlightAll()));
      });
  }
}
