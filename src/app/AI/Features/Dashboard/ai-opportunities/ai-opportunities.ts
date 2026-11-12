import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AiOpportunity } from '../../../Core/Models/ai-opportunity.model';

@Component({
  selector: 'app-ai-opportunities',
  imports: [CommonModule, TranslateModule],
  templateUrl: './ai-opportunities.html',
  styleUrl: './ai-opportunities.scss'
})
export class AiOpportunities {
@Input() opportunities: AiOpportunity[] = [];

  difficultyClass(diff: 'Easy' | 'Medium' | 'Hard'): string {
    return (diff || '').toLowerCase();
  }
}
