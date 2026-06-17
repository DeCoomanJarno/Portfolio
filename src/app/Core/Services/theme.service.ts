import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'color-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>(this.readStoredMode());
  readonly isDark = signal(this.resolveIsDark(this.mode()));

  constructor() {
    this.apply(this.mode());

    this.document.defaultView
      ?.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.mode() === 'system') {
          this.isDark.set(this.resolveIsDark('system'));
        }
      });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    try {
      if (mode === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // storage unavailable
    }
    this.apply(mode);
  }

  toggle(): void {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  private apply(mode: ThemeMode): void {
    const root = this.document.documentElement;
    root.classList.remove('light', 'dark');
    if (mode !== 'system') {
      root.classList.add(mode);
    }
    this.isDark.set(this.resolveIsDark(mode));
  }

  private readStoredMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  private resolveIsDark(mode: ThemeMode): boolean {
    if (mode !== 'system') return mode === 'dark';
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
