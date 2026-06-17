import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, signal, effect, NgZone } from '@angular/core';
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
    { route: '/Calculator', labelKey: 'demos.calculator' },
    { route: '/GameOfLife', labelKey: 'demos.gameOfLife' },
    { route: '/LangtonsAnt', labelKey: 'demos.langtonsAnt' },
    { route: '/Appointments', labelKey: 'demos.appointments' },
    { route: '/Inventory', labelKey: 'demos.inventory' },
    { route: '/Freelance-Calculator', labelKey: 'demos.rateCalculator' }
  ];

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(router: Router) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.closeAll());

    effect(() => {
      const open = this.isMenuOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) this.animateMenuOpen();
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
    if (this.isDemosOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isDemosOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
    this.isDemosOpen.set(false);
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

  private animateMenuOpen(): void {
    if (this.prefersReducedMotion) return;

    this.ngZone.runOutsideAngular(() => {
      const nav = this.elementRef.nativeElement.querySelector('.header__nav');
      if (!nav) return;

      const links = nav.querySelectorAll('.header__link, .header__demos-link');
      const actions = nav.querySelector('.header__actions');

      gsap.fromTo(links,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.3, ease: 'power2.out' }
      );

      if (actions) {
        gsap.fromTo(actions,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.15, ease: 'power2.out' }
        );
      }
    });
  }
}
