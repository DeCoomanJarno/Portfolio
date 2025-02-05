import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { ProjectModel, ProjectPreviewModel } from '../../Models/project-model';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../Services/project-service';
import { LanguageService } from '../../../Core/Services/language.service';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // You can choose any style you like
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
declare var bootstrap: any; // Ensure Bootstrap JS is recognized

@Component({
  selector: 'app-project-item-page',
  standalone: true,
  imports: [IconPipe],
  templateUrl: './project-item-page.component.html',
  styleUrl: './project-item-page.component.css'
})
export class ProjectItemPageComponent implements OnInit, AfterViewInit, AfterViewChecked {
  project: ProjectModel | undefined;
  projectPreviewModel: ProjectPreviewModel | undefined;
  isHighlighted: boolean = false;

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private projectService: ProjectService, private languageService: LanguageService) {}

  ConvertToHTML(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  ngAfterViewInit(): void {
  }
  
  ngAfterViewChecked(): void {
    if(!this.isHighlighted && this.project) 
      {
        const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
        tooltipElements.forEach(el => new bootstrap.Tooltip(el));
        hljs.highlightAll();
        this.isHighlighted = true;
      } 
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id') || '';
    this.projectService.getProjectById(projectId).subscribe(project => this.projectPreviewModel = project); // Find the project by ID
    this.languageService.currentLanguage$.subscribe(curLang => this.projectService.getProjectJsonById(projectId, curLang).subscribe(project => this.project = project)); // Find the project by ID)
 
  }
  
  copyCode(code: string, button: EventTarget | null) {
    navigator.clipboard.writeText(code).then(() => {
      const tooltip = new bootstrap.Tooltip(button, {
        title: 'Copied!',
        trigger: 'manual',
      });
      tooltip.show();

      // Hide tooltip after 2 seconds
      setTimeout(() => tooltip.hide(), 1000);
    });
  }
  
}
