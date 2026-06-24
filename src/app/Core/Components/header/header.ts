import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  HostListener, inject, signal, effect, NgZone
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
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
export class HeaderComponent {
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
    { route: '/Freelance-Calculator', labelKey: 'demos.rateCalculator', icon: 'bi-cash-coin'      }
  ];

  private readonly isMobile = () =>
    typeof window !== 'undefined' && window.innerWidth <= 991;

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(router: Router) {
    router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.closeAll());

    effect(() => {
      const open = this.isMenuOpen();
      document.body.style.overflow = open ? 'hidden' : '';

      // Only animate on mobile — desktop nav is always visible
      if (!this.isMobile()) return;

      if (open) {
        this.animateDrawerOpen();
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

  setLanguage(lang: string): void {
    this.localeService.use(lang);
  }

  toggleTheme(): void {
    this.themeService.toggle();
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