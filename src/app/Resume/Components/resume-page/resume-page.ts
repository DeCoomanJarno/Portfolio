import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ResumeService } from '../../Services/resume.service';
import { CommonDataService } from '../../../Core/Services/common-data.service';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    TranslateModule,
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
