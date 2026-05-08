import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar flex-col">
      <div class="logo flex items-center gap-2">
        <img src="favicon.png" alt="Deloitte" style="width: 38px; height: 38px; object-fit: contain;">
        <h2>Deloitte AI<br><strong>PLM Platform</strong></h2>
      </div>

      <nav class="nav-links flex-col">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item flex items-center gap-4">
          <span class="icon">📊</span> <span class="label">Overview</span>
        </a>
        <div class="nav-section">SCM (Supply Chain)</div>
        <a routerLink="/inventory" routerLinkActive="active" class="nav-item flex items-center gap-4">
          <span class="icon">📦</span> <span class="label">Inventory</span>
        </a>

        <!-- <div class="nav-section">ERP (Finance)</div>
        <div class="nav-item disabled flex items-center gap-4">
          <span class="icon">📄</span> <span class="label">Invoices</span>
        </div>

        <div class="nav-section">HCM (HR)</div>
        <div class="nav-item disabled flex items-center gap-4">
          <span class="icon">👥</span> <span class="label">Directory</span>
        </div> -->
      </nav>

      <div class="sidebar-footer">
        <div class="version-info">
          Deloitte Release 1.0
        </div>
      </div>
    </aside>
  `,
  styles: `
    .sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      padding: 1.5rem;
      position: fixed;
      top: 0;
      left: 0;
    }
    .logo { margin-bottom: 2.5rem; }
    .logo h2 { font-size: 1rem; line-height: 1.2; font-weight: 400; color: var(--text-primary); margin:0;}
    .logo-icon {
      width: 36px; height: 36px;
      background: var(--accent-primary);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.25rem; font-family: var(--font-heading);
    }
    .nav-links { gap: 0.25rem; flex: 1; overflow-y: auto; }
    .nav-section {
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
      color: var(--text-muted); margin-top: 1.5rem; margin-bottom: 0.5rem; padding-left: 0.5rem;
    }
    .nav-item {
      padding: 0.6rem 0.75rem; border-radius: var(--border-radius-sm);
      color: var(--text-secondary); transition: background var(--transition-fast);
      font-size: 0.875rem; font-weight: 500;
      border-left: 3px solid transparent;
    }
    .nav-item:hover:not(.disabled) {
      background-color: var(--bg-surface-hover); color: var(--text-primary);
    }
    .nav-item.active {
      background-color: var(--accent-primary-subtle); color: var(--accent-primary);
      border-left-color: var(--accent-primary);
    }
    .nav-item.disabled { opacity: 0.5; cursor: not-allowed; }
    .sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .version-info {
      font-size: 0.75rem; color: var(--text-muted); text-align: center;
    }
  `
})
export class Sidebar {}
