import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.html',
  styleUrls: ['./logo.scss']
})
export class LogoComponent {}
