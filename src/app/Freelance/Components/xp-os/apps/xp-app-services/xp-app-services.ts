import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ExpertiseItem } from '../../../../Models/calc-config';

@Component({
  selector: 'app-xp-app-services',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './xp-app-services.html',
  styleUrls: ['./xp-app-services.scss']
})
export class XpAppServicesComponent {
  @Input() expertise: ExpertiseItem[] = [];
}
