import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, signal, computed, NgZone, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as THREE from 'three';

// Services & Models
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectCategory, ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CONFIG, ExpertiseItem } from '../../Models/calc-config';
import { CommonDataService } from '../../../Core/Services/common-data.service';

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, ProjectItemComponent, FormsModule],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements AfterViewInit, OnDestroy {
  @ViewChild('canvas3d') canvasRef!: ElementRef<HTMLCanvasElement>;

  // -- Core State --
  readonly isBrowser: boolean;
  readonly selectedCategory = signal<ProjectCategory>(ProjectCategory.All);
  readonly projects = signal<ProjectPreviewModel[]>([]);

  // -- Config Data --
  readonly categories: ProjectCategory[] = Object.values(ProjectCategory);
  readonly expertise: ExpertiseItem[] = CONFIG.expertises;
  readonly techStack: string[] = ['Unity', 'Angular', 'C#/.NET', 'C++', 'OpenXR'];

  // -- Modal & Form State --
  readonly showQuoteModal = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly showFloatingCta = signal(false);

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

  // -- ThreeJS & Animation Props --
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points;
  private frameId = 0;
  private observer?: IntersectionObserver;
  private resizeHandler?: () => void;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly ngZone: NgZone,
    private readonly projectService: ProjectService,
    public readonly commonDataService: CommonDataService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.projectService.getProjects().subscribe(projects => {
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

    this.ngZone.runOutsideAngular(() => {
      this.initThreeJS();

      this.resizeHandler = this.onResize.bind(this);
      window.addEventListener('resize', this.resizeHandler, { passive: true });

      requestAnimationFrame(() => {
        const heroReveals = document.querySelectorAll('.hero .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
        setTimeout(() => this.setupScrollAnimation(), 100);
      });
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.frameId) cancelAnimationFrame(this.frameId);

    this.disposeThreeJS();
    this.observer?.disconnect();
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

  scrollTo(elementId: string): void {
    const el = document.getElementById(elementId);
    if (!el) return;
    const headerOffset = 100;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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

    // Simulate API delay for better UX
    setTimeout(() => {
      console.log('Quote Request:', this.quoteForm);

      // Construct mailto
      const subject = `Project Inquiry: ${this.quoteForm.service}`;
      const body = `Name: ${this.quoteForm.name}%0D%0AEmail: ${this.quoteForm.email}%0D%0ABudget: ${this.quoteForm.budget}%0D%0A%0D%0ADetails:%0D%0A${this.quoteForm.description}`;

      // Open mail client
      window.location.href = `mailto:${this.commonDataService.CommonData?.Contact.Email}?subject=${subject}&body=${body}`;

      // Show success state
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);

      // Auto close after 2.5 seconds
      setTimeout(() => {
        this.closeQuoteModal();
        // Reset form to defaults
        this.quoteForm = { name: '', email: '', service: '', budget: '', description: '' };
      }, 2500);

    }, 1500);
  }

  // Add a visibility flag
  private isHeroVisible = true;

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
    // NEW: Hero visibility observer
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isHeroVisible = entry.isIntersecting;
      });
    }, { threshold: 0 }); // Trigger as soon as it leaves viewport

    const hero = document.querySelector('.hero');
    if (hero) heroObserver.observe(hero);
  }


  // Update the animate loop
  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);

    // STOP rendering if not visible
    if (!this.isHeroVisible) return;

    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      this.particles.rotation.x += 0.0002;
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private onResize(): void {
    if (!this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const styles = getComputedStyle(document.documentElement);
    const colorHex = styles.getPropertyValue('--color-secondary').trim() || '#00b7c2';

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera.position.z = 40;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (let i = 0; i < 800; i++) {
      positions.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 120
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.8,
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.animate();
  }

  private disposeThreeJS(): void {
    this.particles?.geometry.dispose();
    (this.particles?.material as THREE.Material)?.dispose();
    this.renderer?.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.particles = undefined;
  }
}