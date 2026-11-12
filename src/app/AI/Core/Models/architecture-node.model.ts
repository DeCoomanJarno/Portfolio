export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'user' | 'frontend' | 'api' | 'database' | 'external';
}

export interface ArchitectureEdge {
  from: string;
  to: string;
}