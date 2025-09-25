import { Component, Input } from '@angular/core';
import { CardBackground } from '../../../utils/card-background';
import { CardPadding } from '../../../utils/card-padding';

@Component({
  selector: 'ui-card',
  standalone: false,
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  @Input() public clickable = false;
  @Input() public rounded = false;
  @Input() public border = false;
  @Input() public headerOnly = false;
  @Input() public selected = false;
  @Input() public backgroundColor: CardBackground = CardBackground.None;
  @Input() public padding: CardPadding = CardPadding.Default;
}
