import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-section-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-title.html',
  styleUrls: ['./section-title.scss']
})
export class SectionTitle {
  @Input() title!: string;
}
