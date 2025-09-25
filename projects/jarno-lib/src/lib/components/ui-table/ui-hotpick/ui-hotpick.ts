import { booleanAttribute, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-hotpick',
  standalone: false,
  templateUrl: './ui-hotpick.html',
  styleUrl: './ui-hotpick.scss'
})
export class UiHotpick {
  @Input() public hasLabel = true;
  @Input() public label = '';
  @Input() public active = false;
  @Input({ transform: booleanAttribute }) public hasIcon = false;
  @Input({ transform: booleanAttribute }) public svgIcon = false;
  @Input() public icon = '';
}
