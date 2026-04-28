import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header flex items-center justify-between">
      <div class="search-bar flex items-center gap-2">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search tasks, items, or people..." class="search-input" />
      </div>

      <div class="actions flex items-center gap-6">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">⚙️</button>
        <div class="user-profile flex items-center gap-2" (click)="logout()" title="Click to Sign Out">
          <div class="avatar">{{ getInitials() }}</div>
          <div class="user-info flex-col">
            <span class="user-name">{{ userService.currentUser() }}</span>
            <span class="user-role">{{ userService.currentRole() }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: `
    .header {
      height: 64px; padding: 0 2rem; position: sticky; top: 0; z-index: 10;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
    }
    .search-bar {
      background-color: var(--bg-app); border: 1px solid transparent;
      padding: 0.4rem 1rem; border-radius: var(--border-radius-sm); width: 350px;
      transition: all var(--transition-fast);
    }
    .search-bar:focus-within {
      background-color: var(--bg-surface);
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 1px var(--accent-primary-subtle);
    }
    .search-icon { color: var(--text-muted); font-size: 0.875rem; }
    .search-input {
      background: transparent; border: none; outline: none; color: var(--text-primary);
      width: 100%; font-family: var(--font-body); padding: 0; font-size: 0.875rem;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .icon-btn {
      background: transparent; border: none; font-size: 1.1rem; color: var(--text-secondary);
      transition: color var(--transition-fast); padding: 0.5rem; border-radius: 50%;
    }
    .icon-btn:hover { color: var(--text-primary); background: var(--bg-app); }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%; background: var(--bg-app);
      border: 1px solid var(--border-color); color: var(--text-primary);
      display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem;
    }
    .user-profile { cursor: pointer; padding: 0.25rem 0.5rem; border-radius: var(--border-radius-sm); transition: background var(--transition-fast); }
    .user-profile:hover { background: var(--bg-surface-hover); }
    .user-info { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 0.7rem; color: var(--text-muted); }
  `
})
export class Header {
  userService = inject(UserService);
  router = inject(Router);

  getInitials() {
    const name = this.userService.currentUser() || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
