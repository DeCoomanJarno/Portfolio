import { Component, OnInit } from '@angular/core';
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item.component';
import { ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CommonData, CommonDataService } from '../../../Core/Services/common-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../../../Resume/Services/resume.service';
import { ResumeData } from '../../../Resume/Models/ResumeData.model';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProjectItemComponent, TranslateModule, RouterLink, AsyncPipe],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  public projects: ProjectPreviewModel[] = [];
  public commonData!: CommonData;
  public resumeData$  // <-- direct observable

  constructor(
    private projectService: ProjectService,
    private commonDataService: CommonDataService,
    private resumeService: ResumeService
  ) {
    this.resumeData$ = this.resumeService.resumeData$;
  }

  ngOnInit(): void {
    this.commonDataService.commonData$.subscribe(data => {
      if (data) {
        this.commonData = data;
        this.loadProjects(data.home.projects);
      }
    });
  }

  private loadProjects(projectIds: string[]) {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data.filter(pr => projectIds.includes(pr.id));
    });
  }

}
