import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  NgZone
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { IconModule } from '@angularlibrary/ui-lib';
import { TranslateModule } from '@ngx-translate/core';

interface ParticleNode {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

@Component({
  selector: 'app-freelance-page',
  standalone: true,
  imports: [RouterLink, IconModule, TranslateModule],
  templateUrl: './freelance-page.html',
  styleUrls: ['./freelance-page.scss']
})
export class FreelancePage implements AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private threeRenderer: any;
  private frameId = 0;
  private mouseX = 0;
  private mouseY = 0;
  private cameraRef: any;
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundResize!: () => void;

  // ─── Page content ──────────────────────────────────────────────────
 services = [
  {
    tag: 'Backend',
    title: 'freelance.services.backend.title',
    description: 'freelance.services.backend.desc',
    tech: ['C#', '.NET 8', 'ASP.NET Core', 'EF Core'],
    featured: false
  },
  {
    tag: 'Frontend',
    title: 'freelance.services.frontend.title',
    description: 'freelance.services.frontend.desc',
    tech: ['Angular 18', 'TypeScript', 'RxJS', 'SCSS'],
    featured: false
  },
  {
    tag: 'Data',
    title: 'freelance.services.data.title',
    description: 'freelance.services.data.desc',
    tech: ['SQL Server', 'PostgreSQL', 'EF Migrations'],
    featured: false
  },
  {
    tag: 'AI ✦',
    title: 'freelance.services.ai.title',
    description: 'freelance.services.ai.desc',
    tech: ['OpenAI API', 'Claude API', 'LangChain', 'RAG / Embeddings'],
    featured: true
  }
];

stats = [
  { value: '2.5', unit: 'yrs', label: 'freelance.stats.exp' },
  { value: '4', unit: '+', label: 'freelance.stats.tech' },
  { value: '100', unit: '%', label: 'freelance.stats.remote' }
];

whys = [
  {
    icon: 'layers',
    title: 'freelance.why.fullstack.title',
    body: 'freelance.why.fullstack.body'
  },
  {
    icon: 'psychology',
    title: 'freelance.why.ai.title',
    body: 'freelance.why.ai.body'
  },
  {
    icon: 'schedule',
    title: 'freelance.why.delivery.title',
    body: 'freelance.why.delivery.body'
  }
];

  readonly techItems = [
    'C#', '.NET 10', 'Angular 22', 'TypeScript', 'SQL Server',
    'PostgreSQL', 'EF Core', 'Azure', 'OpenAI API', 'Claude API',
    'LangChain', 'RAG', 'Docker', 'Git', 'RxJS'
  ];

  constructor(
    public commonDataService: CommonDataService,
    @Inject(PLATFORM_ID) private platformId: object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.boundMouseMove = (e: MouseEvent) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    this.boundResize = () => {
      if (!this.threeRenderer || !this.cameraRef) return;
      this.cameraRef.aspect = window.innerWidth / window.innerHeight;
      this.cameraRef.updateProjectionMatrix();
      this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
    window.addEventListener('resize',    this.boundResize,    { passive: true });

    // Run Three.js + GSAP outside Angular's change-detection zone
    this.ngZone.runOutsideAngular(() => {
      this.initParticles().then(() => this.initAnimations());
    });
  }

  // ─── Three.js neural-net particles ─────────────────────────────────
  private async initParticles(): Promise<void> {
    const THREE = await import('three');
    const canvas = this.canvasRef.nativeElement;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.z = 28;
    this.cameraRef = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.threeRenderer = renderer;

    // Particle nodes
    const COUNT    = 85;
    const BOUND_X  = 26;
    const BOUND_Y  = 17;
    const BOUND_Z  = 8;
    const LINK_MAX = 10; // max distance to draw a line (world units)

    const nodes: ParticleNode[] = Array.from({ length: COUNT }, () => ({
      x:  (Math.random() - 0.5) * BOUND_X * 2,
      y:  (Math.random() - 0.5) * BOUND_Y * 2,
      z:  (Math.random() - 0.5) * BOUND_Z * 2,
      vx: (Math.random() - 0.5) * 0.016,
      vy: (Math.random() - 0.5) * 0.016,
      vz: (Math.random() - 0.5) * 0.007
    }));

    // Dot geometry — updated every frame
    const dotPos = new Float32Array(COUNT * 3);
    nodes.forEach((n, i) => {
      dotPos[i * 3] = n.x; dotPos[i * 3 + 1] = n.y; dotPos[i * 3 + 2] = n.z;
    });
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({ color: 0x5b9cf6, size: 0.2, transparent: true, opacity: 0.9 });
    scene.add(new THREE.Points(dotGeo, dotMat));

    // Line geometry — pre-allocated to avoid per-frame GC
    const MAX_PAIRS = Math.ceil(COUNT * (COUNT - 1) / 2);
    const lineBuf   = new Float32Array(MAX_PAIRS * 6);
    const lineGeo   = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineBuf, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.2 });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    const LINK_SQ = LINK_MAX * LINK_MAX;
    let camX = 0;
    let camY = 0;

