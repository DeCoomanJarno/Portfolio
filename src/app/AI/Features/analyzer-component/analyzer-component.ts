import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalysisStatus } from '../../Core/Models/analysis-status.model';
import { ProjectAnalysis } from '../../Core/Models/project-analysis.model';
import { NovaEngineService } from '../../Core/Services/nova-engine.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ResultDashboard } from '../Dashboard/result-dashboard/result-dashboard';

@Component({
  selector: 'app-analyzer-component',
  imports: [CommonModule, FormsModule, TranslateModule, ResultDashboard],
  templateUrl: './analyzer-component.html',
  styleUrl: './analyzer-component.scss'
})
export class AnalyzerComponent implements OnDestroy {
  rawDescription = '';
  state: 'input' | 'processing' | 'resolved' = 'input';
  steps: AnalysisStatus[] = [];
  analysisOutput: ProjectAnalysis | null = null;
  private sub?: Subscription;

  constructor(private engine: NovaEngineService) {}

  runAnalysis(): void {
    if (!this.rawDescription.trim()) return;

    this.sub?.unsubscribe();

    this.state = 'processing';
    this.steps = [];
    this.analysisOutput = null;

    this.sub = this.engine.analyze(this.rawDescription).subscribe({
      next: (payload) => {
        this.steps = payload.steps;
        if (payload.result) {
          this.analysisOutput = payload.result;
        }
      },
      complete: () => {
        setTimeout(() => {
          this.state = 'resolved';
        }, 600);
      },
      error: () => {
        this.state = 'input';
        this.steps = [];
      }
    });
  }

  onReset(): void {
    this.sub?.unsubscribe();
    this.state = 'input';
    this.rawDescription = '';
    this.analysisOutput = null;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}