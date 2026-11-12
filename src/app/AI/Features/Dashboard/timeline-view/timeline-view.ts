import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TimelineItem } from '../../../Core/Models/timeline-item.model';

@Component({
  selector: 'app-timeline-view',
  imports: [CommonModule, TranslateModule],
  templateUrl: './timeline-view.html',
  styleUrl: './timeline-view.scss'
})
export class TimelineView {
@Input() timeline: TimelineItem[] = [];
}
