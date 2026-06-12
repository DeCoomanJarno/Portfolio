import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { XPDesktopApp } from '../../../Core/Services/premium-3d-animation.service';
import { ExpertiseItem } from '../../Models/calc-config';
import { ProjectPreviewModel } from '../../../Project/Models/project-model';
import { XpAppServicesComponent } from './apps/xp-app-services/xp-app-services';
import { XpAppProcessComponent } from './apps/xp-app-process/xp-app-process';
import { XpAppContactComponent } from './apps/xp-app-contact/xp-app-contact';

@Component({
  selector: 'app-xp-os',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    XpAppServicesComponent,
    XpAppProcessComponent,
    XpAppContactComponent
  ],
  templateUrl: './xp-os.html',
  styleUrls: ['./xp-os.scss']
})
export class XpOsComponent {
  @Input() apps: XPDesktopApp[] = [];
  @Input() openAppId: string | null = null;
  @Input() captureMode = false;
  @Input() expertise: ExpertiseItem[] = [];
  @Input() projects: ProjectPreviewModel[] = [];
  @Input() clockLabel = '';
  @Input() contactNote = '';
  @Input() contactEmail: string | undefined;

  @Output() openApp = new EventEmitter<string>();
  @Output() closeApp = new EventEmitter<void>();
  @Output() runAction = new EventEmitter<string>();

  onDesktopAppClick(app: XPDesktopApp): void {
    this.openApp.emit(app.id);
    if (app.action) this.runAction.emit(app.action);
  }

  get openAppMeta(): XPDesktopApp | null {
    if (!this.openAppId) return null;
    return this.apps.find(a => a.id === this.openAppId) ?? null;
  }
}
