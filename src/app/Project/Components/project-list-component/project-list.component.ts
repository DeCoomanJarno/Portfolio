import { Component, Injectable, Injector, OnInit } from '@angular/core';
import { ProjectModel } from '../../Models/project-model';
import { ProjectService } from '../../Services/project-service';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-project-list-component',
  standalone: true,
  imports: [RouterLink, HttpClientModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  projects: ProjectModel[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe((data: ProjectModel[]) => {
      this.projects = data;
    });
  }
}