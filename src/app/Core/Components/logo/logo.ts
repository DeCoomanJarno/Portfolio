import { AfterViewInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { animate } from 'animejs';
import * as svg from 'animejs/svg';
import { stagger } from 'animejs/utils';

@Component({
  selector: 'ui-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './logo.html',
  styleUrls: ['./logo.css']
})
export class LogoComponent implements AfterViewInit{
    ngAfterViewInit() {
      const svgEl = document.querySelector('svg');
      if (!svgEl) return;
  
      const paths = svgEl.querySelectorAll('path.line');
      const drawable = svg.createDrawable(paths);
  
      animate(drawable, {
        draw: ['0 0', '0 1'],
        easing: 'easeInOutQuad',
        duration: 2000,
        delay: stagger(2000),
        loop: false
      });
    }
  
}