// freelance-page.ts
import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  NgZone,
  DestroyRef,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, NgForm } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { FormspreeService } from '../../../Core/Services/formspree.service';
import { ThemeService } from '../../../Core/Services/theme.service';
import { HeroWaveField, WavePalette } from './hero-wave-field';
import { ResumeService } from '../../../Resume/Services/resume.service';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_PROJECT_COUNT = 6;
const HERO_ROLE_KEYS = ['agents', 'rag', 'copilots', 'systems'] as const;
const HERO_DEFAULT_WORD_KEY = 'freelance.hero.roles.default';
const HERO_WORD_INTERVAL_MS = 3400;
const SCRAMBLE_GLYPHS = '#<>[]{}/\\=+*·01';
const SCRAMBLE_STEPS = 16;
const SCRAMBLE_TICK_MS = 38;

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, RouterModule, ProjectItemComponent, FormsModule],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollBar', { static: false }) scrollBarRef!: ElementRef<HTMLElement>;
  @ViewChild('heroWordEl', { static: false }) heroWordElRef!: ElementRef<HTMLElement>;
  @ViewChild('heroSection', { static: false }) heroSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('heroCanvas', { static: false }) heroCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('processProgress', { static: false }) processProgressRef!: ElementRef<HTMLElement>;

  private readonly isBrowser  = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ngZone     = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formspree  = inject(FormspreeService);
  private readonly translate  = inject(TranslateService);
  private readonly themeService   = inject(ThemeService);
  private readonly projectService = inject(ProjectService);
  readonly commonDataService  = inject(CommonDataService);
  readonly resumeDataService  = inject(ResumeService);

  // ── State ──
  readonly projects         = signal<ProjectPreviewModel[]>([]);
  readonly featuredProjects = computed(() => this.projects().slice(0, FEATURED_PROJECT_COUNT));

  readonly heroWords     = signal<string[]>([]);
  readonly heroWordIndex = signal(0);

  readonly approachChipKeys = ['quote', 'async', 'ownership'];

  readonly capabilities = [
    { id: 'AI', tags: ['OpenAI', 'Semantic Kernel', 'RAG'], featured: true },
    { id: 'DOTNET', tags: ['C#', 'ASP.NET', 'Clean Arch'] },
    { id: 'ANGULAR', tags: ['Angular 20', 'Signals', 'RxJS'] },
    { id: 'CPP', tags: ['C++', 'Performance', 'Systems'] },
    { id: 'VR', tags: ['Unity', 'XR', 'Real-time 3D'] }
  ];

  readonly capIcon: Record<string, string> = {
    AI: 'bi-cpu',
    DOTNET: 'bi-hdd-stack',
    ANGULAR: 'bi-window',
    CPP: 'bi-terminal',
    VR: 'bi-headset-vr'
  };

  readonly agentSteps = [
    { key: 'plan',     icon: 'bi-signpost-split' },
    { key: 'retrieve', icon: 'bi-search' },
    { key: 'reason',   icon: 'bi-diagram-3' },
    { key: 'generate', icon: 'bi-stars' },
    { key: 'verify',   icon: 'bi-shield-check' }
  ];

  readonly whyKeys = ['ownership', 'ship', 'direct', 'ai'];
  readonly faqKeys = ['ai', 'pricing', 'timeline', 'comms', 'team', 'changes'];
  readonly openFaqKeys = signal<Record<string, boolean>>({});

  readonly minimapSections = [
    { id: 'hero', labelKey: 'freelance.minimap.intro' },
    { id: 'approach', labelKey: 'freelance.minimap.approach' },
    { id: 'capabilities', labelKey: 'freelance.minimap.capabilities' },
    { id: 'agent', labelKey: 'freelance.minimap.agent' },
    { id: 'process', labelKey: 'freelance.minimap.process' },
    { id: 'work', labelKey: 'freelance.minimap.projects' },
    { id: 'contact', labelKey: 'freelance.minimap.contact' },
  ];

  readonly activeSectionIndex = signal(0);
  readonly showQuoteModal     = signal(false);
  readonly isSubmitting       = signal(false);
  readonly submitSuccess      = signal(false);
  readonly submitError        = signal<string | null>(null);

  quoteForm = { name: '', email: '', service: '', budget: 'medium', description: '' };
  private heroWordTimer?: ReturnType<typeof setTimeout>;
  private waveField: HeroWaveField | null = null;
  private heroVisible = true;
  private isDestroyed = false;
  private readonly cleanupFns: (() => void)[] = [];

  constructor() {
    // Re-tint the WebGL wave whenever the theme flips.
    effect(() => {
      const isDark = this.themeService.isDark();
      if (this.isBrowser) this.waveField?.setTheme(this.buildWavePalette(isDark));
    });
  }

  ngOnInit(): void {
    const svc = this.projectService as any;
    const fetchSource$ = typeof svc.getProjects === 'function' ? svc.getProjects() : svc.projects$;
    if (fetchSource$) {
      fetchSource$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: ProjectPreviewModel[]) => {
        if (data) this.projects.set(data);
      });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.loadHeroWords();
    
    this.ngZone.runOutsideAngular(() => {
      // Small timeout ensures DOM is fully rendered before GSAP calculations
      setTimeout(() => {
        this.initHeroMaskReveal();
        this.initHeroWaveField();
        this.initMagneticButtons();
        this.initGlobalScrollAnimations();
        this.initAgentTerminalSimulation();
      }, 50);
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.heroWordTimer) clearTimeout(this.heroWordTimer);
    this.cleanupFns.forEach(fn => fn());
    this.waveField?.destroy();
    this.waveField = null;
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  // ── Hero Masked Reveal Animation ──
  private initHeroMaskReveal(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(['.hero__line', '.fade-up'], { y: 0, opacity: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl.to('.hero__line', { y: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out' })
      .fromTo('.fade-up', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, '-=0.8');
  }

  private loadHeroWords(): void {
    const keys = HERO_ROLE_KEYS.map(k => `freelance.hero.roles.${k}`);
    this.translate.get(keys)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: Record<string, string>) => {
        const words = keys.map(k => res[k]).filter(Boolean);
        const fallbackWord = this.translate.instant(HERO_DEFAULT_WORD_KEY) || 'AI-native software';
        this.heroWords.set(words.length ? words : [fallbackWord]);
        this.heroWordIndex.set(0);
        this.scheduleNextHeroWord();
      });
  }

  private scheduleNextHeroWord(): void {
    if (this.heroWordTimer) clearTimeout(this.heroWordTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.ngZone.runOutsideAngular(() => {
      this.heroWordTimer = setTimeout(() => {
        const words = this.heroWords();
        const nextIndex = (this.heroWordIndex() + 1) % words.length;
        const el = this.heroWordElRef?.nativeElement;

        if (!el) {
          this.ngZone.run(() => this.heroWordIndex.set(nextIndex));
          this.scheduleNextHeroWord();
          return;
        }

        this.scrambleTo(el, words[nextIndex], () => {
          // Signal write re-renders the exact same text the scramble settled on.
          this.ngZone.run(() => this.heroWordIndex.set(nextIndex));
          this.scheduleNextHeroWord();
        });
      }, HERO_WORD_INTERVAL_MS);
    });
  }

  /** Decode-style character scramble toward the target word. Runs outside Angular. */
  private scrambleTo(el: HTMLElement, target: string, onDone: () => void): void {
    const from = el.textContent?.trim() ?? '';
    let step = 0;

    const tick = (): void => {
      step++;
      const progress = step / SCRAMBLE_STEPS;
      // Quadratic lock-in: characters settle left-to-right, accelerating.
      const lockCount = Math.floor(progress * progress * (target.length + 1));
      const length = Math.round(from.length + (target.length - from.length) * Math.min(progress * 1.4, 1));

      let out = target.slice(0, lockCount);
      for (let i = lockCount; i < length; i++) {
        out += target[i] === ' ' ? ' ' : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
      }
      el.textContent = out;

      if (step < SCRAMBLE_STEPS) {
        this.heroWordTimer = setTimeout(tick, SCRAMBLE_TICK_MS);
      } else {
        el.textContent = target;
        onDone();
      }
    };
    tick();
  }

  // ── Hero Wave Field (Three.js, lazy-loaded) ──
  private async initHeroWaveField(): Promise<void> {
    const canvas = this.heroCanvasRef?.nativeElement;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const field = await HeroWaveField.create(canvas, this.buildWavePalette(this.themeService.isDark()));
    if (!field) return;
    if (this.isDestroyed) {
      // Component tore down while the lazy chunk was loading.
      field.destroy();
      return;
    }
    this.waveField = field;

    // Pause rendering when the hero is off-screen or the tab is hidden.
    const hero = this.heroSectionRef?.nativeElement;
    if (hero) {
      const io = new IntersectionObserver(([entry]) => {
        this.heroVisible = !!entry?.isIntersecting;
        this.syncWaveRunning();
      }, { threshold: 0.02 });
      io.observe(hero);
      this.cleanupFns.push(() => io.disconnect());
    }

    const onVisibility = (): void => this.syncWaveRunning();
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanupFns.push(() => document.removeEventListener('visibilitychange', onVisibility));

    if (window.matchMedia('(hover: hover)').matches) {
      const onPointerMove = (e: PointerEvent): void => {
        this.waveField?.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1
        );
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      this.cleanupFns.push(() => window.removeEventListener('pointermove', onPointerMove));
    }
  }

  private syncWaveRunning(): void {
    this.waveField?.setRunning(this.heroVisible && !document.hidden);
  }
private buildWavePalette(isDark: boolean): WavePalette {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string): string => styles.getPropertyValue(name).trim() || fallback;
    
    return isDark
      ? { 
          colorA: read('--ai-accent', '#19e3da'), 
          colorB: read('--ai-accent-2', '#4fd6ff'), 
          opacity: 0.8, 
          additive: true 
        }
      : { 
          // Inject deeper, legible ink tones for light mode rendering
          colorA: read('--color-primary', '#004d61'), 
          colorB: read('--ai-accent', '#00839e'), 
          opacity: 0.65, 
          additive: false 
        };
  }
  // ── Magnetic CTAs (desktop pointers only) ──
  private initMagneticButtons(): void {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const buttons = Array.from(document.querySelectorAll<HTMLElement>('.hero [data-magnetic]'));
    buttons.forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });

      const onMove = (e: MouseEvent): void => {
        const rect = btn.getBoundingClientRect();
        xTo((e.clientX - rect.left - rect.width / 2) * 0.28);
        yTo((e.clientY - rect.top - rect.height / 2) * 0.38);
      };
      const onLeave = (): void => { xTo(0); yTo(0); };

      btn.addEventListener('mousemove', onMove, { passive: true });
      btn.addEventListener('mouseleave', onLeave, { passive: true });
      this.cleanupFns.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  // ── Scroll Behaviors ──
  private initGlobalScrollAnimations(): void {
    if (this.scrollBarRef?.nativeElement) {
      gsap.to(this.scrollBarRef.nativeElement, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.1 }
      });
    }

    this.minimapSections.forEach((sec, idx) => {
      ScrollTrigger.create({
        trigger: `#${sec.id}`, start: 'top 50%', end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) this.ngZone.run(() => this.activeSectionIndex.set(idx));
        }
      });
    });

    const fadeEls = gsap.utils.toArray('.fade-up-scroll') as HTMLElement[];
    fadeEls.forEach(el => {
      const delay = el.getAttribute('data-delay') || '0';
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: parseFloat(delay), ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Stagger right pane capability cards
    const capCards = gsap.utils.toArray('.cap-scroll-card') as HTMLElement[];
    if (capCards.length) {
      gsap.fromTo(capCards, 
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: '.cap-sticky-layout__cards', start: 'top 75%' }
        }
      );
    }

    // 4. Custom Process Line Continuous Height Dynamic Fill-up scrub
    if (this.processProgressRef?.nativeElement) {
      gsap.to(this.processProgressRef.nativeElement, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.process-timeline',
          start: 'top 60%',
          end: 'bottom 60%',
          scrub: true
        }
      });
    }
  }

  // ── Terminal Demo Timeline ──
