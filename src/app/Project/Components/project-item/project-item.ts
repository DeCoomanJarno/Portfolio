import { AfterViewInit, Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import { ProjectPreviewModel } from '../../Models/project-model';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser, NgClass, NgStyle } from '@angular/common';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';
import { TranslatePipe } from '@ngx-translate/core';
declare var bootstrap: any; // Ensure Bootstrap JS is recognized

@Component({
    selector: 'app-project-item',
    imports: [RouterLink, IconPipe, NgClass, TranslatePipe],
    templateUrl: './project-item.html',
    styleUrl: './project-item.css'
})
export class ProjectItemComponent implements OnInit, AfterViewInit {
  @Input() project!: ProjectPreviewModel;
  hasMultipleImages : boolean | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
      tooltipElements.forEach(el => new bootstrap.Tooltip(el));
    }
  }

  ngOnInit(): void {
    this.hasMultipleImages = this.project.images && this.project.images.length > 1;
  }
}
