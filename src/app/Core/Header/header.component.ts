import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../Services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',

})
export class HeaderComponent {
  navbarfixed = false;

  @HostListener('window:scroll', ['$event'])
  OnScroll() {
    if (window.scrollY > 40) {
      this.navbarfixed = true;
    }
    else {
      this.navbarfixed = false;
    }
  }
  constructor(private languageService: LanguageService) { }

  changeLanguage(event: any) {
    const selectedLanguage = event.target.value;  // Get the selected language value from the select element
    this.languageService.setLanguage(selectedLanguage);  // Update the selected language in the service
  }


}