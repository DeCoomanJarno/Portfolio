import { booleanAttribute, Component, ElementRef, EventEmitter, HostBinding, Inject, InjectionToken, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, interval, map, merge, fromEvent, filter, startWith, switchMap, EMPTY, scan, takeWhile } from 'rxjs';
import { SnackbarSeverity } from '../../utils/severity';
const secondsToMilliseconds = (seconds: number): number => seconds * 1000;

const SNACKBAR_TIMEOUT_FALLBACK = 15; //seconds

export const severityStateIcon = (state: SnackbarSeverity, customIcon?: { icon: string; svgIcon?: boolean }): { icon: string; svgIcon?: boolean } => {
    switch (state) {
      case 'error':
        return { icon: 'icon_error', svgIcon: true };
      case 'warning':
        return { icon: 'icon_warning', svgIcon: true };
      case 'success':
        return customIcon ? customIcon : { icon: 'icon_success', svgIcon: true };
      default:
        return customIcon ? customIcon : { icon: 'icon_info', svgIcon: true };
    }
  }
export const SNACKBAR_DEFAULT_TIMEOUT = new InjectionToken<number>(
  'DEFAULT_SNACKBAR_TIMEOUT',
  {
    providedIn: 'root',
    factory: (): number => SNACKBAR_TIMEOUT_FALLBACK
  }
);

export const SNACKBAR_SHOW_TIMEOUT_PROGRESS = new InjectionToken<boolean>(
  'SNACKBAR_SHOW_TIMEOUT_PROGRESS',
  { providedIn: 'root', factory: (): boolean => false }
);

export const NOTIFICATIONS_SNOOZING_ENABLED = new InjectionToken<boolean>(
  'NOTIFICATIONS_SNOOZING_ENABLED',
  { providedIn: 'root', factory: (): boolean => true }
);

@Component({
  selector: 'snackbar',
  standalone: false,
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss'
})
export class Snackbar implements OnInit, OnChanges {
  @Input({ required: true }) public title!: string;
  @Input() public title$?: Observable<string>;
  @Input() public message?: string;
  @Input() public message$?: Observable<string>;
  @Input() public actions?: ActionItem[];
  @Input() public state: SnackbarSeverity = SnackbarSeverity.Info;
  @Input({ transform: booleanAttribute }) public hideClose = false;
  @Input({ transform: booleanAttribute }) public headerOnly = false;
  @Input({ transform: booleanAttribute }) public clickable = false;
  @Input() public icon?: string;
  @Input({ transform: booleanAttribute }) public svgIcon = false;
  /**
   * In seconds
   */
  @Input() public timeout?: number | null;
  @Output() public closeClicked = new EventEmitter<void>();
  @Output() public snoozeClicked = new EventEmitter<void>();
  @Output() public timeoutReached = new EventEmitter<void>();
  public mappedIcon: { icon: string; svgIcon?: boolean } = {
    icon: '',
    svgIcon: false
  };
  public progress = 100;
  public showProgressBar = false;
  public mappedActions?: ActionItem[];
  private _pauseSubject = new BehaviorSubject<boolean | undefined>(undefined);
  @HostBinding('attr.title') private _title = ''; // fix for native tooltip
  private _timerSubscription?: Subscription;

  constructor(
    private _element: ElementRef,
    @Inject(SNACKBAR_DEFAULT_TIMEOUT) private _defaultTimeout: number,
    @Inject(SNACKBAR_SHOW_TIMEOUT_PROGRESS) private _showProgressBar: boolean,
    @Inject(NOTIFICATIONS_SNOOZING_ENABLED)
    public notificationSnoozingEnabled: boolean
  ) {}

  public get pause(): boolean | undefined {
    return this._pauseSubject.value;
  }

  @Input({ transform: booleanAttribute }) public set pause(value: boolean) {
    this._pauseSubject.next(value);
  }

  public ngOnInit(): void {
    this.mappedIcon = this._getMappedIcon();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['state'] || changes['icon'] || changes['svgIcon']) {
      this.mappedIcon = this._getMappedIcon();
    }

    if (changes['timeout']) {
      this._initTimer();

      this.showProgressBar = this._getShowProgressBar();
    }

    if (changes['actions'] || changes['hideClose']) {
      this._updateMappedActions();
    }
  }

  public handleSnoozeClick(event: MouseEvent): void {
    event.stopPropagation();

    this.snoozeClicked.emit();
  }

  public handleCloseClick(event: MouseEvent): void {
    event.stopPropagation();

    this.closeClicked.emit();
  }

  private _getMappedIcon(): typeof this.mappedIcon {
    return severityStateIcon(
      this.state,
      this.icon ? { icon: this.icon ?? '', svgIcon: this.svgIcon } : undefined
    );
  }

  private _initTimer(): void {
    const period = 50; // This period determines how smooth the timer bar will decrease
    const timeout = this.timeout ?? this._defaultTimeout;

    const remainingTimeMs = secondsToMilliseconds(timeout);
    const interval$ = interval(period).pipe(map(() => -1 * period));
    const pause$ = merge(
      fromEvent(this._element.nativeElement, 'mouseenter'),
      this._pauseSubject.asObservable().pipe(filter(pause => !!pause))
    ).pipe(
      map(() => (this._pauseSubject.value !== undefined ? this.pause : true))
    );
    const resume$ = merge(
      fromEvent(this._element.nativeElement, 'mouseleave'),
      this._pauseSubject.asObservable().pipe(filter(pause => !pause))
    ).pipe(
      map(() => (this._pauseSubject.value !== undefined ? this.pause : false))
    );

    this._timerSubscription?.unsubscribe();
    this._timerSubscription = undefined;

    const originalTimeoutMs = secondsToMilliseconds(timeout);
    this._timerSubscription = merge(pause$, resume$)
      .pipe(
        startWith(false),
        switchMap(val => (val ? EMPTY : interval$)),
        scan((acc, curr) => (curr ? curr + acc : acc), remainingTimeMs),
        takeWhile(time => time >= 0)
      )
      .subscribe(remainingTimeMs => {
        this.progress = (remainingTimeMs / originalTimeoutMs) * 100; // Progress is in percentage

        if (remainingTimeMs === 0) {
          this.timeoutReached.emit();
        }
      });
  }

  private _getShowProgressBar(): boolean {
    const hideProgressBar =
      !this._showProgressBar ||
      this.timeout === 0 ||
      (this.timeout == null && this._defaultTimeout === 0);
    return !hideProgressBar;
  }

  private _updateMappedActions(): void {
    if (this.hideClose) {
      this.mappedActions = this.actions;
      return;
    }

    this.mappedActions = this.actions?.map(action => ({
      ...action,
      action: new CustomAction(() => {
        action.action.do();
        this.closeClicked.emit();
      })
    }));
  }
}
export type ActionItem = {
  label: string;
  action: IAction;
};
export interface IAction {
  do: () => void;
}
export class CustomAction implements IAction {

  constructor(public action: () => void) {}

  public do(): void {
    this.action();
  }

}
