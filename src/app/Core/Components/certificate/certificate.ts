import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconModule } from '@angularlibrary/ui-lib';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ui-certificate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconModule],
  templateUrl: './certificate.html',
  styleUrls: ['./certificate.scss']
})
export class Certificate {
  @Input() certificate!: {
    Title: string;
    Issuer: string;
    Date: string;
    Url?: string;
  };
}
