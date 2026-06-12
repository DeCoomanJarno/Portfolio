import { Injectable } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor() {}

  /**
   * Create a staggered reveal animation for elements
   * @param selector - CSS selector for elements to animate
   * @param delay - Time to wait before starting animation
   */
  staggerReveal(selector: string, delay: number = 0): gsap.core.Timeline {
    const elements = document.querySelectorAll(selector);
    
    const tl = gsap.timeline({ delay });
    
    elements.forEach((el, index) => {
      tl.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, index * 0.1);
    });
    
    return tl;
  }

  /**
   * Animate elements on scroll into view
   * @param selector - CSS selector for elements to animate
   * @param options - Animation options
   */
  animateOnScroll(
    selector: string,
    options: {
      duration?: number;
      distance?: number;
      ease?: string;
      stagger?: number;
    } = {}
  ): void {
    const {
      duration = 0.8,
      distance = 50,
      ease = 'power3.out',
      stagger = 0
    } = options;

    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: distance,
        duration,
        ease,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
          markers: false
        }
      });
    });
  }

  /**
   * Create a parallax effect
   * @param selector - CSS selector for the element
   * @param speed - Parallax speed multiplier (0-1)
   */
  parallax(selector: string, speed: number = 0.5): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    gsap.to(element, {
      y: () => window.innerHeight * speed,
      scrollTrigger: {
        trigger: element,
        scrub: 1,
        markers: false
      }
    });
  }

  /**
   * Hover lift animation for cards
   * @param selector - CSS selector for cards
   */
  hoverLift(selector: string): void {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      const element = el as HTMLElement;
      
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          y: -15,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          y: 0,
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  /**
   * Text split animation
   * @param selector - CSS selector for text elements
   */
  textReveal(selector: string, delay: number = 0): gsap.core.Timeline {
    const elements = document.querySelectorAll(selector);
    const tl = gsap.timeline({ delay });
    
    elements.forEach((el, index) => {
      const text = el.textContent || '';
      const span = document.createElement('span');
      
      // Split text into characters
      const chars = text.split('').map(char => {
        const c = document.createElement('span');
        c.textContent = char === ' ' ? '\u00A0' : char;
        c.style.display = 'inline-block';
        return c;
      });
      
      el.innerHTML = '';
      chars.forEach(c => el.appendChild(c));
      
      tl.from(chars, {
        opacity: 0,
        y: 10,
        duration: 0.05,
        stagger: 0.03,
        ease: 'back.out'
      }, index * 0.2);
    });
    
    return tl;
  }

  /**
   * Counter animation for numbers
   * @param selector - CSS selector for number element
   * @param target - Target number to count to
   * @param duration - Animation duration in seconds
   */
  countUp(selector: string, target: number, duration: number = 2): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;
    
    gsap.to(element, {
      innerText: target,
      duration,
      ease: 'power2.out',
      snap: { innerText: 1 } // Only show whole numbers
    });
  }

  /**
   * Smooth scroll to element
   * @param selector - CSS selector of target element
   * @param offset - Offset from top in pixels
   */
  smoothScrollTo(selector: string, offset: number = 0): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    
    gsap.to(window, {
      scrollTo: elementPosition - offset,
      duration: 0.8,
      ease: 'power2.inOut'
    });
  }

  /**
   * Fade background color animation on scroll
   * @param selector - CSS selector for element
   * @param fromColor - Starting color
   * @param toColor - Ending color
   */
  colorShift(selector: string, fromColor: string, toColor: string): void {
    gsap.to(selector, {
      backgroundColor: toColor,
      scrollTrigger: {
        trigger: selector,
        start: 'top center',
        end: 'bottom center',
        scrub: 1
      }
    });
  }

  /**
   * Pulse animation for CTA buttons
   * @param selector - CSS selector for button
   */
  pulse(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    gsap.timeline({ repeat: -1 })
      .to(element, {
        boxShadow: '0 0 0 10px rgba(0, 183, 194, 0)',
        duration: 2,
        ease: 'power1.out'
      }, 0)
      .to(element, {
        scale: 1.05,
        duration: 2,
        ease: 'power1.out'
      }, 0);
  }

  /**
   * Clear all animations (useful for cleanup)
   */
  killAll(): void {
    gsap.globalTimeline.clear();
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
}
