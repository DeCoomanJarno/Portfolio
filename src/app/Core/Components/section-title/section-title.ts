import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import { animate, stagger } from 'animejs';

@Component({
  selector: 'ui-section-title',
  standalone: true,
  templateUrl: './section-title.html',
  styleUrls: ['./section-title.css']
})
export class SectionTitle implements AfterViewInit {
  @Input() title!: string;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const redLine = this.el.nativeElement.querySelector('.line.red');
    const blueLine = this.el.nativeElement.querySelector('.line.blue');
    if (!redLine || !blueLine) return;

    const totalDuration = 1000;
    const overlapPercent = 0.4; // blue starts at 70% of red

    // Animate red line
    animate(redLine, {
      width: ['0%', '100%'],
      duration: totalDuration,
      easing: 'easeInOutSine'
    });

    // Animate blue line with overlap
    animate(blueLine, {
      width: ['0%', '100%'],
      duration: totalDuration,
      easing: 'easeInOutSine',
      delay: totalDuration * overlapPercent // start before red finishes
    });
  }
  }
