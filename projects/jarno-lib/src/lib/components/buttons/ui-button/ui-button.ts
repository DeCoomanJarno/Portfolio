import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconTheme } from '../../../utils/icon-theme';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'ui-button',
  standalone: false,
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.scss',
})
export class UiButton extends MatButton{
  @Input() override color: IconTheme = 'primary';
  @Output() public clicked = new EventEmitter<MouseEvent>();
  @Input() tooltip?: string;
  @Input() public tooltipDisabled = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
