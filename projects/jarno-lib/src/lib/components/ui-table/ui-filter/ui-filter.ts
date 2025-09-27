import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OverlayRegisterService } from '../services/overlay-register.service';
import { TranslateService } from '@ngx-translate/core';

export type UiFilterColumnType = 'text' | 'select' | 'number' | 'date' | 'boolean';

export interface UiFilterColumn {
  key: string;
  label: string;
  type?: UiFilterColumnType;
  options?: { value: any; label: string }[]; // for select
  placeholder?: string;
  value?: any;
}

@Component({
  selector: 'ui-filter',
  standalone: false,
  templateUrl: './ui-filter.html',
  styleUrl: './ui-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFilter {
  @Input() public placeholder: string;
  @Input() public hotpicks:boolean = false;
  @Input() public preHotpick = false;
  @Input() public filterExpand = false;
  @Input() public control!: FormControl<string>;

  @ViewChild('advancedFilterRef') public advancedFilterRef!: ElementRef;

  constructor(
    private _overlayRegisterService: OverlayRegisterService,
    public elementRef: ElementRef,
    private _translateService: TranslateService
  ) {
    this.placeholder = _translateService.instant('PlaceHolders.Search')
  }
  public closeOverlays(): void {
    this._overlayRegisterService.closeAll();
  }
}
