export interface Metric {
  label?: string;
  labelKey?: string;
  value: number;
}

export interface Service {
  id: string;
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  icon: string;
}

export interface Pricing {
  id: string;
  title?: string;
  titleKey?: string;
  price: string;
  bulletsKey: string[];
  recommended?: boolean;
}

export interface ProcessStep {
  step: number;
  titleKey?: string;
  title?: string;
}

export interface Cases {
  featured: string[];
}

export interface CTA {
  titleKey: string;
  subKey: string;
  buttonKey: string;
}

export interface FreelanceModel {
  meta: {
    slug: string;
    heroTitleKey: string;
    heroSubtitleKey?: string;
    heroLeadKey?: string;
  };
  hero: {
    metrics: Metric[];
  };
  services: Service[];
  pricing: Pricing[];
  process: ProcessStep[];
  cases: Cases;
  cta: CTA;
}
