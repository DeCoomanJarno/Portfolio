import { Component } from '@angular/core';
import { CommonData, CommonDataService } from '../../Services/common-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css' ,

})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(public commonDataService: CommonDataService) {}
}