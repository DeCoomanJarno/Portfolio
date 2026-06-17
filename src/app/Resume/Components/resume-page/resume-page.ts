import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ResumeService } from '../../Services/resume.service';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { TimelineItem } from '../../../Core/Components/timeline-item/timeline-item';
import { SkillCard } from '../../../Core/Components/skill-card/skill-card';
import { Certificate } from '../../../Core/Components/certificate/certificate';
import { SectionTitle } from '../../../Core/Components/section-title/section-title';
import { RevealDirective } from '../../../Core/Directives/reveal.directive';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    TranslateModule,
    TimelineItem,
    SkillCard,
    Certificate,
    SectionTitle,
    RevealDirective
  ],
  templateUrl: './resume-page.html',
  styleUrls: ['./resume-page.scss']
})
export class ResumePageComponent {
  readonly commonDataService = inject(CommonDataService);
  readonly resumeService = inject(ResumeService);
  readonly resumeData$ = this.resumeService.resumeData$;

  downloadPdf(): void {
    window.print();
  }
}
