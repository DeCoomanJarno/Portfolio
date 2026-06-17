import { ChangeDetectionStrategy, Component, AfterViewInit, OnDestroy, inject, signal, computed, NgZone, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
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
import { CONFIG, ExpertiseItem } from '../../Models/calc-config';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { FormspreeService } from '../../../Core/Services/formspree.service';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_PROJECT_COUNT = 3;

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, RouterModule, ProjectItemComponent, FormsModule],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formspreeService = inject(FormspreeService);
  private readonly translateService = inject(TranslateService);
  readonly commonDataService = inject(CommonDataService);

  readonly projects = signal<ProjectPreviewModel[]>([]);
  readonly featuredProjects = computed(() => this.projects().slice(0, FEATURED_PROJECT_COUNT));

  readonly services: ExpertiseItem[] = CONFIG.expertises.filter(item => item.id !== 'AI');
  readonly allExpertises: ExpertiseItem[] = CONFIG.expertises;
  readonly techStack: string[] = ['Angular', 'TypeScript', 'C#/.NET', 'C++', 'Unity', 'SQL'];
  readonly processSteps = ['step1', 'step2', 'step3'];
  readonly aiPoints = ['workflow', 'integrations', 'honest'];
  readonly whyCards: { key: string; icon: string }[] = [
    { key: 'rapid', icon: 'bi-lightning-charge' },
    { key: 'scale', icon: 'bi-diagram-3' },
    { key: 'partner', icon: 'bi-people' }
  ];

  readonly showQuoteModal = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  quoteForm = { name: '', email: '', service: '', budget: '', description: '' };

  private observer?: IntersectionObserver;
  private heroTimeline?: gsap.core.Timeline;
  private scrollTriggers: ScrollTrigger[] = [];

  constructor(@Inject(PLATFORM_ID) platformId: object, projectService: ProjectService) {
    this.isBrowser = isPlatformBrowser(platformId);

    projectService.getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => {
        if (projects?.length) {
          this.projects.set(projects);
          if (this.isBrowser) {
            this.ngZone.runOutsideAngular(() => setTimeout(() => this.observeReveals(), 100));
          }
        }
      });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.playHeroEntrance();
        this.observeReveals();
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.heroTimeline?.kill();
    this.scrollTriggers.forEach(st => st.kill());
    document.body.style.overflow = '';
  }

  openQuoteModal(serviceId = ''): void {
    if (serviceId) this.quoteForm.service = serviceId;
    this.showQuoteModal.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);
    this.isSubmitting.set(false);
    document.body.style.overflow = 'hidden';
  }

  closeQuoteModal(): void {
    this.showQuoteModal.set(false);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeQuoteModal();
    }
  }

  submitQuote(event: Event, form: NgForm): void {
    event.preventDefault();
    if (form.invalid) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.formspreeService.submitQuote({ ...this.quoteForm }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        setTimeout(() => {
          this.closeQuoteModal();
          this.quoteForm = { name: '', email: '', service: '', budget: '', description: '' };
        }, 2500);
      },
      error: (error: Error) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.message || this.translateService.instant('freelance.quote.errors.submit'));
      }
    });
  }

  private playHeroEntrance(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      gsap.set('.hero [data-hero-reveal]', { opacity: 1, y: 0 });
      return;
    }

    // Main entrance timeline
    this.heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });

    this.heroTimeline
      .from('.hero [data-hero-reveal]', {
        opacity: 0,
        y: 24,
        stagger: 0.09
      })
      .fromTo('.hero .text-gradient', {
        clipPath: 'inset(0 100% 0 0)'
      }, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power2.inOut'
      }, '-=0.3')
      .from('.hero__chips .chip', {
        opacity: 0,
        scale: 0.8,
        stagger: 0.06,
        duration: 0.4,
        ease: 'back.out(1.7)'
      }, '-=0.4');

    // Ambient floating orbs
    gsap.to('.hero__orb--primary', {
      x: 30, y: -20,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.hero__orb--secondary', {
      x: -20, y: 25,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Scroll parallax for hero content
    const st = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      animation: gsap.to('.hero__inner', {
        y: -60,
        opacity: 0.3,
        ease: 'none'
      })
    });
    this.scrollTriggers.push(st);
  }

  private observeReveals(): void {
    this.observer?.disconnect();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('active');

          if (!reducedMotion) {
            const staggerContainer = el.querySelector('[data-stagger]');
            if (staggerContainer) {
              gsap.from(staggerContainer.children, {
                y: 24,
                opacity: 0,
                stagger: 0.08,
                duration: 0.5,
                ease: 'power2.out'
              });
            }
          }

          this.observer?.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal:not(.active)').forEach(el => this.observer?.observe(el));
  }
}
