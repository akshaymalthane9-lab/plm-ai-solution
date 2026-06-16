import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeToggle],
  template: `
    <header class="topnav" [class.light-theme]="themeService.theme() === 'light'">
      <button class="brand" type="button" (click)="router.navigate(['/dashboard'])">
        <span class="brand-mark">N</span>
        <span>NexaPLM</span>
      </button>

      <nav class="top-tabs" aria-label="Primary navigation">
        <button type="button" [class.active]="isWorkspace()" (click)="router.navigate(['/dashboard'])">Workspace</button>
        <button type="button" [class.active]="isItems()" (click)="router.navigate(['/items'])">Items</button>
        <button type="button" [class.active]="isChanges()" (click)="router.navigate(['/changes'])">Changes</button>
        <button type="button" (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">Regulatory</button>
        <button type="button" (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'reports' } })">Reports</button>
      </nav>

      <div class="top-actions">
        <div class="client-chip">
          <span>Client</span>
          <i></i>
          <strong>Strides</strong>
        </div>
        <button class="ai-button" type="button">✦ AI Assistant</button>
        <app-theme-toggle></app-theme-toggle>
        <button class="round-button" type="button" aria-label="Search">⌕</button>
        <button class="round-button notification-button" type="button" aria-label="Notifications">
          <span>⌂</span>
          <span class="notification-dot"></span>
        </button>
        <button class="round-button" type="button" aria-label="Download">↓</button>
        <div class="user-menu">
          <button class="avatar" type="button" aria-label="Open account menu">{{ initials }}</button>
          <nav class="user-dropdown" aria-label="User menu">
            <div class="account-summary">
              <strong>{{ userName }}</strong>
              <span>{{ userService.currentRole() }}</span>
            </div>
            <a href="#" (click)="$event.preventDefault()">My Profile</a>
            <a href="#" (click)="$event.preventDefault()">Password Change</a>
            <a href="#" (click)="$event.preventDefault()">Help</a>
            <a href="#" (click)="$event.preventDefault()">About NexaPLM</a>
            <a href="#" class="logout-link" (click)="logout($event)">Logout</a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: `
    .topnav {
      --surface: #161b22;
      --surface-2: #21262d;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #2f81f7;
      --purple: #bc8cff;
      --red: #f85149;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 100;
      display: flex;
      height: 52px;
      align-items: center;
      gap: 0;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .topnav.light-theme {
      --surface: #ffffff;
      --surface-2: #eef2f7;
      --border: #d8dee7;
      --text: #172033;
      --muted: #59677c;
      --accent: #1f6feb;
      --purple: #8250df;
      --red: #cf222e;
    }
    button {
      font: inherit;
      cursor: pointer;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 24px;
      border: 0;
      background: transparent;
      color: var(--accent);
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -.3px;
    }
    .brand-mark {
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #fff;
      font-size: 13px;
      font-weight: 900;
    }
    .top-tabs {
      display: flex;
      align-self: stretch;
      flex: 1;
      gap: 2px;
      overflow-x: auto;
    }
    .top-tabs button {
      padding: 0 13px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--muted);
      font-size: 13px;
      white-space: nowrap;
    }
    .top-tabs button:hover {
      background: var(--surface-2);
      color: var(--text);
    }
    .top-tabs button.active {
      border-bottom-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 9%, transparent);
      color: var(--accent);
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .client-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--surface-2) 52%, transparent);
    }
    .client-chip span {
      color: var(--muted);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .05em;
      text-transform: uppercase;
    }
    .client-chip i {
      width: 1px;
      height: 14px;
      background: var(--border);
    }
    .client-chip strong {
      color: var(--text);
      font-size: 12px;
      font-weight: 700;
    }
    .ai-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border: 1px solid color-mix(in srgb, var(--purple) 35%, transparent);
      border-radius: 999px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--purple) 15%, transparent));
      color: var(--purple);
      font-size: 12px;
      font-weight: 800;
    }
    .round-button {
      position: relative;
      display: grid;
      width: 31px;
      height: 31px;
      place-items: center;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface-2);
      color: var(--muted);
      font-size: 14px;
    }
    .notification-dot {
      position: absolute;
      top: 3px;
      right: 3px;
      width: 7px;
      height: 7px;
      border: 1px solid var(--surface);
      border-radius: 50%;
      background: var(--red);
    }
    .user-menu {
      position: relative;
      padding-bottom: 10px;
      margin-bottom: -10px;
    }
    .avatar {
      display: grid;
      width: 31px;
      height: 31px;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #fff;
      font-size: 11px;
      font-weight: 800;
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      z-index: 120;
      display: none;
      width: 220px;
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      box-shadow: 0 18px 40px rgba(0,0,0,.28);
    }
    .user-menu:hover .user-dropdown,
    .user-menu:focus-within .user-dropdown {
      display: block;
    }
    .account-summary {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 7px 9px 9px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    .account-summary span {
      color: var(--muted);
      font-size: 11px;
    }
    .user-dropdown a {
      display: block;
      padding: 8px 9px;
      border-radius: 7px;
      color: var(--muted);
      font-size: 12px;
      text-decoration: none;
    }
    .user-dropdown a:hover {
      background: var(--surface-2);
      color: var(--text);
    }
    .logout-link {
      color: var(--red) !important;
    }
    @media (max-width: 1100px) {
      .client-chip {
        display: none;
      }
    }
    @media (max-width: 900px) {
      .top-tabs,
      .ai-button {
        display: none;
      }
    }
  `
})
export class Header {
  readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly userService = inject(UserService);

  get userName(): string {
    return this.userService.currentUser() || 'RS';
  }

  get initials(): string {
    return this.userName
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'RS';
  }

  isWorkspace(): boolean {
    return this.router.url.split('?')[0] === '/dashboard';
  }

  isItems(): boolean {
    return this.router.url.startsWith('/items');
  }

  isChanges(): boolean {
    return this.router.url.startsWith('/changes');
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
