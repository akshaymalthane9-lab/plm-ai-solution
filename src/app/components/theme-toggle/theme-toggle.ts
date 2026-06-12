import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle"
      type="button"
      (click)="themeService.toggle()"
      [attr.aria-label]="'Switch to ' + (themeService.theme() === 'dark' ? 'light' : 'dark') + ' theme'"
      [title]="'Switch to ' + (themeService.theme() === 'dark' ? 'light' : 'dark') + ' theme'"
    >
      <svg *ngIf="themeService.theme() === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
        ></path>
      </svg>
      <svg *ngIf="themeService.theme() === 'light'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.2A8 8 0 019.8 3.5 8.5 8.5 0 1020.5 14.2z"></path>
      </svg>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    .theme-toggle {
      display: grid;
      width: 34px;
      height: 34px;
      min-width: 34px;
      padding: 0;
      place-items: center;
      border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      border-radius: 50%;
      background: color-mix(in srgb, currentColor 8%, transparent);
      color: inherit;
      box-shadow: none;
    }
    .theme-toggle:hover {
      background: color-mix(in srgb, currentColor 14%, transparent);
    }
    svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
