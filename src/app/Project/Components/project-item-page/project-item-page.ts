import { AfterViewInit, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ProjectModel, ProjectPreviewModel } from '../../Models/project-model';
import { ProjectService } from '../../Services/project-service';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { MatTooltipModule } from "@angular/material/tooltip";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare var bootstrap: any;

@Component({
  selector: 'app-project-item-page',
  standalone: true,
  imports: [IconPipe, TranslatePipe, MatTooltipModule],
  templateUrl: './project-item-page.html',
  styleUrl: './project-item-page.css'
})
export class ProjectItemPageComponent implements OnInit, AfterViewInit {
  project: ProjectModel | undefined;
  projectPreviewModel: ProjectPreviewModel | undefined;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id') || '';

    // Load static preview info
    this.projectService.getProjectById(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(preview => this.projectPreviewModel = preview);

    // Load localized project data on language change
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadProject(projectId);
      });

    // Initial load
    this.loadProject(projectId);
  }

  private loadProject(projectId: string) {
    this.projectService.getProjectJsonById(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(project => {
        this.project = project;
        setTimeout(() => this.initializeEnhancements());
      });
  }

  ngAfterViewInit(): void {
    this.initializeEnhancements();
  }

  private initializeEnhancements(): void {
    hljs.highlightAll();
    const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
    tooltipElements.forEach(el => new bootstrap.Tooltip(el));
  }

  ConvertToHTML(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  copyCode(code: string, button: EventTarget | null) {
    navigator.clipboard.writeText(code).then(() => {
      this.translate.get('Project.Copied').subscribe(msg => {
        const tooltip = new bootstrap.Tooltip(button, { title: msg, trigger: 'manual' });
        tooltip.show();
        setTimeout(() => tooltip.hide(), 1000);
      });
    });
  }
}
