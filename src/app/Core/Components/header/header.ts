import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  HostListener, inject, signal, effect, NgZone
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CommonDataService } from '../../Services/common-data.service';
import { ThemeService } from '../../Services/theme.service';
import { LocaleService } from '../../Services/locale.service';
import { LogoComponent } from '../logo/logo';
import gsap from 'gsap';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslateModule, LogoComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements AfterViewInit {
  readonly themeService = inject(ThemeService);
  readonly localeService = inject(LocaleService);
  readonly commonDataService = inject(CommonDataService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly isMenuOpen = signal(false);
  readonly isDemosOpen = signal(false);
  readonly isScrolled = signal(false);

  readonly demoLinks = [
    { route: '/Calculator',           labelKey: 'demos.calculator',     icon: 'bi-calculator'     },
    { route: '/GameOfLife',           labelKey: 'demos.gameOfLife',     icon: 'bi-grid-3x3'       },
    { route: '/LangtonsAnt',          labelKey: 'demos.langtonsAnt',    icon: 'bi-bug'             },
    { route: '/Appointments',         labelKey: 'demos.appointments',   icon: 'bi-calendar-check' },
    { route: '/Inventory',            labelKey: 'demos.inventory',      icon: 'bi-box-seam'       },
    { route: '/Freelance-Calculator', labelKey: 'demos.rateCalculator', icon: 'bi-cash-coin'      },
    { route: '/AI',                   labelKey: 'demos.aiConcept',      icon: 'bi-stars'          },
    { route: '/AI/Demand-Forecaster', labelKey: 'demos.demandForecaster', icon: 'bi-graph-up-arrow' }
  ];

  private readonly isMobile = () =>
    typeof window !== 'undefined' && window.innerWidth <= 1025;

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(router: Router) {
    router.events
      .pipe(filter(e => e instanceof NavigationStart || e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(e => {
        // Pulse the accent border during navigation — looks great with the floating rect
        const line = this.elementRef.nativeElement.querySelector('.header__accent-line') as HTMLElement;
        if (e instanceof NavigationStart) {
          this.ngZone.runOutsideAngular(() => {
            if (line && !this.prefersReducedMotion)
              gsap.to(line, { opacity: 0.9, duration: 0.25, overwrite: true });
          });
        } else {
          this.closeAll();
          this.ngZone.runOutsideAngular(() => {
            if (line && !this.prefersReducedMotion)
              gsap.to(line, { opacity: this.isScrolled() ? 0.3 : 0, duration: 0.5, delay: 0.15, overwrite: true });
          });
        }
      });

    effect(() => {
      const open = this.isMenuOpen();
      document.body.style.overflow = open ? 'hidden' : '';

      // Only animate on mobile — desktop nav is always visible
      if (!this.isMobile()) return;

      if (open) {
        this.animateDrawerOpen();
        // Reposition lang indicator after the drawer slides in (320 ms animation)
        setTimeout(() => this.repositionLangIndicator(), 350);
      } else {
        this.animateDrawerClose();
      }
    });

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 8);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.isDemosOpen() &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.isDemosOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
    if (this.isMenuOpen()) this.isDemosOpen.set(false);
  }

  toggleDemos(event: Event): void {
    event.stopPropagation();
    this.isDemosOpen.update(open => !open);
  }

  closeAll(): void {
    this.isMenuOpen.set(false);
    this.isDemosOpen.set(false);
  }

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion) return;
    this.ngZone.runOutsideAngular(() => {
      gsap.from(this.elementRef.nativeElement, {
        y: -80, opacity: 0, scale: 0.96,
        duration: 0.75, ease: 'back.out(1.5)', delay: 0.08, clearProps: 'all'
      });
      this.initNavPill();
      this.initLangIndicator();
    });
  }

  setLanguage(lang: string, event?: Event): void {
    if (event && !this.prefersReducedMotion) {
      const btn = event.currentTarget as HTMLElement;
      const container = btn.closest('.header__lang') as HTMLElement;
      const indicator = container?.querySelector('.header__lang-indicator') as HTMLElement;

      if (indicator && container) {
        this.ngZone.runOutsideAngular(() => {
          const cRect = container.getBoundingClientRect();
          const bRect = btn.getBoundingClientRect();
          const targetX = bRect.left - cRect.left - 3;
          // x slides fast, width snaps with elastic bounce = liquid stretch
          gsap.timeline()
            .to(indicator, { x: targetX, duration: 0.28, ease: 'power3.out' })
            .to(indicator, { width: bRect.width, duration: 0.44, ease: 'elastic.out(1.2, 0.5)' }, '<');
        });
      }
    }
    this.localeService.use(lang);
  }

  toggleTheme(): void {
    if (this.prefersReducedMotion) { this.themeService.toggle(); return; }
    this.ngZone.runOutsideAngular(() => {
      const btn = this.elementRef.nativeElement.querySelector('.header__theme') as HTMLElement;
      const icon = btn?.querySelector('.header__theme-icon') as HTMLElement;

      if (icon) {
        // Compress icon → switch theme at tightest point (invisible) → bounce back as new icon
        gsap.timeline()
          .to(icon, { scale: 0.5, duration: 0.13, ease: 'power2.in' })
          .call(() => this.ngZone.run(() => this.themeService.toggle()))
          .to(icon, { scale: 1.2, duration: 0.18, ease: 'power2.out' })
          .to(icon, { scale: 1,   duration: 0.12, ease: 'power2.in' });
      } else {
        this.ngZone.run(() => this.themeService.toggle());
      }

      // Small ambient glow burst from the button — not full-screen
      if (btn) {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const cx = left + width / 2;
        const cy = top + height / 2;
        const isDark = this.themeService.isDark();
        const glow = document.createElement('div');
        Object.assign(glow.style, {
          position: 'fixed',
          left: `${cx}px`, top: `${cy}px`,
          width: '0', height: '0',
          borderRadius: '50%',
          zIndex: '9998', pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          background: isDark
            ? 'radial-gradient(circle, rgba(255,240,200,0.65) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(80,60,200,0.55) 0%, transparent 70%)',
        });
        document.body.appendChild(glow);
        gsap.to(glow, {
          width: '240px', height: '240px', opacity: 0,
          duration: 0.5, ease: 'power2.out',
          onComplete: () => glow.remove()
        });
      }
    });
  }

  private repositionLangIndicator(): void {
    this.ngZone.runOutsideAngular(() => {
      const container = this.elementRef.nativeElement.querySelector('.header__lang') as HTMLElement;
      const indicator = container?.querySelector('.header__lang-indicator') as HTMLElement;
      if (!container || !indicator) return;
      const activeBtn = container.querySelector('.header__lang-btn.active') as HTMLElement;
      if (!activeBtn) return;
      const cRect = container.getBoundingClientRect();
      const bRect = activeBtn.getBoundingClientRect();
      gsap.set(indicator, { x: bRect.left - cRect.left - 3, width: bRect.width });
    });
  }

  private initLangIndicator(): void {
    this.repositionLangIndicator();
    const container = this.elementRef.nativeElement.querySelector('.header__lang') as HTMLElement;
    if (!container) return;
    const ro = new ResizeObserver(() => this.repositionLangIndicator());
    ro.observe(container);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  private initNavPill(): void {
    const ul = this.elementRef.nativeElement.querySelector('.header__links') as HTMLElement;
    const pill = this.elementRef.nativeElement.querySelector('.header__nav-pill') as HTMLElement;
    if (!ul || !pill || window.innerWidth <= 1025) return;

    let pillVisible = false;

    ul.addEventListener('mouseleave', () => {
      gsap.to(pill, { opacity: 0, scaleY: 0.85, duration: 0.18, overwrite: true });
      pillVisible = false;
    });

    ul.querySelectorAll<HTMLElement>(':scope > li').forEach(li => {
      li.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 1025) return;
        const ulRect = ul.getBoundingClientRect();
        const liRect = li.getBoundingClientRect();
        if (!pillVisible) {
          gsap.set(pill, { x: liRect.left - ulRect.left, width: liRect.width, scaleY: 0.7 });
          gsap.to(pill, { opacity: 1, scaleY: 1, duration: 0.28, ease: 'back.out(2.5)', overwrite: true });
          pillVisible = true;
        } else {
          gsap.to(pill, {
            x: liRect.left - ulRect.left,
            width: liRect.width,
            opacity: 1, scaleY: 1,
            duration: 0.22, ease: 'power2.out',
            overwrite: true,
          });
        }
      });
    });
  }

