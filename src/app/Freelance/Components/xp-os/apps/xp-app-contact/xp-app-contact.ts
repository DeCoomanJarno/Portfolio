import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { XPDesktopApp } from '../../../../../Core/Services/premium-3d-animation.service';
import { CommonDataService } from '../../../../../Core/Services/common-data.service';

export function buildContactXPApp(translate: TranslateService): XPDesktopApp {
  return {
    id: 'contact',
    iconLabel: translate.instant('freelance.hero.apps.contact') || 'Contact',
    title: translate.instant('freelance.hero.apps.contact') || 'Contact',
    renderContent: (ctx, bodyRect, helpers) => {
    },
    action: 'modal:quote'
  };
}

@Component({
  selector: 'app-xp-app-contact',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './xp-app-contact.html',
  styleUrls: ['./xp-app-contact.scss']
})
export class XpAppContactComponent implements OnInit {
  @Input() note = '';
  @Input() email: string | undefined;
  constructor(private commonData: CommonDataService)
  {
    this.email = commonData.CommonData?.Contact.Email;
  }
  ngOnInit()
  {
    if(this.email === undefined)
      this.email = this.commonData.CommonData?.Contact.Email;
  }
}
