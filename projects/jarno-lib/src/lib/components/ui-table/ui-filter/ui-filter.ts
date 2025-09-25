import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { OverlayRegisterService } from '../services/overlay-register.service';
import { SetSizeWithIconButtonsComponent } from '../iconbuttons';

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
export class UiFilter extends SetSizeWithIconButtonsComponent implements OnInit {
  @Input() public placeholder = 'Search';
  @Input() public hotpicks = false;
  @Input() public preHotpick = false;
  @Input() public filterExpand = false;
  @Input() public control!: FormControl<string>;

  @ViewChild('advancedFilterRef') public advancedFilterRef!: ElementRef;

  public isMobile$!: any;

  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _overlayRegisterService: OverlayRegisterService,
    public elementRef: ElementRef
  ) {
    super();
  }

  ngOnInit(): void {
    // Initialize isMobile$ here after _breakpointObserver is available
    this.isMobile$ = this._breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(map(result => result.matches));
  }

  public closeOverlays(): void {
    this._overlayRegisterService.closeAll();
  }
}
