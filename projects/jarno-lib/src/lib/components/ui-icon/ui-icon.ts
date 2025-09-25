import { booleanAttribute, Component, ElementRef, Input } from '@angular/core';
import { IconSeverity } from '../../utils/severity';
import { IconSize } from '../../utils/size';
import { IconService } from './icon.service';

@Component({
  selector: 'ui-icon',
  standalone: false,
  templateUrl: './ui-icon.html',
  styleUrl: './ui-icon.scss'
})
export class UiIcon {
  @Input({ required: true }) public icon!: string;
  @Input({ transform: booleanAttribute }) public customIcon = false;
  @Input() public size: IconSize = 'medium';
  @Input() public severity?: IconSeverity;

  //The elementRef is used in the tag component
  constructor(public elementRef: ElementRef, public iconService: IconService) {}

}
