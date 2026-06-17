import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ui-timeline-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './timeline-item.html',
  styleUrls: ['./timeline-item.scss']
})
export class TimelineItem {
  @Input() title!: string;
  @Input() badge!: string;
  @Input() dates!: string;
  @Input() location!: string;
  @Input() description!: string;
}
