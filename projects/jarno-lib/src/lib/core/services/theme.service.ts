import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkMode$.asObservable();

  constructor() {
    // Optionally, read from localStorage
    const saved = localStorage.getItem('darkMode') === 'true';
    this.setDarkMode(saved);
  }

  setDarkMode(enabled: boolean) {
    this.darkMode$.next(enabled);
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', enabled.toString());
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode$.value);
  }
}
