import {
  AfterViewChecked, Component, ElementRef, NgZone,
  OnDestroy, OnInit, PLATFORM_ID, inject, DestroyRef
} from '@angular/core';
import { isPlatformBrowser, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonData, CommonDataService } from '../../../Core/Services/common-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ResumeService } from '../../../Resume/Services/resume.service';
import { SkillCard } from '../../../Core/Components/skill-card/skill-card';
import { Certificate } from '../../../Core/Components/certificate/certificate';
import { RevealDirective } from '../../../Core/Directives/reveal.directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number; opacity: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslateModule, RouterLink, AsyncPipe, SkillCard, Certificate, RevealDirective],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.scss']
})
export class HomePageComponent implements OnInit, AfterViewChecked, OnDestroy {
  public commonData!: CommonData;
  public resumeData$;

  readonly traitKeys = [
    'home.traits.angular',
    'home.traits.dotnet',
    'home.traits.cpp',
    'home.traits.ai',
    'home.traits.vr',
    'home.traits.freelance'
  ];

  readonly stats = [
    { labelKey: 'home.stats.yearsActive', value: 5, suffix: '+' },
    { labelKey: 'home.stats.projectsBuilt', value: 30, suffix: '+' },
    { labelKey: 'home.stats.technologies', value: 15, suffix: '+' },
  ];

