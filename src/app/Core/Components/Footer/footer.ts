import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonDataService } from '../../Services/common-data.service';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';


@Component({
    selector: 'app-footer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule],
    templateUrl: './footer.html',
    styleUrl: './footer.css'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(public commonDataService: CommonDataService) {
    library.add(fab); // Add all solid and brand icons to the library}
  }
}
