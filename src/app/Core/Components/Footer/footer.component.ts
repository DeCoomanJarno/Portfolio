import { Component } from '@angular/core';
import { CommonDataService } from '../../Services/common-data.service';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons'; // For brand icons


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css' ,

})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(public commonDataService: CommonDataService) {
    library.add(fab); // Add all solid and brand icons to the library}
  }
}