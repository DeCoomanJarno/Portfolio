import { AfterViewInit, Component, ElementRef, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CommonData, CommonDataService } from '../../../Core/Services/common-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../../../Resume/Services/resume.service';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from '@angularlibrary/ui-lib';
import { SectionTitle } from '../../../Core/Components/section-title/section-title';
import { TimelineItem } from '../../../Core/Components/timeline-item/timeline-item';
import { SkillCard } from '../../../Core/Components/skill-card/skill-card';
import { Certificate } from '../../../Core/Components/certificate/certificate';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProjectItemComponent, TranslateModule, RouterLink, AsyncPipe, ButtonModule, SectionTitle, TimelineItem, SkillCard, Certificate],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePageComponent implements OnInit, AfterViewInit {
  public projects: ProjectPreviewModel[] = [];
  public commonData!: CommonData;
  public resumeData$;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private projectService: ProjectService,
    private commonDataService: CommonDataService,
    private resumeService: ResumeService,
    private el: ElementRef
  ) {
    this.resumeData$ = this.resumeService.resumeData$;
  }

  ngOnInit(): void {
    this.commonDataService.commonData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
      if (data) {
        this.commonData = data;
        this.loadProjects(data.home.projects);
      }
    });
  }
  
ngAfterViewInit(): void {
  const animateContactItems = () => {
    const container = this.el.nativeElement.querySelector('.contact-container');
    if (!container) return;

    const items = container.querySelectorAll('.contact-card-item');
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(items, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.95, 1],
            duration: 800,
            delay: stagger(150),
            easing: 'easeOutCubic'
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);
  };

  // Wait until next tick so async data has rendered
  setTimeout(animateContactItems, 50);
}


  private loadProjects(projectIds: string[]) {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data.filter(pr => projectIds.includes(pr.id));
    });
  }

}
