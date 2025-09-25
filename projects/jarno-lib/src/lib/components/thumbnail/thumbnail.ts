import { Component, ContentChild, ElementRef, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-thumbnail',
  standalone: false,
  templateUrl: './Thumbnail.html',
  styleUrl: './Thumbnail.scss'
})
export class Thumbnail {
  @Output() public close: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() public back: EventEmitter<MouseEvent> = new EventEmitter();
  @Input() public allowClose = true;
  @Input() public closeTooltip = 'Close';
  @Input() public showBack = false;
  @Input() public backTooltip = 'Back';

  public closeClicked(event: MouseEvent): void {
    this.close.emit(event);
  }

  public backClicked(event: MouseEvent): void {
    this.back.emit(event);
  }

}
