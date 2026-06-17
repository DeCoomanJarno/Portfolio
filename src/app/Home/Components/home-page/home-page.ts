import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item';
import { ProjectPreviewModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { CommonData, CommonDataService } from '../../../Core/Services/common-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../../../Resume/Services/resume.service';
import { AsyncPipe } from '@angular/common';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types for the dynamically loaded CDN globals
// ---------------------------------------------------------------------------
declare const gsap: any;
declare const ScrollTrigger: any;

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProjectItemComponent, TranslateModule, RouterLink, AsyncPipe],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: false })
  threeCanvas!: ElementRef<HTMLCanvasElement>;

  // ── public state bound in the template ───────────────────────────────────
  public projects: ProjectPreviewModel[] = [];
  public commonData!: CommonData;
  public resumeData$;
  public typewriterText = '';
  public cursorOn = true;

  // ── private Three.js objects ──────────────────────────────────────────────
  private rafId = 0;
  private renderer: any;
  private scene: any;
  private camera: any;
  private particlesMesh: any;
  private linesMesh: any;
  private mouseX = 0;
  private mouseY = 0;

  // ── private timer handles ─────────────────────────────────────────────────
  private twTimer: any;
  private cursorTimer: any;

  private readonly ROLES = [
    'AI Developer',
    'Angular Architect',
    'ML Engineer',
    'Freelancer',
  ];

  constructor(
    private projectService: ProjectService,
    private commonDataService: CommonDataService,
    private resumeService: ResumeService,
    private ngZone: NgZone
  ) {
    this.resumeData$ = this.resumeService.resumeData$;
  }

  // ── lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.commonDataService.commonData$.subscribe((data) => {
      if (data) {
        this.commonData = data;
        this.loadProjects(data.home.projects);
      }
    });

    this.startTypewriter();
    this.startCursorBlink();
  }

  ngAfterViewInit(): void {
    // Run outside Angular so Three.js RAF doesn't trigger change detection
    this.ngZone.runOutsideAngular(() => {
      this.loadCdnScripts();
    });

    // Mouse parallax listener (light touch)
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.twTimer);
    clearInterval(this.cursorTimer);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.dispose();

    // Clean up ScrollTrigger instances
    const ST = (window as any).ScrollTrigger;
    if (ST) ST.getAll().forEach((t: any) => t.kill());
  }

  // ── script loading ────────────────────────────────────────────────────────

  private loadCdnScripts(): void {
    const load = (src: string): Promise<void> =>
      new Promise((res) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => res();
        document.head.appendChild(s);
      });

    // Load Three.js then initialize canvas
    load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then(
      () => this.initThreeJS()
    );

    // Load GSAP core + ScrollTrigger sequentially
    load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
      .then(() =>
        load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js')
      )
      .then(() => setTimeout(() => this.initGSAP(), 80));
  }

  // ── Three.js neural network ───────────────────────────────────────────────

  private initThreeJS(): void {
    const canvas = this.threeCanvas?.nativeElement;
    if (!canvas) return;
    const THREE = (window as any).THREE;
    if (!THREE) return;

    const W = canvas.parentElement?.offsetWidth ?? window.innerWidth;
    const H = canvas.parentElement?.offsetHeight ?? window.innerHeight;

    // Scene / camera / renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    this.camera.position.z = 38;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Nodes ──
    const COUNT = 130;
    const posArr = new Float32Array(COUNT * 3);
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 90;
      const y = (Math.random() - 0.5) * 55;
      const z = (Math.random() - 0.5) * 35;
      posArr[i * 3]     = x;
      posArr[i * 3 + 1] = y;
      posArr[i * 3 + 2] = z;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.55,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    this.particlesMesh = new THREE.Points(nodeGeo, nodeMat);
    this.scene.add(this.particlesMesh);

    // ── Connections ──
    const lineVerts: number[] = [];
    const MAX_DIST = 20;

    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (pts[i].distanceTo(pts[j]) < MAX_DIST) {
          lineVerts.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.1,
    });

    this.linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(this.linesMesh);

    // ── Render loop ──
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      const t = 0.0006;
      const mx = this.mouseX * 0.0004;
      const my = this.mouseY * 0.0004;

      [this.particlesMesh, this.linesMesh].forEach((m) => {
        if (!m) return;
        m.rotation.y += t + mx;
        m.rotation.x += t * 0.45 + my;
      });

      this.renderer.render(this.scene, this.camera);
    };

    loop();
  }

  // ── GSAP animations ───────────────────────────────────────────────────────

  private initGSAP(): void {
    const g = (window as any).gsap;
    const ST = (window as any).ScrollTrigger;
    if (!g || !ST) return;

    g.registerPlugin(ST);

    // Hero entrance — tightly choreographed
    g.timeline({ defaults: { ease: 'power3.out', duration: 0.75 } })
      .fromTo('.hp-badge',    { opacity: 0, y: -18 }, { opacity: 1, y: 0 }, 0.35)
      .fromTo('.hp-name',     { opacity: 0, y: 64  }, { opacity: 1, y: 0, duration: 1 }, 0.5)
      .fromTo('.hp-role',     { opacity: 0, y: 30  }, { opacity: 1, y: 0 }, 0.72)
      .fromTo('.hp-bio',      { opacity: 0, y: 22  }, { opacity: 1, y: 0, duration: 0.65 }, 0.88)
      .fromTo('.hp-btn',      { opacity: 0, y: 18, scale: 0.96 },
                              { opacity: 1, y: 0,  scale: 1,    stagger: 0.14 }, 1.05)
      .fromTo('.hp-stats',    { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.35)
      .fromTo('.hp-scroll',   { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.55);

    // Scroll reveals
    const revealUp = (el: Element) =>
      g.fromTo(el,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
      );

    const revealLeft = (el: Element) =>
      g.fromTo(el,
        { opacity: 0, x: -52 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
      );

    const revealRight = (el: Element) =>
      g.fromTo(el,
        { opacity: 0, x: 52 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
      );

    document.querySelectorAll('.reveal-up').forEach(revealUp);
    document.querySelectorAll('.reveal-left').forEach(revealLeft);
    document.querySelectorAll('.reveal-right').forEach(revealRight);

    // Staggered card grids
    document.querySelectorAll('.stagger-parent').forEach((wrap) => {
      const kids = wrap.querySelectorAll('.stagger-child');
      g.fromTo(kids,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 85%', toggleActions: 'play none none none' } }
      );
    });

    // Stat counters
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset['count'] ?? '0', 10);
      const obj = { v: 0 };
      g.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v).toString(); },
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });
  }

  // ── Typewriter ────────────────────────────────────────────────────────────

  private startTypewriter(): void {
    let sIdx = 0;
    let cIdx = 0;
    let deleting = false;

    const tick = () => {
      const cur = this.ROLES[sIdx];
      this.typewriterText = deleting
        ? cur.substring(0, cIdx - 1)
        : cur.substring(0, cIdx + 1);

      if (deleting) {
        cIdx--;
        if (cIdx === 0) {
          deleting = false;
          sIdx = (sIdx + 1) % this.ROLES.length;
          this.twTimer = setTimeout(tick, 420);
          return;
        }
      } else {
        cIdx++;
        if (cIdx === cur.length) {
          deleting = true;
          this.twTimer = setTimeout(tick, 2300);
          return;
        }
      }

      this.twTimer = setTimeout(tick, deleting ? 48 : 108);
    };

    this.twTimer = setTimeout(tick, 1400);
  }

  private startCursorBlink(): void {
    this.cursorTimer = setInterval(() => {
      this.cursorOn = !this.cursorOn;
    }, 520);
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private readonly onMouseMove = (e: MouseEvent) => {
    this.mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  private readonly onResize = () => {
    const canvas = this.threeCanvas?.nativeElement;
    if (!canvas || !this.camera || !this.renderer) return;
    const W = canvas.parentElement?.offsetWidth ?? window.innerWidth;
    const H = canvas.parentElement?.offsetHeight ?? window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  };

  // ── Data loading ──────────────────────────────────────────────────────────

  private loadProjects(projectIds: string[]): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data.filter((pr) => projectIds.includes(pr.id));
    });
  }

  // ── Scroll helper (called from template) ─────────────────────────────────

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}