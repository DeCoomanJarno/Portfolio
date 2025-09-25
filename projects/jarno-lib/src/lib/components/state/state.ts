import { booleanAttribute, Component, Input } from '@angular/core';
import { StateSeverity, StateSize } from '../../utils';

@Component({
  selector: 'ui-state',
  standalone: false,
  templateUrl: './state.html',
  styleUrl: './state.scss'
})
export class State {
  @Input() public state?: StateSeverity;
  @Input() public icon = '';
  @Input() public size: StateSize = 'large';
  @Input({ transform: booleanAttribute }) public circle = false;
  @Input({ transform: booleanAttribute }) public svgIcon = false;
  @Input({ transform: booleanAttribute }) public iconOnly = false;
  @Input({ transform: booleanAttribute }) public stateOnly = false;

}
