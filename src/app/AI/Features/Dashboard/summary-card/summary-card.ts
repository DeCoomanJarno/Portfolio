import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-summary-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss'
})
export class SummaryCard {
  @Input() title = '';
  @Input() description = '';
  @Input() domainKey = '';
  @Input() confidence = 0;
  @Input() signalKeys: string[] = [];
  @Input() complexity: 'Low' | 'Medium' | 'High' | 'Enterprise' = 'Medium';

  get levelClass(): string {
    return (this.complexity || '').toLowerCase();
  }

}
