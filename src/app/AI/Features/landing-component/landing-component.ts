import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing-component',
  imports: [RouterModule, TranslateModule],
  templateUrl: './landing-component.html',
  styleUrl: './landing-component.scss'
})
export class LandingComponent {

}
