import { AfterContentInit, ContentChildren, Directive, OnDestroy, QueryList } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IconSize } from '../../utils';
import { IconButton } from '../buttons';

@Directive()
export class SetSizeWithIconButtonsComponent implements OnDestroy, AfterContentInit {
    @ContentChildren(IconButton, { descendants: true })
    public iconButtons!: QueryList<IconButton>;

    public size: IconSize = 'small';

    private _destroyedSubject: Subject<void> = new Subject<void>();

    public ngAfterContentInit(): void {
      if (this.iconButtons) {
        this.updateIconButtons();
        this.iconButtons.changes.pipe(takeUntil(this._destroyedSubject)).subscribe(() => {
          this.updateIconButtons();
        });
      }
    }

    public updateIconButtons(): void {
      this.iconButtons.forEach(button => {
        button.size = this.size;
      });
    }

    public ngOnDestroy(): void {
      this._destroyedSubject.next();
      this._destroyedSubject.complete();
    }
}
