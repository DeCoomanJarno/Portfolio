import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { SidePanelService } from '../side-panel';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'web-page',
  standalone: false,
  templateUrl: './web-page.html',
  styleUrl: './web-page.scss'
})
export class WebPage  {
  constructor(public panel: SidePanelService, public injector: Injector) {}
}
