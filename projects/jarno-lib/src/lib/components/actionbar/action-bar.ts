import { Component, inject, Injector, Input, runInInjectionContext } from '@angular/core';
import { ActionItem, IAction } from '../snackbar';
import { ActionButtonSize } from '../../utils/size';
import { IconTheme } from '../../utils/icon-theme';

export function runAction(injector: Injector, action: IAction | undefined): void {
    runInInjectionContext(injector, () => {
      action?.do();
    });
}
@Component({
  selector: 'ui-action-bar',
  standalone: false,
  templateUrl: './action-bar.html',
  styleUrl: './action-bar.scss'
})
export class ActionBar {
  @Input({ required: true }) public actions!: ActionItem[];
  @Input() public color: IconTheme = 'primary';
  @Input() public size: ActionButtonSize = 'small';
  @Input() public direction: 'row-reverse' | 'column' = 'row-reverse';

  public injector = inject(Injector);

  public moreThanTwoActions(): boolean {
    return this.actions ? this.actions.length > 2 : false;
  }

  public performAction(event: Event, action: IAction): void {
    event.stopPropagation();

    runAction(this.injector, action);
  }

}
