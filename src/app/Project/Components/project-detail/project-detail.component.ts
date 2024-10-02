import { Component, OnInit } from '@angular/core';
import { ProjectModel } from '../../Models/project-model';
import { ProjectService } from '../../Services/project-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  project: ProjectModel | undefined;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
  }
}