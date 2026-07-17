import { Injectable, inject } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ProjectAnalysis } from '../Models/project-analysis.model';
import { AnalysisStatus } from '../Models/analysis-status.model';

interface DomainProfile {
  key: string;
  titleStem: string;
  summaryStem: string;
  keywords: Array<{ term: string; weight: number }>;
  coreTechnologies: ProjectAnalysis['technologies'];
  aiIdeas: ProjectAnalysis['aiOpportunities'];
  baseRisks: string[];
  baseRecommendations: string[];
}

interface RequirementSignals {
  realtime: boolean;
  mobile: boolean;
  payments: boolean;
  auth: boolean;
  analytics: boolean;
  ai: boolean;
  integrations: boolean;
  multitenant: boolean;
  compliance: boolean;
  offline: boolean;
  collaboration: boolean;
  highTraffic: boolean;
  search: boolean;
  notifications: boolean;
}

interface AnalysisContext {
  normalizedInput: string;
  tokenCount: number;
  profile: DomainProfile;
  confidence: number;
  signals: RequirementSignals;
}

@Injectable({
  providedIn: 'root'
})
export class NovaEngineService {
  private readonly translate = inject(TranslateService);

  private readonly profiles: DomainProfile[] = [
    {
      key: 'hospitality',
      titleStem: 'DineFlow',
      summaryStem: this.t('ai.profileCopy.hospitality.summaryStem'),
      keywords: [
        { term: 'restaurant', weight: 3 },
        { term: 'menu', weight: 2 },
        { term: 'table', weight: 3 },
        { term: 'booking', weight: 2 },
        { term: 'reservation', weight: 3 },
        { term: 'food', weight: 2 },
        { term: 'kitchen', weight: 2 },
        { term: 'waiter', weight: 1 },
        { term: 'hospitality', weight: 2 },
        { term: 'delivery', weight: 1 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: this.t('ai.profileCopy.hospitality.coreTechnologies.angular20') },
        { name: 'ASP.NET Core API', category: 'Backend', explanation: this.t('ai.profileCopy.hospitality.coreTechnologies.aspNetCoreApi') },
        { name: 'PostgreSQL', category: 'Database', explanation: this.t('ai.profileCopy.hospitality.coreTechnologies.postgresql') },
        { name: 'Redis', category: 'Infrastructure', explanation: this.t('ai.profileCopy.hospitality.coreTechnologies.redis') }
      ],
      aiIdeas: [
        { name: 'Demand-aware table allocator', description: this.t('ai.profileCopy.hospitality.aiIdeas.demandAware.description'), businessValue: this.t('ai.profileCopy.hospitality.aiIdeas.demandAware.businessValue'), difficulty: 'Medium' },
        { name: 'Order anomaly detector', description: this.t('ai.profileCopy.hospitality.aiIdeas.orderAnomaly.description'), businessValue: this.t('ai.profileCopy.hospitality.aiIdeas.orderAnomaly.businessValue'), difficulty: 'Medium' }
      ],
      baseRisks: [
        this.t('ai.profileCopy.hospitality.baseRisks.peakHour'),
        this.t('ai.profileCopy.hospitality.baseRisks.dashboardDrift')
      ],
      baseRecommendations: [
        this.t('ai.profileCopy.hospitality.baseRecommendations.transactionIsolation'),
        this.t('ai.profileCopy.hospitality.baseRecommendations.eventStream')
      ]
    },
    {
      key: 'commerce',
      titleStem: 'ApexCart',
      summaryStem: 'catalog management, checkout reliability, and growth operations',
      keywords: [
        { term: 'shop', weight: 3 },
        { term: 'store', weight: 3 },
        { term: 'ecommerce', weight: 3 },
        { term: 'e-commerce', weight: 3 },
        { term: 'checkout', weight: 3 },
        { term: 'product', weight: 2 },
        { term: 'catalog', weight: 2 },
        { term: 'cart', weight: 3 },
        { term: 'stripe', weight: 3 },
        { term: 'payment', weight: 2 }
      ],
      coreTechnologies: [
        { name: 'Angular SSR', category: 'Frontend', explanation: 'Improves SEO and first-load performance for catalog-heavy pages.' },
        { name: 'Node.js + NestJS', category: 'Backend', explanation: 'Modular API surface for checkout, inventory, and fulfillment flows.' },
        { name: 'PostgreSQL', category: 'Database', explanation: 'ACID guarantees for orders, refunds, and inventory consistency.' },
        { name: 'CDN + Edge Cache', category: 'Infrastructure', explanation: 'Stabilizes response times for global catalog and media traffic.' }
      ],
      aiIdeas: [
        { name: 'Intent-based product ranking', description: 'Blend behavioral and semantic signals to surface high-conversion products.', businessValue: 'Improves conversion and average order value.', difficulty: 'Medium' },
        { name: 'Price elasticity assistant', description: 'Estimate demand response to price shifts by category and season.', businessValue: 'Protects margin while sustaining conversion.', difficulty: 'Hard' }
      ],
      baseRisks: [
        'Inventory oversell can happen under concurrent checkout bursts.',
        'Checkout abandonment rises if latency spikes in payment callbacks.'
      ],
      baseRecommendations: [
        'Use idempotency keys on payment and order endpoints.',
        'Implement inventory reservation windows with automatic release.'
      ]
    },
    {
      key: 'xr-training',
      titleStem: 'ImmersivePilot',
      summaryStem: 'real-time simulation, telemetry, and training analytics',
      keywords: [
        { term: 'vr', weight: 3 },
        { term: 'virtual reality', weight: 3 },
        { term: 'ar', weight: 2 },
        { term: 'unity', weight: 3 },
        { term: 'simulation', weight: 2 },
        { term: 'training', weight: 2 },
        { term: 'game', weight: 1 },
        { term: '3d', weight: 2 },
        { term: 'telemetry', weight: 2 }
      ],
      coreTechnologies: [
        { name: 'Unity', category: 'Frontend', explanation: 'Delivers immersive runtime interactions and visual simulation scenes.' },
        { name: 'NestJS WebSocket Gateway', category: 'Backend', explanation: 'Streams low-latency telemetry and state updates to operators.' },
        { name: 'MongoDB', category: 'Database', explanation: 'Captures event-rich telemetry documents for replay and analytics.' },
        { name: 'Event Bus', category: 'Infrastructure', explanation: 'Decouples ingestion, analytics, and alerting pipelines at scale.' }
      ],
      aiIdeas: [
        { name: 'Adaptive scenario difficulty engine', description: 'Adjust simulation conditions in-session from operator performance signals.', businessValue: 'Accelerates training outcomes and retention.', difficulty: 'Hard' },
        { name: 'Failure precursor classifier', description: 'Detect motion and decision patterns that correlate with likely errors.', businessValue: 'Reduces incident rates and repeat training cost.', difficulty: 'Hard' }
      ],
      baseRisks: [
        'End-to-end latency above acceptable thresholds degrades simulation quality.',
        'Telemetry ingestion can become a bottleneck under dense real-time streams.'
      ],
      baseRecommendations: [
        'Define strict latency budgets and continuously profile frame and network timing.',
        'Use batched ingestion and back-pressure controls for telemetry pipelines.'
      ]
    },
    {
      key: 'enterprise-saas',
      titleStem: 'NovaCore',
      summaryStem: 'multi-team workflows, reporting, and operational visibility',
      keywords: [
        { term: 'saas', weight: 3 },
        { term: 'enterprise', weight: 3 },
        { term: 'crm', weight: 2 },
        { term: 'dashboard', weight: 2 },
        { term: 'workflow', weight: 2 },
        { term: 'portal', weight: 2 },
        { term: 'admin', weight: 2 },
        { term: 'tenant', weight: 2 },
        { term: 'management', weight: 1 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: 'Component-driven admin UX for workflows and analytics dashboards.' },
        { name: 'Node.js + Express', category: 'Backend', explanation: 'Rapid service layer for policy enforcement and workflow APIs.' },
        { name: 'PostgreSQL', category: 'Database', explanation: 'Structured persistence for users, permissions, and business entities.' },
        { name: 'Docker + Cloud Run', category: 'Infrastructure', explanation: 'Portable, repeatable deployment model for team environments.' }
      ],
      aiIdeas: [
        { name: 'Executive narrative generator', description: 'Convert KPI streams into concise weekly business summaries.', businessValue: 'Saves reporting hours and improves decision velocity.', difficulty: 'Medium' },
        { name: 'Churn risk monitor', description: 'Score account disengagement from product activity and support signals.', businessValue: 'Supports proactive retention interventions.', difficulty: 'Medium' }
      ],
      baseRisks: [
        'Tenant boundary mistakes can expose cross-account data.',
        'Permission complexity can create inconsistent authorization behavior.'
      ],
      baseRecommendations: [
        'Enforce tenant scoping in repository and service layers by default.',
        'Adopt centralized policy checks and authorization middleware tests.'
      ]
    },
    {
      key: 'healthcare',
      titleStem: 'CareBridge',
      summaryStem: 'patient coordination, clinical workflows, and compliant records',
      keywords: [
        { term: 'health', weight: 3 },
        { term: 'healthcare', weight: 3 },
        { term: 'patient', weight: 3 },
        { term: 'clinic', weight: 3 },
        { term: 'medical', weight: 3 },
        { term: 'doctor', weight: 2 },
        { term: 'hospital', weight: 2 },
        { term: 'appointment', weight: 1 },
        { term: 'ehr', weight: 3 },
        { term: 'telehealth', weight: 3 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: 'Accessible clinical UI for scheduling, charts, and care plans.' },
        { name: 'ASP.NET Core API', category: 'Backend', explanation: 'Auditable service layer with strong typing for clinical operations.' },
        { name: 'PostgreSQL', category: 'Database', explanation: 'Relational store with row-level security for protected health data.' },
        { name: 'HL7 FHIR Gateway', category: 'Integration', explanation: 'Standards-based exchange with EHRs, labs, and care systems.' }
      ],
      aiIdeas: [
        { name: 'Triage priority assistant', description: 'Rank incoming cases using symptom and history signals for clinician review.', businessValue: 'Shortens time-to-care for high-risk patients.', difficulty: 'Hard' },
        { name: 'No-show predictor', description: 'Estimate appointment no-show risk to enable proactive reminders and overbooking.', businessValue: 'Improves utilization and access to care.', difficulty: 'Medium' }
      ],
      baseRisks: [
        'Protected health data exposure carries severe regulatory and reputational impact.',
        'Interoperability gaps with legacy clinical systems can block core workflows.'
      ],
      baseRecommendations: [
        'Apply row-level security, encryption at rest, and full access auditing from day one.',
        'Design integrations around HL7 FHIR to reduce custom mapping and vendor lock-in.'
      ]
    },
    {
      key: 'fintech',
      titleStem: 'LedgerPulse',
      summaryStem: 'account operations, transaction integrity, and regulatory reporting',
      keywords: [
        { term: 'fintech', weight: 3 },
        { term: 'bank', weight: 3 },
        { term: 'banking', weight: 3 },
        { term: 'wallet', weight: 3 },
        { term: 'ledger', weight: 3 },
        { term: 'transaction', weight: 2 },
        { term: 'trading', weight: 2 },
        { term: 'invoice', weight: 1 },
        { term: 'loan', weight: 2 },
        { term: 'kyc', weight: 3 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: 'Precise, data-dense UI for accounts, transfers, and statements.' },
        { name: 'Java + Spring Boot', category: 'Backend', explanation: 'Mature, strongly consistent core for ledgers and transaction processing.' },
        { name: 'PostgreSQL', category: 'Database', explanation: 'ACID-compliant double-entry ledger with strict integrity constraints.' },
        { name: 'Kafka', category: 'Infrastructure', explanation: 'Durable event log for auditable, replayable transaction pipelines.' }
      ],
      aiIdeas: [
        { name: 'Fraud anomaly detector', description: 'Score transactions in real time using behavioral and network features.', businessValue: 'Reduces fraud losses and manual review load.', difficulty: 'Hard' },
        { name: 'Spend categorization engine', description: 'Automatically classify transactions to power budgeting insights.', businessValue: 'Improves engagement and financial clarity for users.', difficulty: 'Medium' }
      ],
      baseRisks: [
        'Ledger inconsistency under concurrency can cause unrecoverable financial errors.',
        'Regulatory reporting failures can trigger penalties and loss of licensing.'
      ],
      baseRecommendations: [
        'Model money movements as an append-only double-entry ledger with reconciliation jobs.',
        'Build KYC/AML checks and immutable audit trails into the core transaction path.'
      ]
    },
    {
      key: 'education',
      titleStem: 'LearnForge',
      summaryStem: 'course delivery, learner progress, and engagement analytics',
      keywords: [
        { term: 'education', weight: 3 },
        { term: 'learning', weight: 3 },
        { term: 'course', weight: 3 },
        { term: 'student', weight: 2 },
        { term: 'lms', weight: 3 },
        { term: 'quiz', weight: 2 },
        { term: 'lesson', weight: 2 },
        { term: 'teacher', weight: 2 },
        { term: 'classroom', weight: 2 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: 'Interactive learning UI for lessons, quizzes, and progress views.' },
        { name: 'Node.js + NestJS', category: 'Backend', explanation: 'Modular services for content delivery, grading, and enrollment.' },
        { name: 'PostgreSQL', category: 'Database', explanation: 'Structured model for courses, learners, and assessment results.' },
        { name: 'Object Storage + CDN', category: 'Infrastructure', explanation: 'Efficient delivery of video and rich media learning content.' }
      ],
      aiIdeas: [
        { name: 'Adaptive learning path', description: 'Sequence content dynamically based on mastery and pace signals.', businessValue: 'Improves completion and learning outcomes.', difficulty: 'Hard' },
        { name: 'Automated feedback assistant', description: 'Draft formative feedback on open-ended submissions for educator review.', businessValue: 'Saves grading time and speeds up feedback loops.', difficulty: 'Medium' }
      ],
      baseRisks: [
        'Content delivery at scale can strain bandwidth during peak class hours.',
        'Progress and grading integrity issues undermine trust in the platform.'
      ],
      baseRecommendations: [
        'Cache and stream media through a CDN with adaptive bitrate for reliability.',
        'Version assessments and record immutable submission and grading histories.'
      ]
    },
    {
      key: 'logistics',
      titleStem: 'RouteGrid',
      summaryStem: 'fleet coordination, route optimization, and delivery tracking',
      keywords: [
        { term: 'logistics', weight: 3 },
        { term: 'delivery', weight: 2 },
        { term: 'fleet', weight: 3 },
        { term: 'shipping', weight: 3 },
        { term: 'warehouse', weight: 2 },
        { term: 'route', weight: 3 },
        { term: 'tracking', weight: 2 },
        { term: 'supply chain', weight: 3 },
        { term: 'driver', weight: 2 }
      ],
      coreTechnologies: [
        { name: 'Angular 20', category: 'Frontend', explanation: 'Live operations console with map-based dispatch and tracking.' },
        { name: 'Go + gRPC Services', category: 'Backend', explanation: 'High-throughput services for routing, geofencing, and events.' },
        { name: 'PostgreSQL + PostGIS', category: 'Database', explanation: 'Geospatial store for routes, stops, and location history.' },
        { name: 'Message Queue', category: 'Infrastructure', explanation: 'Reliable delivery of location and status events at fleet scale.' }
      ],
      aiIdeas: [
        { name: 'Dynamic route optimizer', description: 'Continuously re-plan routes from traffic, load, and time-window signals.', businessValue: 'Cuts fuel cost and improves on-time delivery.', difficulty: 'Hard' },
        { name: 'ETA prediction model', description: 'Estimate accurate arrival times using historical and live telemetry.', businessValue: 'Improves customer trust and dispatch planning.', difficulty: 'Medium' }
      ],
      baseRisks: [
        'High-frequency location updates can overwhelm ingestion without back-pressure.',
        'Route logic errors directly translate into missed SLAs and cost overruns.'
      ],
      baseRecommendations: [
        'Use geospatial indexing and batched telemetry ingestion for location streams.',
        'Separate route planning from execution so optimization can iterate safely.'
      ]
    }
  ];

