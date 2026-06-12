import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<AppTheme>(
    localStorage.getItem('nexaplm_theme') === 'light' ? 'light' : 'dark',
  );

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme) {
    this.theme.set(theme);
    localStorage.setItem('nexaplm_theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme) {
    this.document.documentElement.classList.toggle('nexaplm-dark', theme === 'dark');
    this.document.documentElement.classList.toggle('nexaplm-light', theme === 'light');
    this.document.documentElement.style.colorScheme = theme;
  }
}
