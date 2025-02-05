import { AfterViewInit, Component, Input, OnInit} from '@angular/core';
import { ProjectPreviewModel } from '../../Models/project-model';
import { RouterLink } from '@angular/router';
import { NgClass, NgStyle } from '@angular/common';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';
declare var bootstrap: any; // Ensure Bootstrap JS is recognized

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [RouterLink, IconPipe, NgClass],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.css'
})
export class ProjectItemComponent implements OnInit, AfterViewInit {
  @Input() project!: ProjectPreviewModel;
  hasMultipleImages : boolean | undefined;

  ngAfterViewInit(): void {
  const tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
  tooltipElements.forEach(el => new bootstrap.Tooltip(el));
  }

  ngOnInit(): void {
    this.hasMultipleImages = this.project.images && this.project.images.length > 1;
  }
}
