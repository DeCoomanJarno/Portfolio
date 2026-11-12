import { Technology } from './technology.model';
import { ArchitectureNode, ArchitectureEdge } from './architecture-node.model';
import { TimelineItem } from './timeline-item.model';
import { AiOpportunity } from './ai-opportunity.model';

export interface ProjectAnalysis {
  title: string;
  description: string;
  domain: string;
  domainKey: string;
  confidence: number;
  signalKeys: string[];
  complexity: 'Low' | 'Medium' | 'High' | 'Enterprise';
  technologies: Technology[];
  architectureNodes: ArchitectureNode[];
  architectureEdges: ArchitectureEdge[];
  timeline: TimelineItem[];
  aiOpportunities: AiOpportunity[];
  risks: string[];
  recommendations: string[];
}