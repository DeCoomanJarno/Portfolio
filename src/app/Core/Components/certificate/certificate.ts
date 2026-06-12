import { AfterViewInit, Component, ElementRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'ui-certificate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './certificate.html',
  styleUrl: './certificate.css'
})
export class Certificate implements AfterViewInit {
  @Input() certificate!: {
    Title: string;
    Issuer: string;
    Date: string;
    Url?: string;
  };

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const container = this.el.nativeElement.parentElement;
    if (!container) return;
  
      const items = container.querySelectorAll('.certificate-card') as NodeListOf<HTMLElement>;
  
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Animate all items one by one
              animate(items, {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                delay: stagger(100), // stagger 200ms between each item
                easing: 'easeOutCubic'
              });
  
              obs.disconnect(); // stop observing once animated
            }
          });
        },
        { threshold: 0.2 }
      );
  
      observer.observe(container);
  }
}