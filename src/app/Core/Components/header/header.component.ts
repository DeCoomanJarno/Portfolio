import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../Services/language.service';
import { CommonDataService } from '../../Services/common-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(public languageService: LanguageService, public commonDataService: CommonDataService) {}

  closeNavbar() {
    const navbar = document.getElementById('navbarSupportedContent');
    if (navbar) {
      if(navbar.classList.contains('show'))
        navbar.classList.remove('show');
      else
      navbar.classList.add('show');
    }
  }

  ngOnInit() {
    // Set the initial language (you can get this from a setting or default to 'EN')
    this.languageService.setLanguage('EN');
  }

  changeLanguage(event: any) {
    const selectedLanguage = event.target.value;
    this.languageService.setLanguage(selectedLanguage);
  }
}
