import { Component, Input, OnInit} from '@angular/core';
import { ProjectModel } from '../../Models/project-model';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-project-item',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './project-item.component.html',
  styleUrl: './project-item.component.css'
})
export class ProjectItemComponent implements OnInit{
  @Input() project!: ProjectModel;
  hasMultipleImages : boolean | undefined;

  imageDuration: number = 20; // Duration for each image in seconds
  totalDuration: number = 0; // Total animation duration

  ngOnInit(): void {
    this.hasMultipleImages = this.project.images && this.project.images.length > 1;
    if(this.project.images?.length)
      this.totalDuration = this.project.images.length * this.imageDuration;
  }

  getAnimationDelay(index: number): string {
    return `${index * this.imageDuration}s`;
  }

  getAnimationDuration(): string {
    return `${this.totalDuration}s`;
  }
}
