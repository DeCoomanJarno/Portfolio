import { AfterViewInit, Component, ElementRef, Input, Inject, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ProjectPreviewModel } from '../../Models/project-model';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { animate, stagger } from 'animejs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ui-project-item',
  imports: [RouterLink, IconPipe, MatTooltipModule, TranslatePipe],
  templateUrl: './project-item.html',
  styleUrls: ['./project-item.css']
})
export class ProjectItemComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() project!: ProjectPreviewModel;
  hasMultipleImages: boolean | undefined;
  currentImageIndex = 0;
  private intervalId?: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private el: ElementRef) {}

  ngOnInit(): void {
    this.hasMultipleImages = this.project.images && this.project.images.length > 1;

    // Auto-slide only in browser context
    if (isPlatformBrowser(this.platformId) && this.hasMultipleImages) {
      this.startImageRotation();
    }
  }

  ngAfterViewInit(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  const cards = this.el.nativeElement.querySelectorAll('.project-card.animate') as NodeListOf<HTMLElement>;

  // Create observer for visible items only
  const observer = new IntersectionObserver(
    (entries, obs) => {
      const visibleCards = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target as HTMLElement);

      if (visibleCards.length > 0) {
        // Animate only the visible batch, with delay between each
        animate(visibleCards, {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: stagger(120),
          easing: 'easeOutCubic'
        });

        // Stop observing already animated items
        visibleCards.forEach(card => obs.unobserve(card));
      }
    },
    {
    }
  );

  cards.forEach(card => observer.observe(card));
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  private startImageRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % (this.project.images?.length || 1);
    }, 4000); // 4 seconds per slide
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