  private readonly fallbackProfile: DomainProfile = {
    key: 'product-platform',
    titleStem: 'ProductForge',
    summaryStem: 'core product capabilities, integrations, and scalable delivery',
    keywords: [],
    coreTechnologies: [
      { name: 'Angular 20', category: 'Frontend', explanation: 'Modern reactive UI for feature-rich product workflows.' },
      { name: 'Node.js + Fastify', category: 'Backend', explanation: 'High-throughput API platform with clear plugin boundaries.' },
      { name: 'PostgreSQL', category: 'Database', explanation: 'Transactional model for durable product and user operations.' },
      { name: 'Docker + CI/CD', category: 'Infrastructure', explanation: 'Reproducible deployment pipeline with automated quality gates.' }
    ],
    aiIdeas: [
      { name: 'Workflow assistant', description: 'Assist users with next-best-action suggestions in complex flows.', businessValue: 'Reduces time-to-completion in core journeys.', difficulty: 'Medium' },
      { name: 'Operational anomaly monitor', description: 'Highlight unusual behavior in usage and system health trends.', businessValue: 'Improves stability and support responsiveness.', difficulty: 'Medium' }
    ],
    baseRisks: [
      'Ambiguous requirements can produce architecture drift across teams.',
      'Missing observability early can hide performance regressions.'
    ],
    baseRecommendations: [
      'Capture explicit non-functional requirements before implementation sprints begin.',
      'Instrument tracing and service metrics from the first release.'
    ]
  };

