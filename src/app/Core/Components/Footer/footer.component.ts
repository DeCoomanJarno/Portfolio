import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule,NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css' ,

})
export class FooterComponent {
  navbarfixed = false;
 
  @HostListener('window:scroll', ['$event'])
OnScroll() {
  if(window.scrollY > 40)
  {
    this.navbarfixed = true;
  }
  else
    {
      this.navbarfixed = false;
    }
  

}


}