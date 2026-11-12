import { Component, inject } from '@angular/core';
import { AuthService, User } from '@angularlibrary/core-lib';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-page',
  standalone: false,
  templateUrl: './appointment-page.html',
  styleUrl: './appointment-page.scss'
})
export class AppointmentPageComponent {
  copiedMessage = '';
  auth = inject(AuthService);
  demoUsers = this.auth.getDemoCredentials();

  constructor(
    private readonly router: Router
  ) {
  }

  isLoginRoute(): boolean {
    const cleanUrl = this.router.url.split('?')[0].toLowerCase();
    return cleanUrl === '/appointments/login' || cleanUrl === '/appointments/login/';
  }

  async copyToClipboard(value: string, label: string): Promise<void> {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.copiedMessage = `${label} copied`;
    } catch {
      this.copiedMessage = `Unable to copy ${label.toLowerCase()}`;
    }
  }

  isAdmin(): boolean {
    const user = this.auth.getCurrentUser() as User | null;
    if (!user?.roles?.length) return false;
    return user.roles.some((role) => String(role?.name || '').toLowerCase().includes('admin'));
  }

  isLoggedIn(): boolean {
    return this.auth.getCurrentUser() !== null;
  }
}
