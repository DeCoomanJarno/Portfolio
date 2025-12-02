import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, signal, computed, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import * as THREE from 'three';
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectCategory, ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CONFIG, ExpertiseItem } from '../../Models/calc-config';
import { CommonDataService } from '../../../Core/Services/common-data.service';

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, ProjectItemComponent],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements AfterViewInit, OnDestroy {
  @ViewChild('canvas3d') canvasRef!: ElementRef<HTMLCanvasElement>;

  isBrowser = false;
  selectedCategory = signal<ProjectCategory>(ProjectCategory.All);
  projects = signal<ProjectPreviewModel[]>([]);
  categories: ProjectCategory[] = Object.values(ProjectCategory);

  expertise: ExpertiseItem[] = CONFIG.expertises;
  
  techStack: string[] = ['Unity', 'Angular', 'C#/.NET', 'C++', 'OpenXR']

  filteredProjects = computed(() => {
    const cat = this.selectedCategory();
    return cat === ProjectCategory.All ? this.projects() : this.projects().filter((p: ProjectPreviewModel) => p.category === cat);
  });

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private frameId = 0;
  private observer: IntersectionObserver | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone,
    projectService: ProjectService,
    public commonDataService: CommonDataService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    projectService.getProjects().subscribe(projects => {
      if(projects) {
        this.projects.set(projects);
        // Re-trigger animations for projects if they load late
        setTimeout(() => this.setupScrollAnimation(), 100);
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Initialize ThreeJS
      this.initThreeJS();
      window.addEventListener('resize', this.onResize);

      // Animation handling
      // 1. Force Hero animations to start immediately
      setTimeout(() => {
        const heroReveals = document.querySelectorAll('.hero .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
        
        // 2. Setup observer for the rest of the page
        this.setupScrollAnimation();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
      if (this.frameId) cancelAnimationFrame(this.frameId);
      
      if (this.renderer) {
        this.renderer.dispose();
        // Dispose geometry and materials to prevent memory leaks
        this.particles?.geometry.dispose();
        (this.particles?.material as THREE.Material)?.dispose();
      }
      
      this.observer?.disconnect();
    }
  }

  setCategory(cat: ProjectCategory) {
    this.selectedCategory.set(cat);
    // Re-observe new elements after DOM update
    setTimeout(() => this.setupScrollAnimation(), 50);
  }

  scrollTo(elementId: string) {
    const el = document.getElementById(elementId);
    if(el) {
      const headerOffset = 100; // Adjusted for new padding
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }

  private setupScrollAnimation() {
    if (!this.isBrowser) return;
    
    // Disconnect old observer to avoid duplicates
    if (this.observer) this.observer.disconnect();

    const options = { 
      threshold: 0.15, // Trigger when 15% visible
      rootMargin: '0px 0px -50px 0px' 
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: Keep observing if you want exit animations, 
          // but for "reveal on scroll" usually unobserve is better
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    // Grab all elements marked with 'reveal' that aren't already active
    const elements = document.querySelectorAll('.reveal:not(.active)');
    elements.forEach(el => this.observer?.observe(el));
  }

  private onResize = () => {
    if(!this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight; // Full height for background
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private initThreeJS() {
    this.ngZone.runOutsideAngular(() => {
      const canvas = this.canvasRef.nativeElement;
      const w = window.innerWidth;
      const h = window.innerHeight; // Cover full background

      // Get color from CSS variable for consistency
      const styles = getComputedStyle(document.body);
      let colorHexStr = styles.getPropertyValue('--color-secondary').trim();
      // Fallback if variable isn't read correctly immediately
      if(!colorHexStr) colorHexStr = '#00b7c2'; 

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
      this.camera.position.z = 40;

      this.renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance" 
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create Particles
      const geom = new THREE.BufferGeometry();
      const pos = [];
      const particleCount = 800; // slightly reduced for performance on mobiles
      
      for(let i = 0; i < particleCount; i++) {
        pos.push(
          (Math.random()-0.5) * 200, 
          (Math.random()-0.5) * 200, 
          (Math.random()-0.5) * 120
        );
      }
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.8,
        color: new THREE.Color(colorHexStr),
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      this.particles = new THREE.Points(geom, mat);
      this.scene.add(this.particles);

      // Animation Loop
      const animate = () => {
        this.frameId = requestAnimationFrame(animate);
        
        // Gentle rotation
        this.particles.rotation.y += 0.0005;
        this.particles.rotation.x += 0.0002;
        
        // Mouse parallax could be added here if you track mouse position
        
        this.renderer.render(this.scene, this.camera);
      };
      
      animate();
    });
  }
}