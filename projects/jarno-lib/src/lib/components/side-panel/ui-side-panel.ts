import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-side-panel',
  standalone: false,
  templateUrl: './ui-side-panel.html',
  styleUrl: './ui-side-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidePanel{
  /** Whether the panel is open */
  @Input() open = false;

  /** Side to slide from: 'left' | 'right' */
  @Input() position: 'left' | 'right' = 'right';

  /** Emits when user closes the panel */
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