    const tick = () => {
      this.frameId = requestAnimationFrame(tick);

      // Move nodes, bounce off walls
      for (let i = 0; i < COUNT; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy; n.z += n.vz;
        if (Math.abs(n.x) > BOUND_X) n.vx *= -1;
        if (Math.abs(n.y) > BOUND_Y) n.vy *= -1;
        if (Math.abs(n.z) > BOUND_Z) n.vz *= -1;
        dotPos[i * 3]     = n.x;
        dotPos[i * 3 + 1] = n.y;
        dotPos[i * 3 + 2] = n.z;
      }
      dotGeo.attributes['position'].needsUpdate = true;

      // Rebuild line buffer (no allocation — overwrite in place)
      let li = 0;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          if (dx * dx + dy * dy + dz * dz < LINK_SQ) {
            lineBuf[li++] = nodes[i].x; lineBuf[li++] = nodes[i].y; lineBuf[li++] = nodes[i].z;
            lineBuf[li++] = nodes[j].x; lineBuf[li++] = nodes[j].y; lineBuf[li++] = nodes[j].z;
          }
        }
      }
      lineBuf.fill(0, li); // zero-out stale segments
      lineGeo.setDrawRange(0, li / 3);
      lineGeo.attributes['position'].needsUpdate = true;

      // Camera mouse-parallax (smoothed)
      camX += (this.mouseX * 2.5 - camX) * 0.035;
      camY += (-this.mouseY * 1.8 - camY) * 0.035;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    tick();
  }

  // ─── GSAP scroll animations ─────────────────────────────────────────
  private async initAnimations(): Promise<void> {
    const { gsap }          = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    // Small wait so Angular finishes rendering
    await new Promise<void>(r => setTimeout(r, 60));

    // Hero — orchestrated entrance, not scattered
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.fp-badge',      { opacity: 0, y: 14, duration: 0.5  }, 0.15)
      .from('.fp-h1-line-1',  { opacity: 0, y: 38, duration: 0.65 }, 0.32)
      .from('.fp-h1-line-2',  { opacity: 0, y: 38, duration: 0.65 }, 0.48)
      .from('.fp-hero-sub',   { opacity: 0, y: 22, duration: 0.55 }, 0.66)
      .from('.fp-hero-ctas',  { opacity: 0, y: 16, duration: 0.50 }, 0.80)
      .from('.fp-scroll-cue', { opacity: 0, duration: 0.4         }, 1.10);

    // Services rows — stagger on first scroll into view
    gsap.from('.fp-svc-row', {
      scrollTrigger: { trigger: '.fp-services', start: 'top 72%' },
      opacity: 0, y: 40, stagger: 0.1, duration: 0.65, ease: 'power3.out'
    });

    // Stats
    gsap.from('.fp-stat', {
      scrollTrigger: { trigger: '.fp-stats-band', start: 'top 82%' },
      opacity: 0, y: 18, stagger: 0.1, duration: 0.5, ease: 'power2.out'
    });

    // Why cards
    gsap.from('.fp-why-card', {
      scrollTrigger: { trigger: '.fp-why', start: 'top 74%' },
      opacity: 0, y: 28, stagger: 0.13, duration: 0.6, ease: 'power3.out'
    });

    // CTA
    gsap.from('.fp-cta-inner', {
      scrollTrigger: { trigger: '.fp-cta', start: 'top 80%' },
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    });
  }

  scrollToServices(): void {
    document.querySelector('.fp-services')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.threeRenderer?.dispose();
    if (this.boundMouseMove) window.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundResize)    window.removeEventListener('resize',    this.boundResize);
  }
}