// ── Terminal Demo Timeline ──
  private initAgentTerminalSimulation(): void {
    const container = document.querySelector('.terminal-ui');
    if (!container) return;

    const steps = Array.from(container.querySelectorAll('.term-step'));
    const result = container.querySelector('.terminal-res');
    const progressLine = container.querySelector('.terminal-line__progress');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      steps.forEach(s => s.classList.add('is-done'));
      result?.classList.add('is-shown');
      if (progressLine) gsap.set(progressLine, { scaleY: 1 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 65%',
        end: '+=500', 
        scrub: false, 
        toggleActions: 'play none none reverse'
      }
    });

    // 1. Grow the progress line smoothly
    if (progressLine) {
       tl.to(progressLine, { scaleY: 1, duration: 2.2, ease: 'none' }, 0);
    }

    // 2. Cascade down the steps
    steps.forEach((step, index) => {
      tl.to(step, {
        duration: 0.45,
        onStart: () => {
           step.classList.add('is-active');
           if (index > 0) steps[index - 1].classList.replace('is-active', 'is-done');
        },
        onReverseComplete: () => {
           step.classList.remove('is-active', 'is-done');
           if (index > 0) steps[index - 1].classList.replace('is-done', 'is-active');
        }
      }, index * 0.45);
    });

    // 3. Mark last step done and reveal result card
    tl.to({}, { duration: 0.2 }) 
      .add(() => {
        if (steps.length > 0) {
          steps[steps.length - 1].classList.replace('is-active', 'is-done');
        }
        result?.classList.add('is-shown');
      })
      .to(result, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '>');
  }

  // Ensure toggleFaq and openQuoteModal mappings exist if they aren't explicitly declared yet
  toggleFaq(key: string): void {
    this.openFaqKeys.update(keys => ({
      ...keys,
      [key]: !keys[key]
    }));
  }

  openQuoteModal(serviceId: string = ''): void {
    this.quoteForm.service = serviceId;
    this.showQuoteModal.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);
  }

  closeQuoteModal(): void {
    this.showQuoteModal.set(false);
  }

  submitQuote(form: NgForm): void {
    if (form.invalid) return;
    this.isSubmitting.set(true);
    this.submitError.set(null);

    // Swap 'this.formspree.submit(...)' with your actual contact API
    this.formspree.submitQuote(this.quoteForm).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submitError.set(
          this.translate.instant('freelance.quote.errors.submit') ||
          this.translate.instant('freelance.quote.errors.submitFallback')
        );
      }
    });
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // height of header
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

}