  private scrollCtx?: gsap.Context;
  private didInit = false;
  private canvasRaf?: number;
  private canvasRo?: ResizeObserver;
  private particles: Particle[] = [];
  private mouseX = -9999;
  private mouseY = -9999;
  private konamiIndex = 0;
  private readonly konamiCode = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'
  ];
  private avatarClickCount = 0;
  private avatarClickTimer?: ReturnType<typeof setTimeout>;
  private eggTimer?: ReturnType<typeof setTimeout>;
  private cleanups: (() => void)[] = [];

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone     = inject(NgZone);
  private readonly isBrowser  = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private commonDataService: CommonDataService,
    private resumeService:     ResumeService,
    private el:                ElementRef<HTMLElement>
  ) {
    this.resumeData$ = this.resumeService.resumeData$;
  }

  ngOnInit(): void {
    this.commonDataService.commonData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => { if (data) this.commonData = data; });
  }

  ngAfterViewChecked(): void {
    if (this.didInit || !this.isBrowser) return;
    const host = this.el.nativeElement;
    if (!host.querySelector('.about__hero')) return;

    this.didInit = true;
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced) this.initParticleCanvas();
        this.animateHero(reduced);
        this.initScrollAnimations(reduced);
        this.initScrollProgress();
        if (!reduced) this.initMagneticButtons();
        if (!reduced) this.initAvatarParallax();
        this.initNameScramble();
        this.initKonamiCode();
        this.initAvatarEasterEgg();
        ScrollTrigger.refresh();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.canvasRaf) cancelAnimationFrame(this.canvasRaf);
    this.canvasRo?.disconnect();
    this.scrollCtx?.revert();
    if (this.avatarClickTimer) clearTimeout(this.avatarClickTimer);
    if (this.eggTimer) clearTimeout(this.eggTimer);
    this.cleanups.forEach(fn => fn());
  }

  // ── Particle canvas ────────────────────────────────────────────────────────

  private initParticleCanvas(): void {
    const host   = this.el.nativeElement;
    const canvas = host.querySelector<HTMLCanvasElement>('.about__hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    this.canvasRo = new ResizeObserver(setSize);
    this.canvasRo.observe(canvas.parentElement!);

    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 90);
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius:  Math.random() * 2.8 + 0.7,
      opacity: Math.random() * 0.85 + 0.12,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    this.cleanups.push(() => window.removeEventListener('mousemove', onMouseMove));

    const draw = () => {
      this.canvasRaf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim() || '#006680';

      for (const p of this.particles) {
        const dx   = p.x - this.mouseX;
        const dy   = p.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist > 0) {
          const f = ((110 - dist) / 110) * 0.055;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.6) { p.vx = (p.vx / spd) * 1.6; p.vy = (p.vy / spd) * 1.6; }
        p.vx *= 0.987; p.vy *= 0.987;
        p.x  += p.vx;  p.y  += p.vy;
        if (p.x < 0) p.x = canvas.width;  else if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height; else if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle   = primary;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx   = this.particles[i].x - this.particles[j].x;
          const dy   = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x, this.particles[i].y);
            ctx.lineTo(this.particles[j].x, this.particles[j].y);
            ctx.strokeStyle = primary;
            ctx.globalAlpha = (1 - dist / 130) * 0.43;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };
    draw();
  }

  // ── Hero entrance ──────────────────────────────────────────────────────────

  private animateHero(reduced: boolean): void {
    const host  = this.el.nativeElement;
    const items = host.querySelectorAll<HTMLElement>('.about__hero-item');
    if (items.length) {
      gsap.from(items, {
        opacity: 0, y: reduced ? 0 : 28,
        duration: reduced ? 0.01 : 0.7,
        stagger: 0.1, ease: 'power3.out',
        delay: reduced ? 0 : 0.15, clearProps: 'all'
      });
    }
    const avatar = host.querySelector<HTMLElement>('.about__avatar-frame');
    if (avatar) {
      gsap.from(avatar, {
        opacity: 0, x: reduced ? 0 : 36, scale: reduced ? 1 : 0.96,
        duration: reduced ? 0.01 : 0.85, ease: 'power3.out',
        delay: reduced ? 0 : 0.1, clearProps: 'all'
      });
    }
  }

  // ── Scroll progress bar ────────────────────────────────────────────────────

  private initScrollProgress(): void {
    const bar = this.el.nativeElement.querySelector<HTMLElement>('.about__progress-bar');
    if (!bar) return;
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top', end: 'bottom bottom', scrub: 0.3,
      }
    });
  }

  // ── Magnetic CTA buttons ───────────────────────────────────────────────────

  private initMagneticButtons(): void {
    this.el.nativeElement.querySelectorAll<HTMLElement>('.about__btn').forEach(btn => {
      const onMove = (e: MouseEvent) => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        gsap.to(btn, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
      };
      const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.45)' });
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      this.cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  // ── Avatar 3-D mouse parallax ──────────────────────────────────────────────

  private initAvatarParallax(): void {
    const host  = this.el.nativeElement;
    const hero  = host.querySelector<HTMLElement>('.about__hero');
    const frame = host.querySelector<HTMLElement>('.about__avatar-frame');
    if (!hero || !frame) return;

    const onMove = (e: MouseEvent) => {
      const r  = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(frame, {
        rotateY: nx * 14, rotateX: -ny * 10, x: nx * 14, y: ny * 8,
        duration: 0.7, ease: 'power2.out', transformPerspective: 900,
      });
    };
    const onLeave = () => gsap.to(frame, {
      rotateY: 0, rotateX: 0, x: 0, y: 0,
      duration: 1.1, ease: 'elastic.out(1, 0.4)'
    });
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    this.cleanups.push(() => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
    });
  }

  // ── Name scramble on hover ─────────────────────────────────────────────────
private initNameScramble(): void {
  const host = this.el.nativeElement;
  const nameEl = host.querySelector<HTMLElement>('.about__name');
  if (!nameEl) return;

  const original = nameEl.textContent?.trim() ?? '';
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&!?';

  let rafId = 0;
  let start = 0;

  const duration = 3500;
let lastShuffle = 0;
const shuffleInterval = 30; // ms (try 80-150)

let scrambled = original.split('').map(ch =>
  ch === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]
);

const scramble = (timestamp: number) => {
  if (!start) start = timestamp;

  const progress = Math.min((timestamp - start) / duration, 1);
  const revealCount = Math.floor(progress * original.length);

  // Only generate new random characters every 80ms
  if (timestamp - lastShuffle >= shuffleInterval) {
    lastShuffle = timestamp;

    for (let i = revealCount; i < original.length; i++) {
      if (original[i] !== ' ') {
        scrambled[i] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  // Reveal finished characters
  for (let i = 0; i < revealCount; i++) {
    scrambled[i] = original[i];
  }

  nameEl.textContent = scrambled.join('');

  if (progress < 1) {
    rafId = requestAnimationFrame(scramble);
  } else {
    nameEl.textContent = original;
  }
};

  const onEnter = () => {
    cancelAnimationFrame(rafId);
    start = 0;
    rafId = requestAnimationFrame(scramble);
  };

  const onLeave = () => {
    cancelAnimationFrame(rafId);
    start = 0;
    nameEl.textContent = original;
  };

  nameEl.style.cursor = 'default';
  nameEl.addEventListener('mouseenter', onEnter);
  nameEl.addEventListener('mouseleave', onLeave);

  this.cleanups.push(() => {
    nameEl.removeEventListener('mouseenter', onEnter);
    nameEl.removeEventListener('mouseleave', onLeave);
  });
}

  // ── ScrollTrigger section + counter animations ─────────────────────────────

  private initScrollAnimations(reduced: boolean): void {
    const host = this.el.nativeElement;

    this.scrollCtx = gsap.context(() => {

      gsap.utils.toArray<HTMLElement>(host.querySelectorAll('.about__sec .about__label'))
        .forEach(label => gsap.from(label, {
          opacity: 0, x: reduced ? 0 : -20, duration: 0.55, ease: 'power3.out',
          scrollTrigger: { trigger: label, start: 'top 92%' }
        }));

      gsap.utils.toArray<HTMLElement>(host.querySelectorAll('.about__sec-title'))
        .forEach(title => gsap.from(title, {
          clipPath: reduced ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          opacity: reduced ? 1 : 0, duration: reduced ? 0 : 0.9, ease: 'power4.out',
          scrollTrigger: { trigger: title, start: 'top 92%' }
        }));

      // Timeline items — alternating left/right
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>(host.querySelectorAll('.about__tl-item'))
          .forEach((item, i) => gsap.from(item, {
            opacity: 0, x: i % 2 === 0 ? -32 : 32, duration: 0.65, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 91%' }, clearProps: 'all'
          }));
      }

      // Stat counters
      host.querySelectorAll<HTMLElement>('.about__stat-num').forEach(el => {
        const target = parseInt(el.dataset['target'] ?? '0', 10);
        if (!reduced) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 1.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%' },
            onUpdate: () => { el.textContent = String(Math.round(obj.val)); }
          });
        } else {
          el.textContent = String(target);
        }
      });

    }, host);
  }

  // ── Konami code easter egg ─────────────────────────────────────────────────

  private initKonamiCode(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === this.konamiCode[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.konamiIndex = 0;
          this.ngZone.run(() => this.triggerKonamiEgg());
        }
      } else {
        this.konamiIndex = e.key === this.konamiCode[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', handler);
    this.cleanups.push(() => window.removeEventListener('keydown', handler));
  }

  private triggerKonamiEgg(): void {
    const overlay = this.el.nativeElement.querySelector<HTMLElement>('.about__egg--konami');
    if (!overlay) return;
    overlay.classList.add('active');
    this.launchConfetti();
    if (this.eggTimer) clearTimeout(this.eggTimer);
    this.eggTimer = setTimeout(() => overlay.classList.remove('active'), 4500);
  }

  private launchConfetti(): void {
    const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)',
                    '#ff6b9d', '#c44dff', '#4ade80'];
    for (let i = 0; i < 70; i++) {
      const el    = document.createElement('div');
      el.className = 'about__confetti';
      el.style.setProperty('--cc', colors[i % colors.length]);
      document.body.appendChild(el);
      const angle  = Math.random() * Math.PI * 2;
      const spread = 250 + Math.random() * 300;
      gsap.fromTo(el,
        { x: window.innerWidth / 2, y: window.innerHeight * 0.55,
          opacity: 1, scale: Math.random() * 0.9 + 0.3, rotate: 0 },
        { x: window.innerWidth / 2 + Math.cos(angle) * spread,
          y: window.innerHeight / 2  + Math.sin(angle) * spread - 220,
          opacity: 0, rotate: Math.random() * 720 - 360,
          duration: 1.1 + Math.random() * 0.9, ease: 'power2.out',
          onComplete: () => el.remove() }
      );
    }
  }

  // ── Avatar easter egg — 5 clicks → glitch ─────────────────────────────────

  private initAvatarEasterEgg(): void {
    const host    = this.el.nativeElement;
    const img     = host.querySelector<HTMLElement>('.about__avatar-img');
    const overlay = host.querySelector<HTMLElement>('.about__egg--avatar');
    if (!img || !overlay) return;

    const onClick = () => {
      this.avatarClickCount++;
      if (this.avatarClickTimer) clearTimeout(this.avatarClickTimer);
      if (this.avatarClickCount >= 5) {
        this.avatarClickCount = 0;
        this.ngZone.run(() => {
          img.classList.add('glitch');
          overlay.classList.add('active');
          setTimeout(() => { img.classList.remove('glitch'); overlay.classList.remove('active'); }, 3200);
        });
      } else {
        this.avatarClickTimer = setTimeout(() => { this.avatarClickCount = 0; }, 1200);
      }
    };
    img.addEventListener('click', onClick);
    this.cleanups.push(() => img.removeEventListener('click', onClick));
  }
}

