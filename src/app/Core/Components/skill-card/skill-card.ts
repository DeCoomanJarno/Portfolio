import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'ui-skill-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, NgClass],
  templateUrl: './skill-card.html',
  styleUrl: './skill-card.css'
})
export class SkillCard implements AfterViewInit {
  @Input() category!: {
    Name: string;
    Icon: string;
    Skills: { Name: string; IconUrl?: string; Level?: string }[];
  };

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const parentTimeline = this.el.nativeElement.parentElement;
    if (!parentTimeline) return;

    const items = parentTimeline.querySelectorAll('.skill-card') as NodeListOf<HTMLElement>;

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

    observer.observe(parentTimeline);
  }

public getSkillKey(skill: string): string {
  // Example: "skill.level.advanced" -> "advanced"
  const parts = skill.split('.');
  return parts[parts.length - 1].toLowerCase(); // returns 'advanced', 'intermediate', 'basic'
}
}