import { ChangeDetectionStrategy, Component, signal, afterNextRender, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="back-to-top"
      [class.visible]="visible()"
      type="button"
      (click)="scrollToTop()"
      aria-label="Back to top">
      <i class="bi bi-chevron-up" aria-hidden="true"></i>
    </button>
  `,
  styles: [`
    @use 'styles/index' as *;

    .back-to-top {
      position: fixed;
      bottom: var(--space-5);
      right: var(--space-5);
      z-index: var(--z-raised);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-outline);
      background: var(--color-surface);
      color: var(--color-on-surface);
      box-shadow: var(--shadow-2);
      cursor: pointer;
      font-size: 1.25rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(0.5rem);
      transition: opacity var(--duration-base) var(--ease-out),
        visibility var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out),
        color var(--duration-fast) var(--ease-out),
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);

      &.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
        background: var(--color-primary-soft);
      }

      @media print {
        display: none !important;
      }
    }
  `]
})
export class BackToTopComponent {
  readonly visible = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const onScroll = () => this.visible.set(window.scrollY > 400);
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
