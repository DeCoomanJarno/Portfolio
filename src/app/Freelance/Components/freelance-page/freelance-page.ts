import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, signal, computed, NgZone, HostListener, ElementRef, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, NgForm } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import html2canvas from 'html2canvas';

// Services & Models
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectCategory, ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CONFIG, ExpertiseItem } from '../../Models/calc-config';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { FormspreeService } from '../../../Core/Services/formspree.service';
import { AnimationsService } from '../../../Core/Services/animations.service';
import { Premium3DAnimationService, XPDesktopApp } from '../../../Core/Services/premium-3d-animation.service';
import { XpOsComponent } from '../xp-os/xp-os';
import { buildProcessXPApp } from '../xp-os/apps/xp-app-process/xp-app-process';
import { buildContactXPApp } from '../xp-os/apps/xp-app-contact/xp-app-contact';

gsap.registerPlugin(ScrollTrigger);

type DesktopAppView = 'terminal' | 'services' | 'process' | 'contact';

interface HeroTerminalLine {
  tone: 'prompt' | 'accent' | 'muted';
  text: string;
}

interface HeroXPScreenContent {
  title: string;
  status: string;
  apps: string[];
  commandLines: string[];
  locale: string;
}

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, ProjectItemComponent, FormsModule, XpOsComponent],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements AfterViewInit, OnDestroy {
  // -- Core State --
  readonly isBrowser: boolean;
  readonly isMobile: boolean;
  readonly selectedCategory = signal<ProjectCategory>(ProjectCategory.All);
  readonly projects = signal<ProjectPreviewModel[]>([]);
  readonly activeDesktopApp = signal<DesktopAppView>('terminal');
  readonly xpApps = signal<XPDesktopApp[]>([]);
  readonly xpOpenAppId = signal<string | null>(null);
  readonly heroTerminalLines = signal<HeroTerminalLine[]>([]);
  readonly heroXPScreenContent = signal<HeroXPScreenContent>({
    title: 'Freelance Workspace',
    status: 'Available for new projects',
    apps: ['Terminal', 'Apps', 'Workflow', 'Contact'],
    commandLines: ['boot freelance-os'],
    locale: 'en-US'
  });

  // -- Config Data --
  readonly categories: ProjectCategory[] = Object.values(ProjectCategory);
  readonly expertise: ExpertiseItem[] = CONFIG.expertises;
  readonly techStack: string[] = ['Unity', 'Angular', 'C#/.NET', 'C++', 'OpenXR', 'Python'];

  // -- Modal & Form State --
  readonly showQuoteModal = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly showFloatingCta = signal(false);
  readonly modelLoadProgress = signal(0);
  readonly modelLoaded = signal(false);

  quoteForm = {
    name: '',
    email: '',
    service: '',
    budget: '',
    description: ''
  };

  // -- Computed --
  readonly filteredProjects = computed(() => {
    const cat = this.selectedCategory();
    const allProjects = this.projects();
    return cat === ProjectCategory.All
      ? allProjects
      : allProjects.filter(p => p.category === cat);
  });

  private observer?: IntersectionObserver;
  @ViewChild('xpCaptureRoot') private xpCaptureRoot?: ElementRef<HTMLElement>;
  private readonly heroCanvasId = 'hero-canvas';
  private heroTypingText: string[] = [];
  private hasViewInitialized = false;
  private isHeroDragging = false;

  private readonly destroyRef = inject(DestroyRef);

  private heroDragPointerId: number | null = null;
  private heroLastPointer = { x: 0, y: 0 };
  private heroPointerDownPos = { x: 0, y: 0 };
  private heroDragDistance = 0;
  private xpCaptureDebounceId: ReturnType<typeof setTimeout> | null = null;
  private xpCaptureRetryId: ReturnType<typeof setTimeout> | null = null;
  private xpCaptureInFlight = false;
  private xpCapturePending = false;
  private xpCaptureBootstrapAttempts = 0;
  heroClockLabel = '';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly ngZone: NgZone,
    private readonly projectService: ProjectService,
    private readonly formspreeService: FormspreeService,
    private readonly translateService: TranslateService,
    private readonly animationsService: AnimationsService,
    private readonly premium3dService: Premium3DAnimationService,
    public readonly commonDataService: CommonDataService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isMobile = this.isBrowser && window.innerWidth < 768;
    this.updateClock();
    this.refreshLocalizedContent();
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
      this.updateClock();
      this.refreshLocalizedContent();
    });

    if (this.isBrowser) {
      this.projectService.getProjects()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(projects => {
        if (projects?.length) {
          this.projects.set(projects);
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => this.setupScrollAnimation(), 150);
          });
        }
      });
    }
  }

  // -- Lifecycle Hooks --

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.hasViewInitialized = true;

    this.ngZone.runOutsideAngular(() => {
      // Let the page paint first, then load the heavy 3D scene
      if (!this.isMobile) {
        requestAnimationFrame(() => {
          setTimeout(() => this.initializeRetroPC(), 0);
        });

        setTimeout(() => {
          this.premium3dService.magneticHover('.f-xp__cell', 0.2);
        }, 500);
      }

      requestAnimationFrame(() => {
        document.querySelectorAll('.f-hero .reveal, .f-hero-mobile .reveal').forEach(el => el.classList.add('active'));
        setTimeout(() => this.setupScrollAnimation(), 150);
        setTimeout(() => this.setupGsapHeroAnimation(), 180);
        if (!this.isMobile) {
          setTimeout(() => this.captureXPScreenNow(), 450);
        }
      });
    });
  }

  private initializeRetroPC(): void {
    // Initialize 3D Retro PC with typing animation
    const canvas = document.getElementById(this.heroCanvasId) as HTMLCanvasElement;
    if (!canvas) {

      return;
    }

    try {
      // Create enhanced 3D scene with Sony PlayStation
      this.premium3dService.createRetroPCScene(this.heroCanvasId, {
        modelPath: '/assets/models/sony-playstation/scene.gltf',
        typingText: this.heroTypingText.length ? this.heroTypingText : ['Jarno De Cooman'],
        typingSpeed: 100,
        screenColor: '#00ff88',
        glowIntensity: 0.8,
        enableOptimization: false,
        maxVertices: 100000,
        screenPosition: { x: 0, y: 0.15, z: 0.01 },
        screenRotation: { x: 0, y: 0, z: 0 },
        screenScale: { x: 1, y: 1 },
        screenMode: 'xpDesktop',
        xpScreenContent: this.heroXPScreenContent(),
        onProgress: (pct) => this.ngZone.run(() => this.modelLoadProgress.set(pct)),
        onLoaded: () => this.ngZone.run(() => {
          this.modelLoadProgress.set(100);
          this.modelLoaded.set(true);
        })
      });
      this.premium3dService.setExternalXPScreenMode(this.heroCanvasId, true);

      // Register desktop apps — easy to add more by pushing to this array
      this.configureXPApps();
    } catch (error) {

      // Fallback to simple gradient background
      this.fallbackHeroBackground();
    }
  }

  private fallbackHeroBackground(): void {
    return;
  }

  private animateFallbackParticles(ctx: CanvasRenderingContext2D): void {
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number}> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * ctx.canvas.width,
        y: Math.random() * ctx.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 183, 194, 0.1)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > ctx.canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > ctx.canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 183, 194, 0.6)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.xpCaptureDebounceId) {
      clearTimeout(this.xpCaptureDebounceId);
      this.xpCaptureDebounceId = null;
    }
    if (this.xpCaptureRetryId) {
      clearTimeout(this.xpCaptureRetryId);
      this.xpCaptureRetryId = null;
    }

    this.premium3dService.dispose(this.heroCanvasId);
    this.observer?.disconnect();
    this.animationsService.killAll();
  }

  // -- Scroll Listener for Floating Button --
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    // Show button after scrolling down 500px
    this.showFloatingCta.set(window.scrollY > 500);
  }

  // -- Navigation & UI Actions --

  setCategory(cat: ProjectCategory): void {
    this.selectedCategory.set(cat);
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.setupScrollAnimation(), 50);
    });
  }


  setDesktopApp(view: DesktopAppView): void {
    this.activeDesktopApp.set(view);
  }
  openXPAppOnScreen(appId: string): void {
    this.xpOpenAppId.set(appId);
    this.premium3dService.openXPApp(this.heroCanvasId, appId);
    this.scheduleXPScreenCapture(30);
  }

  closeXPAppOnScreen(): void {
    this.xpOpenAppId.set(null);
    this.premium3dService.closeXPApp(this.heroCanvasId);
    this.scheduleXPScreenCapture(30);
  }

  runXPAction(action: string): void {
    const [type, target] = action.split(':');
    if (type === 'modal' && target === 'quote') this.openQuoteModal();
    this.scheduleXPScreenCapture(40);
  }

  nudgeHeroModel(delta: { x?: number; y?: number; rotationY?: number; zoom?: number }): void {
    if (!this.isBrowser) return;

    this.premium3dService.nudgeRetroPCScene(this.heroCanvasId, {
      x: delta.x,
      y: delta.y,
      rotationY: delta.rotationY,
      zoom: delta.zoom
    });
  }

  resetHeroModel(): void {
    if (!this.isBrowser) return;
    this.premium3dService.resetRetroPCScene(this.heroCanvasId);
  }

  onHeroScenePointerMove(event: PointerEvent): void {
    if (!this.isBrowser) return;

    const viewport = event.currentTarget as HTMLElement | null;
    if (!viewport) return;

    if (this.isHeroDragging) {
      const deltaX = event.clientX - this.heroLastPointer.x;
      const deltaY = event.clientY - this.heroLastPointer.y;
      this.heroLastPointer = { x: event.clientX, y: event.clientY };
      this.heroDragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      this.premium3dService.nudgeRetroPCScene(this.heroCanvasId, {
        rotationY: deltaX * 0.012,
        y: -deltaY * 0.007,
        x: deltaX * 0.003
      });
    }
  }

  onHeroScenePointerLeave(): void {
    if (!this.isBrowser) return;
    this.premium3dService.setRetroPCPointer(this.heroCanvasId, 0, 0);
    this.isHeroDragging = false;
    this.heroDragPointerId = null;
  }

  onHeroScenePointerDown(event: PointerEvent): void {
    if (!this.isBrowser) return;

    this.isHeroDragging = true;
    this.heroDragPointerId = event.pointerId;
    this.heroLastPointer = { x: event.clientX, y: event.clientY };
    this.heroPointerDownPos = { x: event.clientX, y: event.clientY };
    this.heroDragDistance = 0;

    const viewport = event.currentTarget as HTMLElement | null;
    viewport?.setPointerCapture(event.pointerId);
  }

  onHeroScenePointerUp(event: PointerEvent): void {
    if (!this.isBrowser) return;

    const wasClick = this.heroDragDistance < 8;
    const viewport = event.currentTarget as HTMLElement | null;

    if (this.heroDragPointerId === event.pointerId) {
      this.isHeroDragging = false;
      this.heroDragPointerId = null;
      viewport?.releasePointerCapture(event.pointerId);
    }

    if (wasClick) {
      this.handleHeroClick(event.clientX, event.clientY);
    }
  }

  private handleHeroClick(clientX: number, clientY: number): void {
    const hit = this.resolveDomHitFromModelClick(clientX, clientY)
      ?? this.premium3dService.hitTestXPDesktop(this.heroCanvasId, clientX, clientY);
    if (!hit || hit === 'screen') return;

    if (hit === 'app-close') {
      this.closeXPAppOnScreen();
      return;
    }

    if (hit === 'start') return;

    // hit = 'app-{id}'
    const appId = hit.replace('app-', '');
    this.openXPAppOnScreen(appId);

    // Also fire the app's action (scroll, modal, etc.)
    const apps = this.xpApps();
    const app = apps.find(a => a.id === appId);
    if (app?.action) this.runXPAction(app.action);
  }

  /** Centralised app list — add new apps here */
  private getXPApps(): XPDesktopApp[] {
    return [
      {
        id: 'services',
        iconLabel: this.translateService.instant('freelance.hero.apps.services') || 'Services',
        title: this.translateService.instant('freelance.hero.apps.services') || 'Services',
        renderContent: () => {
          // Rendered via Angular component in the browser overlay.
        }
      },
      buildProcessXPApp(this.translateService),
      buildContactXPApp(this.translateService)
    ];
  }

  private configureXPApps(): void {
    const apps = this.getXPApps();
    this.xpApps.set(apps);
    this.premium3dService.setXPApps(this.heroCanvasId, apps);
    this.scheduleXPScreenCapture(30);

    // Keep currently open window valid after language/data refresh
    if (this.xpOpenAppId() && !apps.some(a => a.id === this.xpOpenAppId())) {
      this.closeXPAppOnScreen();
    }
  }

  private scheduleXPScreenCapture(delayMs = 0): void {
    if (!this.isBrowser) return;
    if (this.xpCaptureDebounceId) clearTimeout(this.xpCaptureDebounceId);
    this.xpCaptureDebounceId = setTimeout(() => {
      this.xpCaptureDebounceId = null;
      this.captureXPScreenNow();
    }, delayMs);
  }

  private captureXPScreenNow(): void {
    if (!this.isBrowser) return;

    if (this.xpCaptureInFlight) {
      this.xpCapturePending = true;
      return;
    }

    const host = this.xpCaptureRoot?.nativeElement;
    if (!host) return;

    this.xpCaptureInFlight = true;

    html2canvas(host, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
      width: host.clientWidth,
      height: host.clientHeight
    })
      .then((frameCanvas) => {
        const painted = this.premium3dService.paintDomCanvasToXPScreen(this.heroCanvasId, frameCanvas);
        if (painted) {
          this.xpCaptureBootstrapAttempts = 0;
          if (this.xpCaptureRetryId) {
            clearTimeout(this.xpCaptureRetryId);
            this.xpCaptureRetryId = null;
          }
        } else {
          this.scheduleXPScreenCaptureRetry();
        }
      })
      .catch(() => {
        this.scheduleXPScreenCaptureRetry();
      })
      .finally(() => {
        this.xpCaptureInFlight = false;
        if (this.xpCapturePending) {
          this.xpCapturePending = false;
          this.scheduleXPScreenCapture(0);
        }
      });
  }

  private scheduleXPScreenCaptureRetry(): void {
    if (!this.isBrowser) return;
    if (this.xpCaptureRetryId) return;
    if (this.xpCaptureBootstrapAttempts >= 30) return;

    this.xpCaptureBootstrapAttempts += 1;
    this.xpCaptureRetryId = setTimeout(() => {
      this.xpCaptureRetryId = null;
      this.scheduleXPScreenCapture(0);
    }, 180);
  }

  private resolveDomHitFromModelClick(clientX: number, clientY: number): string | null {
    const host = this.xpCaptureRoot?.nativeElement;
    if (!host) return null;

    const point = this.premium3dService.mapXPDesktopClickToDrawPoint(this.heroCanvasId, clientX, clientY);
    if (!point) return null;

    const rootRect = host.getBoundingClientRect();
    const xScale = host.clientWidth / point.viewW;
    const yScale = host.clientHeight / point.viewH;
    const domX = point.x * xScale;
    const domY = point.y * yScale;

    const hitTargets = Array.from(host.querySelectorAll<HTMLElement>('[data-xp-hit]'));
    for (let i = hitTargets.length - 1; i >= 0; i--) {
      const target = hitTargets[i];
      const rect = target.getBoundingClientRect();
      const left = rect.left - rootRect.left;
      const top = rect.top - rootRect.top;
      const right = left + rect.width;
      const bottom = top + rect.height;

      if (domX >= left && domX <= right && domY >= top && domY <= bottom) {
        return target.dataset['xpHit'] ?? null;
      }
    }

    return 'screen';
  }

  // -- Modal Logic (UPDATED) --

  /**
   * Opens the quote modal, optionally pre-filling fields based on context
   * @param serviceId - The ID of the expertise (e.g., 'VR', 'WEB')
   * @param budgetType - The budget category (e.g., 'hourly', 'fixed')
   */
  openQuoteModal(serviceId: string = '', budgetType: string = ''): void {
    // Pre-fill form if arguments are provided
    if (serviceId) this.quoteForm.service = serviceId;
    if (budgetType) this.quoteForm.budget = budgetType;

    this.showQuoteModal.set(true);
    this.submitSuccess.set(false);
    this.isSubmitting.set(false);
    document.body.style.overflow = 'hidden';
  }

  closeQuoteModal(): void {
    this.showQuoteModal.set(false);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent) {
    if (
      event.target === event.currentTarget
    ) {
      event.stopPropagation();
      this.closeQuoteModal();
    }

  }

  submitQuote(event: Event, form: NgForm): void {
    event.preventDefault();
    if (form.invalid) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.formspreeService.submitQuote({
      name: this.quoteForm.name,
      email: this.quoteForm.email,
      service: this.quoteForm.service,
      budget: this.quoteForm.budget,
      description: this.quoteForm.description
    }).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);

        // Auto close after 2.5 seconds
        setTimeout(() => {
          this.closeQuoteModal();
          // Reset form to defaults
          this.quoteForm = { name: '', email: '', service: '', budget: '', description: '' };
        }, 2500);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error.message || this.translateService.instant('freelance.quote.errors.submit')
        );

      }
    });
  }

  // TrackBy functions for ngFor
  trackById(index: number, item: any): any {
    return item.id;
  }

  trackByTag(index: number, tag: string): string {
    return tag;
  }

  trackByTerminalLine(index: number, line: HeroTerminalLine): string {
    return `${line.tone}-${line.text}-${index}`;
  }

  trackByCat(index: number, cat: string): string {
    return cat;
  }

  trackByProject(index: number, project: any): any {
    return project.id;
  }

  // Add a visibility flag
  private isHeroVisible = true;

  private setupGsapHeroAnimation(): void {
    if (!this.isBrowser) return;

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const maybeFrom = (selector: string, vars: gsap.TweenVars, position?: string) => {
      if (document.querySelector(selector)) {
        heroTl.from(selector, vars, position);
      }
    };

    maybeFrom('.f-desktop__eyebrow', { opacity: 0, y: 18, duration: 0.4 });
    maybeFrom('.f-desktop__headline-main', { opacity: 0, y: 24, duration: 0.5 }, '-=0.2');
    maybeFrom('.f-desktop__headline-sub', { opacity: 0, y: 24, duration: 0.5 }, '-=0.3');
    maybeFrom('.f-desktop__subtitle', { opacity: 0, y: 18, duration: 0.45 }, '-=0.25');
    maybeFrom('.f-desktop__quick-actions .f-btn', { opacity: 0, y: 16, stagger: 0.1, duration: 0.35 }, '-=0.2');
    maybeFrom('.f-window', { opacity: 0, y: 24, stagger: 0.12, duration: 0.45 }, '-=0.15');
    maybeFrom('.f-desktop__dock button', { opacity: 0, y: 12, stagger: 0.08, duration: 0.25 }, '-=0.2');

    if (document.querySelector('.f-reel__track')) {
      gsap.to('.f-reel__track', {
        duration: 46,
        xPercent: -50,
        repeat: -1,
        ease: 'linear'
      });
    }
  }

  private setupScrollAnimation(): void {
    if (!this.isBrowser) return;
    this.observer?.disconnect();

    const options: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    const elements = document.querySelectorAll('.reveal:not(.active)');
    elements.forEach(el => this.observer?.observe(el));

    // GSAP reveal for project cards when in viewport (fallback if IntersectionObserver is unavailable)
    gsap.utils.toArray('.f-work__cell').forEach((cell: any, index: number) => {
      gsap.fromTo(cell, { y: 30, opacity: 0 }, {
        scrollTrigger: {
          trigger: cell,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.04,
        ease: 'power2.out'
      });
    });
    
    // NEW: Hero visibility observer
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isHeroVisible = entry.isIntersecting;
      });
    }, { threshold: 0 }); // Trigger as soon as it leaves viewport

    const hero = document.querySelector('.f-hero');
    if (hero) heroObserver.observe(hero);

    // Add advanced animations
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Hover lift on capability cells
        this.animationsService.hoverLift('.f-xp__cell');
        
        // Hover lift on approach steps
        this.animationsService.hoverLift('.f-approach__step');
        
        // Enhanced scroll animations
        this.animationsService.animateOnScroll('.f-label', {
          duration: 0.8,
          distance: 40
        });
      }, 100);
    });
  }

  private updateClock(): void {
    const locale = this.translateService.currentLang?.toLowerCase().startsWith('nl') ? 'nl-BE' : 'en-US';
    this.heroClockLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  private refreshLocalizedContent(): void {
    this.translateService.get('freelance').subscribe((freelance: any) => {
      const hero = freelance?.hero ?? {};
      const expertises = freelance?.expertises ?? {};
      const contact = freelance?.contact ?? {};
      const terminal = hero?.terminal ?? {};
      const expertiseTitles = CONFIG.expertises.map(item => expertises[item.id]?.title ?? item.title);

      this.heroTypingText = [
        'Jarno De Cooman',
        hero.title1,
        hero.title2,
        hero.status,
        ...expertiseTitles,
        contact.note
      ].filter((line: string | undefined) => Boolean(line));

      const terminalLines: HeroTerminalLine[] = [
        { tone: 'prompt' as const, text: terminal.boot ?? 'boot freelance-os' },
        { tone: 'accent' as const, text: hero.status ?? '' },
        { tone: 'muted' as const, text: hero.subtitle ?? '' },
        { tone: 'prompt' as const, text: terminal.services ?? 'load services' },
        ...expertiseTitles.slice(0, 5).map((title: string) => ({ tone: 'accent' as const, text: title })),
        { tone: 'prompt' as const, text: terminal.contact ?? 'open contact' },
        { tone: 'muted' as const, text: contact.note ?? '' },
        { tone: 'muted' as const, text: terminal.ready ?? 'workspace ready' }
      ].filter(line => line.text);

      this.heroTerminalLines.set(terminalLines);
      this.heroXPScreenContent.set({
        title: hero?.desktop?.windowTitle ?? 'Freelance Workspace',
        status: hero.status ?? '',
        apps: [
          hero?.apps?.terminal ?? 'Terminal',
          hero?.apps?.services ?? 'Apps',
          hero?.apps?.process ?? 'Workflow',
          hero?.apps?.contact ?? 'Contact'
        ],
        commandLines: terminalLines.map(line => line.text).slice(0, 7),
        locale: this.translateService.currentLang?.toLowerCase().startsWith('nl') ? 'nl-BE' : 'en-US'
      });

      if (this.hasViewInitialized && this.isBrowser) {
        this.premium3dService.dispose(this.heroCanvasId);
        requestAnimationFrame(() => this.initializeRetroPC());
      } else if (this.isBrowser) {
        // Scene already running — just refresh app labels
        this.configureXPApps();
      }
    });
  }
}