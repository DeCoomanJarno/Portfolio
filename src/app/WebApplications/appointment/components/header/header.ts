import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'JarnoLib';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/Appointments/login']);
  }
}
