export interface ProjectModel {
  title: string;
  description: string;
  content: { type: 'text' | 'image' | 'code' | 'other', value: string, codeLanguage?: string }[];
  features: string[];
  futurePlans: string[];
  links: { name: string; url: string }[];
  }
  export interface ProjectPreviewModel {
    id: string;
    title: string;
    githubLink: string;
    description: string;
    images?: string[];
    technologies: string[];
  }
  