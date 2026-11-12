import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArchitectureMap } from '../architecture-map/architecture-map';
import { TimelineView } from '../timeline-view/timeline-view';
import { AiOpportunities } from '../ai-opportunities/ai-opportunities';
import { TechnologyList } from '../technology-list/technology-list';
import { SummaryCard } from '../summary-card/summary-card';
import { ProjectAnalysis } from '../../../Core/Models/project-analysis.model';

@Component({
  selector: 'app-result-dashboard',
  imports: [
    CommonModule,
    TranslateModule,
    SummaryCard,
    TechnologyList,
    ArchitectureMap,
    TimelineView,
    AiOpportunities],
  templateUrl: './result-dashboard.html',
  styleUrl: './result-dashboard.scss'
})
export class ResultDashboard {
  @Input() analysis!: ProjectAnalysis | null;
  @Output() reset = new EventEmitter<void>();
}
