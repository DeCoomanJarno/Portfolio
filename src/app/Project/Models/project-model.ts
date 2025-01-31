export interface ProjectModel {
    id: string;
    title: string;
    description: string;
    images?: string[];
    technologies: string[];
    links?: { name: string, url: string }[];  // GitHub, live demo, etc.
    features?: string[];
    challenges?: string[];
    futurePlans?: string[];
    additionalInfo?: string;
  }
  