private animateDrawerOpen(): void {
    if (this.prefersReducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const nav = this.elementRef.nativeElement.querySelector('.header__nav');
      if (!nav) return;

      const isMobileSheet = typeof window !== 'undefined' && window.innerWidth <= 600;

      // Animate the main drawer panel
      if (isMobileSheet) {
        gsap.fromTo(
          nav,
          { y: '100%' },
          { y: '0%', duration: 0.32, ease: 'power3.out', clearProps: 'y' }
        );
      } else {
        gsap.fromTo(
          nav,
          { x: '100%' },
          { x: '0%', duration: 0.32, ease: 'power3.out', clearProps: 'x' }
        );
      }

      // Stagger the links in (sliding up on mobile, sliding left on tablet)
      const items = nav.querySelectorAll(
        '.header__link, .header__demos-item, .header__actions'
      );
      gsap.fromTo(
        items,
        { opacity: 0, x: isMobileSheet ? 0 : 20, y: isMobileSheet ? 20 : 0 },
        { opacity: 1, x: 0, y: 0, stagger: 0.04, duration: 0.28, ease: 'power2.out', delay: 0.1 }
      );
    });
  }

  private animateDrawerClose(): void {
    if (this.prefersReducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const nav = this.elementRef.nativeElement.querySelector('.header__nav');
      if (!nav) return;

      const isMobileSheet = typeof window !== 'undefined' && window.innerWidth <= 600;

      // Slide down to bottom on mobile, slide right on tablet
      if (isMobileSheet) {
        gsap.to(nav, {
          y: '100%',
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => { gsap.set(nav, { clearProps: 'y' }); }
        });
      } else {
        gsap.to(nav, {
          x: '100%',
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => { gsap.set(nav, { clearProps: 'x' }); }
        });
      }
    });
  }

  // Add these properties to your class
  private touchStartY = 0;
  private currentTranslateY = 0;
  private readonly SWIPE_THRESHOLD = 60; // Pixels required to trigger a close

  // Add these methods
  onTouchStart(event: TouchEvent): void {
    if (typeof window === 'undefined' || window.innerWidth > 600) return;
    
    this.touchStartY = event.touches[0].clientY;
    this.currentTranslateY = 0;
    
    const nav = this.elementRef.nativeElement.querySelector('.header__nav') as HTMLElement;
    if (nav) {
      // Disable CSS transitions so the panel tracks the finger instantly
      nav.style.transition = 'none';
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (typeof window === 'undefined' || window.innerWidth > 600) return;
    
    const deltaY = event.touches[0].clientY - this.touchStartY;

    // Only allow dragging downward
    if (deltaY > 0) {
      this.currentTranslateY = deltaY;
      const nav = this.elementRef.nativeElement.querySelector('.header__nav') as HTMLElement;
      if (nav) {
        nav.style.transform = `translateY(${deltaY}px)`;
      }
    }
  }

  onTouchEnd(): void {
    if (typeof window === 'undefined' || window.innerWidth > 600) return;
    
    const nav = this.elementRef.nativeElement.querySelector('.header__nav') as HTMLElement;
    if (nav) {
      // Restore the CSS transition and clear the inline transform
      nav.style.transition = '';
      nav.style.transform = '';
    }

    // If dragged down far enough, close the menu
    if (this.currentTranslateY > this.SWIPE_THRESHOLD) {
      this.closeAll();
    }
    
    this.currentTranslateY = 0;
  }
}