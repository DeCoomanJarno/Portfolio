import { booleanAttribute, Component, HostBinding, Input } from '@angular/core';
import { IconSeverity, StateSeverity, StateSize, TitleSeverity, TitleSize } from '../../utils';

@Component({
  selector: 'ui-title',
  standalone: false,
  templateUrl: './title.html',
  styleUrl: './title.scss'
})
export class Title {
  @Input() public state?: StateSeverity;
  @Input() public title = '';
  @Input() public subtitle: string | undefined;
  @Input() public size: TitleSize = 'default';
  @Input() public stateSize: StateSize = 'medium';
  @Input() public compactTitle = false;
  @Input() public iconOnly = false;
  @Input({ transform: booleanAttribute }) public badge = false;
  @Input() public svgIcon = false;
  @Input() public icon = '';
  @Input() public iconTooltip: string | undefined;

  @Input() public searchTerm = '';

}
