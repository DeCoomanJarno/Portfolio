import { AfterViewInit, Component, ElementRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'ui-timeline-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './timeline-item.html',
  styleUrls: ['./timeline-item.css']
})
export class TimelineItem implements AfterViewInit {
  @Input() title!: string;
  @Input() badge!: string;
  @Input() dates!: string;
  @Input() location!: string;
  @Input() description!: string;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const parentTimeline = this.el.nativeElement.parentElement;
    if (!parentTimeline) return;

    const items = parentTimeline.querySelectorAll('.timeline-item') as NodeListOf<HTMLElement>;

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

            // Animate each item's line separately
            items.forEach((item, index) => {
              const line = item.querySelector('.timeline-line') as HTMLElement;
              if (line) {
                animate(line, {
                  scaleY: [0, 1],
                  opacity: [0, 1],
                  duration: 800,
                  delay: 100 * index, // match the content stagger
                  easing: 'easeOutCubic'
                });
              }
            });

            obs.disconnect(); // stop observing once animated
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(parentTimeline);
  }
}