  private readonly signalLabelKeys: Record<keyof RequirementSignals, string> = {
    realtime: 'ai.signals.realtime',
    mobile: 'ai.signals.mobile',
    payments: 'ai.signals.payments',
    auth: 'ai.signals.auth',
    analytics: 'ai.signals.analytics',
    ai: 'ai.signals.ai',
    integrations: 'ai.signals.integrations',
    multitenant: 'ai.signals.multitenant',
    compliance: 'ai.signals.compliance',
    offline: 'ai.signals.offline',
    collaboration: 'ai.signals.collaboration',
    highTraffic: 'ai.signals.highTraffic',
    search: 'ai.signals.search',
    notifications: 'ai.signals.notifications'
  };

  /**
   * Evaluates input, constructs complete architecture, and streams simulated step statuses.
   */
  analyze(input: string): Observable<{ steps: AnalysisStatus[]; result?: ProjectAnalysis }> {
    const context = this.buildAnalysisContext(input);
    const analysisResult = this.generateAnalysis(input, context);

    const stepsTemplate: AnalysisStatus[] = [
      { step: 'reading', labelKey: 'ai.analyzer.steps.reading', status: 'pending' },
      { step: 'extracting', labelKey: 'ai.analyzer.steps.extracting', status: 'pending' },
      { step: 'detecting', labelKey: 'ai.analyzer.steps.detecting', params: { domain: analysisResult.domain }, status: 'pending' },
      { step: 'evaluating', labelKey: 'ai.analyzer.steps.evaluating', status: 'pending' },
      { step: 'designing', labelKey: 'ai.analyzer.steps.designing', status: 'pending' },
      { step: 'selecting', labelKey: 'ai.analyzer.steps.selecting', status: 'pending' },
      { step: 'generating', labelKey: 'ai.analyzer.steps.generating', status: 'pending' }
    ];

    const stepCount = stepsTemplate.length;

    // Emit progressive pipeline snapshots with slightly varied timing for a more organic feel.
    const simulationObservables = Array.from({ length: stepCount + 1 }).map((_, index) => {
      const stepDelay = 360 + Math.round(Math.random() * 260) + (index === stepCount ? 240 : 0);
      return of(null).pipe(
        delay(stepDelay),
        map(() => {
          const updatedSteps = stepsTemplate.map((step, sIdx) => {
            if (sIdx < index) return { ...step, status: 'completed' as const };
            if (sIdx === index) return { ...step, status: 'processing' as const };
            return { ...step, status: 'pending' as const };
          });

          const isFinished = index === stepCount;
          return {
            steps: updatedSteps,
            result: isFinished ? analysisResult : undefined
          };
        })
      );
    });

    return concat(...simulationObservables);
  }

