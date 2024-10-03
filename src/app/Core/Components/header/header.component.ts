import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../Services/language.service';

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
  constructor(public languageService: LanguageService) {}

  ngOnInit() {
    // Set the initial language (you can get this from a setting or default to 'EN')
    this.languageService.setLanguage('EN');
  }

  changeLanguage(event: any) {
    const selectedLanguage = event.target.value;
    this.languageService.setLanguage(selectedLanguage);
  }

}