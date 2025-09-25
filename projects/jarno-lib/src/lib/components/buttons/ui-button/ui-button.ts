import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconTheme } from '../../../utils/icon-theme';

@Component({
  selector: 'ui-button',
  standalone: false,
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.scss'
})
export class UiButton {
  @Input() color: IconTheme = 'primary';
  @Input() icon?: string;
  @Output() public clicked = new EventEmitter<MouseEvent>();
  @Input() tooltip?: string;
  @Input() public tooltipDisabled = false;
  @Input() public disabled = false;
}