  private generateAnalysis(input: string, context: AnalysisContext): ProjectAnalysis {
    const complexity = this.estimateComplexity(context);
    const title = `${context.profile.titleStem} ${this.inferProductType(context.normalizedInput)}`;
    const description = this.buildDescription(context, complexity);
    const technologies = this.buildTechnologyStack(context);
    const architecture = this.buildArchitecture(context);
    const timeline = this.buildTimeline(context, complexity);
    const aiOpportunities = this.buildAiOpportunities(context);
    const risks = this.buildRisks(context, complexity);
    const recommendations = this.buildRecommendations(context, complexity);

    return {
      title,
      description,
      domain: `ai.domains.${context.profile.key}`,
      domainKey: `ai.domains.${context.profile.key}`,
      confidence: Math.round(context.confidence * 100),
      signalKeys: this.collectSignalKeys(context.signals),
      complexity,
      technologies,
      architectureNodes: architecture.nodes,
      architectureEdges: architecture.edges,
      timeline,
      aiOpportunities,
      risks,
      recommendations
    };
  }

  private collectSignalKeys(signals: RequirementSignals): string[] {
    return (Object.keys(signals) as Array<keyof RequirementSignals>)
      .filter((key) => signals[key])
      .map((key) => this.signalLabelKeys[key]);
  }

