import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject, viewChild, afterNextRender } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonDataService } from '../../Services/common-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import VanillaTilt from 'vanilla-tilt';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnDestroy {
  readonly commonDataService = inject(CommonDataService);
  private readonly translate = inject(TranslateService);
  readonly currentYear = new Date().getFullYear();

  // DOM References
  readonly footerContainer = viewChild.required<ElementRef>('footerContainer');
  readonly tiltCard = viewChild.required<ElementRef>('tiltCard');
  
  // The Perfect Clock: Ticks immediately (0ms delay), then every 1000ms.
  // We format it to your exact local time in Belgium.
  readonly localTime = toSignal(
    timer(0, 1000).pipe(
      map(() => {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Brussels',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit', // Adding seconds proves it is live
          hour12: false
        }).format(new Date());
      })
    ),
    { initialValue: this.translate.instant('footer.syncing') } // Fallback before first tick
  );

  // Hardcoded to true for now, but could be tied to an API or config
  readonly isAvailableForWork = true;

  constructor() {
    afterNextRender(() => {
      this.initAnimations();
      this.initVanillaTilt();
    });
  }

  private initAnimations(): void {
    const footer = this.footerContainer().nativeElement;
    
    // Select all the elements we want to stagger
    const staggerItems = footer.querySelectorAll('.gsap-reveal');
    const ambientGlow = footer.querySelector('.footer__ambient-glow');

    // Create a GSAP Timeline attached to a ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%', // Starts animation when top of footer hits 90% of viewport
        toggleActions: 'play none none reverse'
      }
    });

    // 1. Ignite the ambient glow
    tl.from(ambientGlow, {
      opacity: 0,
      duration: 1.1,
      ease: 'power2.out'
    }, 0);

    // 2. Fade content in without positional movement to avoid CLS.
    tl.from(staggerItems, {
      opacity: 0,
      duration: 0.55,
      stagger: 0.15,
      ease: 'power1.out'
    }, 0.2); // Start slightly after the glow ignites
  }

  private initVanillaTilt(): void {
    const card = this.tiltCard().nativeElement;
    VanillaTilt.init(card, {
      max: 6, 
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.02,
      perspective: 1000
    });
  }

  ngOnDestroy(): void {
    // Kill GSAP triggers to prevent memory leaks on route changes
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    const card = this.tiltCard()?.nativeElement;
    if (card && card.vanillaTilt) {
      card.vanillaTilt.destroy();
    }
  }
}