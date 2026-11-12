export interface AnalysisStatus {
  step: string;
  labelKey: string;
  params?: Record<string, string>;
  status: 'pending' | 'processing' | 'completed';
}