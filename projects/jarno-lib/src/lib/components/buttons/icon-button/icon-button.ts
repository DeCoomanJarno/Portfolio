import { booleanAttribute, Component, Input } from '@angular/core';
import { IconSize } from '../../../utils/size';
import { IconTheme } from '../../../utils/icon-theme';
import { IconSeverity } from '../../../utils/severity';

@Component({
  selector: 'ui-icon-button',
  standalone: false,
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss'
})
export class IconButton {
  @Input() public size: IconSize = 'medium';
  @Input() public theme?: IconTheme = 'primary';
  @Input() public badgeSeverity?: IconSeverity = IconSeverity.Error;
  @Input({ transform: booleanAttribute }) public svgIcon?: boolean = false;
  @Input({ required: true }) public icon!: string;
  @Input({ transform: booleanAttribute }) public active?: boolean = false;
  @Input({ transform: booleanAttribute }) public focused?: boolean = false;
  @Input({ transform: booleanAttribute }) public disabled?: boolean = false;
  @Input({ transform: booleanAttribute }) public badge?: boolean = false;

  public GetBadgeSeverity()
  {
    switch(this.badgeSeverity)
    {
     case IconSeverity.Error:
      return 'warn';
     case IconSeverity.Info:
      return 'primary';
     case IconSeverity.Warning:
      return 'accent';
      default:
        return 'primary';
    }
  }
}