  private buildAnalysisContext(input: string): AnalysisContext {
    const normalizedInput = this.normalizeText(input);
    const tokenCount = normalizedInput.length > 0 ? normalizedInput.split(/\s+/).length : 0;
    const profileMatch = this.matchProfile(normalizedInput);
    const signals = this.extractSignals(normalizedInput);

    return {
      normalizedInput,
      tokenCount,
      profile: profileMatch.profile,
      confidence: profileMatch.confidence,
      signals
    };
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private matchProfile(normalizedInput: string): { profile: DomainProfile; confidence: number } {
    if (!normalizedInput) {
      return { profile: this.fallbackProfile, confidence: 0 };
    }

    const profileScores = this.profiles.map((profile) => {
      const score = profile.keywords.reduce((sum, keyword) => {
        return sum + (this.hasTerm(normalizedInput, keyword.term) ? keyword.weight : 0);
      }, 0);

      return { profile, score };
    });

    profileScores.sort((a, b) => b.score - a.score);

    const best = profileScores[0];
    const second = profileScores[1];

    if (!best || best.score <= 1) {
      return { profile: this.fallbackProfile, confidence: 0.35 };
    }

    const secondScore = second ? second.score : 0;
    const confidence = best.score / (best.score + secondScore + 1);

    if (confidence < 0.45) {
      return { profile: this.fallbackProfile, confidence };
    }

    return { profile: best.profile, confidence };
  }

  private hasTerm(source: string, term: string): boolean {
    if (term.includes(' ')) {
      return source.includes(term);
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(source);
  }

  private extractSignals(normalizedInput: string): RequirementSignals {
    return {
      realtime: this.hasAnyTerm(normalizedInput, ['real-time', 'realtime', 'live', 'socket', 'stream', 'websocket']),
      mobile: this.hasAnyTerm(normalizedInput, ['mobile', 'ios', 'android', 'app', 'pwa']),
      payments: this.hasAnyTerm(normalizedInput, ['payment', 'stripe', 'checkout', 'invoice', 'billing']),
      auth: this.hasAnyTerm(normalizedInput, ['login', 'auth', 'authentication', 'oauth', 'role', 'permissions']),
      analytics: this.hasAnyTerm(normalizedInput, ['analytics', 'report', 'dashboard', 'kpi', 'insights', 'metrics']),
      ai: this.hasAnyTerm(normalizedInput, ['ai', 'assistant', 'ml', 'predict', 'recommendation', 'llm']),
      integrations: this.hasAnyTerm(normalizedInput, ['integration', 'webhook', 'sync', 'erp', 'crm', 'api']),
      multitenant: this.hasAnyTerm(normalizedInput, ['multi-tenant', 'multitenant', 'tenant', 'organization', 'workspace']),
      compliance: this.hasAnyTerm(normalizedInput, ['gdpr', 'hipaa', 'pci', 'soc2', 'compliance', 'audit']),
      offline: this.hasAnyTerm(normalizedInput, ['offline', 'cache', 'sync later']),
      collaboration: this.hasAnyTerm(normalizedInput, ['team', 'collaboration', 'comment', 'approval', 'workflow']),
      highTraffic: this.hasAnyTerm(normalizedInput, ['scale', 'high traffic', 'thousands', 'millions', 'global']),
      search: this.hasAnyTerm(normalizedInput, ['search', 'filter', 'discovery', 'elasticsearch', 'index']),
      notifications: this.hasAnyTerm(normalizedInput, ['notification', 'email', 'sms', 'push', 'reminder', 'alert'])
    };
  }

  private hasAnyTerm(source: string, terms: string[]): boolean {
    return terms.some((term) => this.hasTerm(source, term));
  }

  private inferProductType(normalizedInput: string): string {
    if (this.hasAnyTerm(normalizedInput, ['marketplace', 'commerce', 'store'])) return this.t('ai.productTypes.commerce');
    if (this.hasAnyTerm(normalizedInput, ['booking', 'reservation', 'schedule'])) return this.t('ai.productTypes.operations');
    if (this.hasAnyTerm(normalizedInput, ['dashboard', 'analytics', 'reporting'])) return this.t('ai.productTypes.intelligence');
    if (this.hasAnyTerm(normalizedInput, ['portal', 'workspace'])) return this.t('ai.productTypes.workspace');
    if (this.hasAnyTerm(normalizedInput, ['simulation', 'training', 'vr'])) return this.t('ai.productTypes.simulation');
    return this.t('ai.productTypes.general');
  }

  private estimateComplexity(context: AnalysisContext): ProjectAnalysis['complexity'] {
    const signalValues = Object.values(context.signals);
    const signalCount = signalValues.filter(Boolean).length;

    let score = 1;
    score += signalCount;

    if (context.tokenCount > 50) score += 1;
    if (context.signals.realtime) score += 1;
    if (context.signals.compliance) score += 2;
    if (context.signals.multitenant) score += 2;
    if (context.signals.highTraffic) score += 2;
    if (context.confidence < 0.55) score += 1;

    if (score >= 11) return 'Enterprise';
    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  }

  private buildDescription(context: AnalysisContext, complexity: ProjectAnalysis['complexity']): string {
    const capabilities: string[] = [];
    if (context.signals.auth) capabilities.push(this.t('ai.analysis.capabilities.auth'));
    if (context.signals.realtime) capabilities.push(this.t('ai.analysis.capabilities.realtime'));
    if (context.signals.analytics) capabilities.push(this.t('ai.analysis.capabilities.analytics'));
    if (context.signals.integrations) capabilities.push(this.t('ai.analysis.capabilities.integrations'));
    if (context.signals.mobile) capabilities.push(this.t('ai.analysis.capabilities.mobile'));
    if (context.signals.search) capabilities.push(this.t('ai.analysis.capabilities.search'));

    const capabilityText = capabilities.length
      ? ` ${this.t('ai.analysis.description.prioritizes', { capabilities: capabilities.join(', ') })}`
      : '';

    const confidenceText = context.confidence < 0.5
      ? ` ${this.t('ai.analysis.description.crossDomain')}`
      : '';

    return this.t('ai.analysis.description.base', {
      complexity: complexity.toLowerCase(),
      summaryStem: context.profile.summaryStem
    }) + capabilityText + confidenceText;
  }

  private buildTechnologyStack(context: AnalysisContext): ProjectAnalysis['technologies'] {
    const technologies: ProjectAnalysis['technologies'] = [...context.profile.coreTechnologies];

    if (context.signals.payments) {
      technologies.push({
        name: 'Stripe',
        category: this.t('ai.categories.integration'),
        explanation: 'Payment orchestration with webhooks, idempotency, and dispute handling.'
      });
    }

    if (context.signals.auth) {
      technologies.push({
        name: 'OAuth 2.1 / OpenID Connect',
        category: this.t('ai.categories.integration'),
        explanation: 'Standards-based authentication and delegated authorization for APIs and clients.'
      });
    }

    if (context.signals.realtime) {
      technologies.push({
        name: 'WebSocket + Event Streaming',
        category: this.t('ai.categories.infrastructure'),
        explanation: 'Supports low-latency updates and event-driven processing across services.'
      });
    }

    if (context.signals.analytics) {
      technologies.push({
        name: 'OpenTelemetry',
        category: this.t('ai.categories.infrastructure'),
        explanation: 'Unified traces and metrics to support observability and operational analytics.'
      });
    }

    if (context.signals.search) {
      technologies.push({
        name: 'OpenSearch',
        category: this.t('ai.categories.infrastructure'),
        explanation: 'Full-text search and faceted discovery over product and content data.'
      });
    }

    if (context.signals.notifications) {
      technologies.push({
        name: 'Notification Service',
        category: this.t('ai.categories.integration'),
        explanation: 'Multi-channel email, SMS, and push delivery with templating and retries.'
      });
    }

    if (context.signals.offline) {
      technologies.push({
        name: 'Service Worker Cache',
        category: this.t('ai.categories.frontend'),
        explanation: 'Offline-aware UX with local caching and delayed synchronization.'
      });
    }

    return this.uniqueByName(technologies);
  }

  private buildArchitecture(context: AnalysisContext): {
    nodes: ProjectAnalysis['architectureNodes'];
    edges: ProjectAnalysis['architectureEdges'];
  } {
    const nodes: ProjectAnalysis['architectureNodes'] = [
      { id: 'user', label: this.t('ai.architecture.nodes.user'), type: 'user' },
      { id: 'frontend', label: this.t('ai.architecture.nodes.frontend'), type: 'frontend' },
      { id: 'api', label: this.t('ai.architecture.nodes.api'), type: 'api' },
      { id: 'db', label: this.t('ai.architecture.nodes.database'), type: 'database' }
    ];

    const edges: ProjectAnalysis['architectureEdges'] = [
      { from: 'user', to: 'frontend' },
      { from: 'frontend', to: 'api' },
      { from: 'api', to: 'db' }
    ];

    if (context.signals.mobile) {
      nodes.push({ id: 'mobile', label: this.t('ai.architecture.nodes.mobile'), type: 'frontend' });
      edges.push({ from: 'user', to: 'mobile' }, { from: 'mobile', to: 'api' });
    }

    if (context.signals.realtime) {
      nodes.push({ id: 'events', label: this.t('ai.architecture.nodes.events'), type: 'external' });
      edges.push({ from: 'api', to: 'events' }, { from: 'events', to: 'frontend' });
    }

    if (context.signals.ai) {
      nodes.push({ id: 'ai', label: this.t('ai.architecture.nodes.ai'), type: 'external' });
      edges.push({ from: 'api', to: 'ai' });
    }

    if (context.signals.search) {
      nodes.push({ id: 'search', label: this.t('ai.architecture.nodes.search'), type: 'external' });
      edges.push({ from: 'api', to: 'search' });
    }

    if (context.signals.integrations || context.signals.payments) {
      nodes.push({ id: 'ext', label: this.t('ai.architecture.nodes.external'), type: 'external' });
      edges.push({ from: 'api', to: 'ext' });
    }

    return {
      nodes: this.uniqueById(nodes),
      edges: this.uniqueEdges(edges)
    };
  }

  private buildTimeline(
    context: AnalysisContext,
    complexity: ProjectAnalysis['complexity']
  ): ProjectAnalysis['timeline'] {
    const items: ProjectAnalysis['timeline'] = [
      {
        week: this.t('ai.timeline.weeks.week1'),
        title: this.t('ai.timeline.titles.week1'),
        description: this.t('ai.timeline.descriptions.week1'),
        progress: 100
      },
      {
        week: this.t('ai.timeline.weeks.week2'),
        title: this.t('ai.timeline.titles.week2'),
        description: this.t('ai.timeline.descriptions.week2'),
        progress: complexity === 'Low' ? 80 : 70
      },
      {
        week: this.t('ai.timeline.weeks.week3'),
        title: this.t('ai.timeline.titles.week3'),
        description: this.buildWeekThreeDescription(context),
        progress: complexity === 'Low' ? 35 : 45
      }
    ];

    if (complexity === 'High' || complexity === 'Enterprise') {
      items.push({
        week: this.t('ai.timeline.weeks.week4'),
        title: this.t('ai.timeline.titles.week4'),
        description: this.t('ai.timeline.descriptions.week4'),
        progress: 20
      });
    }

    if (complexity === 'Enterprise') {
      items.push({
        week: this.t('ai.timeline.weeks.week5'),
        title: this.t('ai.timeline.titles.week5'),
        description: this.t('ai.timeline.descriptions.week5'),
        progress: 10
      });
    }

    return items;
  }

  private buildWeekThreeDescription(context: AnalysisContext): string {
    const clauses: string[] = [];

    if (context.signals.integrations || context.signals.payments) {
      clauses.push(this.t('ai.timeline.clauses.integrations'));
    }
    if (context.signals.analytics) {
      clauses.push(this.t('ai.timeline.clauses.analytics'));
    }
    if (context.signals.realtime) {
      clauses.push(this.t('ai.timeline.clauses.realtime'));
    }
    if (context.signals.search) {
      clauses.push(this.t('ai.timeline.clauses.search'));
    }
    if (context.signals.offline) {
      clauses.push(this.t('ai.timeline.clauses.offline'));
    }

    if (clauses.length === 0) {
      return this.t('ai.timeline.descriptions.week3Fallback');
    }

    return this.t('ai.timeline.descriptions.week3', {
      clauses: `${clauses[0].charAt(0).toUpperCase()}${clauses[0].slice(1)}${clauses.length > 1 ? `; ${clauses.slice(1).join('; ')}` : ''}.`
    });
  }

  private buildAiOpportunities(context: AnalysisContext): ProjectAnalysis['aiOpportunities'] {
    const opportunities: ProjectAnalysis['aiOpportunities'] = [...context.profile.aiIdeas];

    if (context.signals.analytics) {
      opportunities.push({
        name: 'Predictive insight engine',
        description: 'Forecast trends and detect anomalies from product and operational metrics.',
        businessValue: 'Improves planning and reduces reactive firefighting.',
        difficulty: 'Medium'
      });
    }

    if (context.signals.ai) {
      opportunities.push({
        name: 'Task copilot assistant',
        description: 'Guide users through complex multi-step workflows with context-aware suggestions.',
        businessValue: 'Increases completion rate and lowers onboarding friction.',
        difficulty: 'Medium'
      });
    }

    if (context.signals.search) {
      opportunities.push({
        name: 'Semantic search ranking',
        description: 'Blend embeddings with behavioral signals to improve result relevance.',
        businessValue: 'Helps users find the right item faster and boosts engagement.',
        difficulty: 'Medium'
      });
    }

    return this.uniqueByName(opportunities).slice(0, 3);
  }

  private buildRisks(
    context: AnalysisContext,
    complexity: ProjectAnalysis['complexity']
  ): string[] {
    const risks: string[] = [...context.profile.baseRisks];

    if (context.signals.compliance) {
      risks.push('Compliance obligations can fail audits without explicit data lineage and retention controls.');
    }
    if (context.signals.multitenant) {
      risks.push('Tenant isolation regressions can leak metadata across customer boundaries.');
    }
    if (context.signals.realtime) {
      risks.push('Event ordering and retry semantics can produce duplicate or stale client state.');
    }
    if (context.confidence < 0.5) {
      risks.push('Mixed-domain requirements may hide conflicting assumptions across modules.');
    }
    if (complexity === 'Enterprise') {
      risks.push('Cross-team delivery dependencies can delay rollout unless ownership boundaries are explicit.');
    }

    return this.uniqueStrings(risks).slice(0, 5);
  }

  private buildRecommendations(
    context: AnalysisContext,
    complexity: ProjectAnalysis['complexity']
  ): string[] {
    const recommendations: string[] = [...context.profile.baseRecommendations];

    if (context.signals.auth) {
      recommendations.push('Model authorization centrally and verify role policies with end-to-end tests.');
    }
    if (context.signals.compliance) {
      recommendations.push('Implement auditable access logs, data retention policies, and automated compliance checks.');
    }
    if (context.signals.highTraffic) {
      recommendations.push('Adopt caching and read-model replicas for high-read workloads before launch events.');
    }
    if (context.signals.notifications) {
      recommendations.push('Centralize notification templates and enforce per-user rate limits and preferences.');
    }
    if (complexity === 'High' || complexity === 'Enterprise') {
      recommendations.push('Split delivery into milestone releases with clear acceptance criteria per capability.');
    }

    return this.uniqueStrings(recommendations).slice(0, 5);
  }

  private uniqueByName<T extends { name: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  }

  private uniqueById<T extends { id: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  private uniqueEdges(edges: ProjectAnalysis['architectureEdges']): ProjectAnalysis['architectureEdges'] {
    const seen = new Set<string>();
    return edges.filter((edge) => {
      const key = `${edge.from}->${edge.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private uniqueStrings(items: string[]): string[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}