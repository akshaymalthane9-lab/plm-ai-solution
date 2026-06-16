import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

type SidebarLink = {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeTone?: 'red' | 'yellow' | 'blue';
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar" [class.dark-theme]="themeService.theme() === 'dark'">
      <ng-container *ngFor="let section of sections">
        <div class="sidebar-section">{{ section.title }}</div>
        <button
          *ngFor="let link of section.links"
          class="sidebar-item"
          [class.active]="isActive(link)"
          type="button"
          (click)="openLink(link)"
        >
          <span class="nav-icon">{{ link.icon }}</span>
          <span class="nav-label">{{ link.label }}</span>
          <span *ngIf="link.badge" class="sidebar-badge" [class.yellow]="link.badgeTone === 'yellow'" [class.blue]="link.badgeTone === 'blue'">
            {{ link.badge }}
          </span>
        </button>
      </ng-container>
    </aside>
  `,
  styles: `
    :host {
      display: block;
      width: 210px;
      min-width: 210px;
    }
    .sidebar {
      --sidebar-surface: #ffffff;
      --sidebar-surface-2: #eef2f7;
      --sidebar-border: #d8dee7;
      --sidebar-text: #172033;
      --sidebar-muted: #59677c;
      --sidebar-subtle: #7b8798;
      --sidebar-accent: #1f6feb;
      --sidebar-red: #cf222e;
      --sidebar-yellow: #9a6700;
      position: fixed;
      top: 52px;
      bottom: 0;
      left: 0;
      z-index: 40;
      display: flex;
      width: 210px;
      flex-direction: column;
      overflow-y: auto;
      padding: 12px 0 18px;
      border-right: 1px solid var(--sidebar-border);
      background: var(--sidebar-surface);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .sidebar.dark-theme {
      --sidebar-surface: #161b22;
      --sidebar-surface-2: #21262d;
      --sidebar-border: #30363d;
      --sidebar-text: #e6edf3;
      --sidebar-muted: #8b949e;
      --sidebar-subtle: #6e7681;
      --sidebar-accent: #2f81f7;
      --sidebar-red: #f85149;
      --sidebar-yellow: #d29922;
    }
    .sidebar-section {
      margin-top: 8px;
      padding: 8px 16px 2px;
      color: var(--sidebar-subtle);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 6px;
      padding: 7px 12px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--sidebar-muted);
      cursor: pointer;
      font-size: 13px;
      text-align: left;
      transition: background .12s, color .12s;
    }
    .sidebar-item:hover {
      background: var(--sidebar-surface-2);
      color: var(--sidebar-text);
    }
    .sidebar-item.active {
      background: color-mix(in srgb, var(--sidebar-accent) 12%, transparent);
      color: var(--sidebar-accent);
      font-weight: 650;
    }
    .nav-icon {
      width: 17px;
      color: currentColor;
      text-align: center;
    }
    .nav-label {
      min-width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sidebar-badge {
      margin-left: auto;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--sidebar-red);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
    }
    .sidebar-badge.yellow {
      background: var(--sidebar-yellow);
    }
    .sidebar-badge.blue {
      background: var(--sidebar-accent);
    }
    @media (max-width: 780px) {
      :host {
        width: 58px;
        min-width: 58px;
      }
      .sidebar {
        width: 58px;
      }
      .sidebar-section,
      .nav-label,
      .sidebar-badge {
        display: none;
      }
      .sidebar-item {
        justify-content: center;
      }
      .nav-icon {
        font-size: 16px;
      }
    }
  `
})
export class Sidebar {
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly sections: SidebarSection[] = [
    {
      title: 'NPI Process',
      links: [
        { label: 'Dashboard', icon: '🏠', route: '/dashboard' },
        { label: 'NPI Tracker', icon: '🗺', route: '/dashboard' },
        { label: 'Pending Actions', icon: '⏳', route: '/dashboard', badge: '5' },
      ],
    },
    {
      title: 'Items',
      links: [
        { label: 'All Items', icon: '📦', route: '/items' },
        { label: 'Create Item', icon: '➕', route: '/items' },
        { label: 'Formulations', icon: '🧪', route: '/dashboard' },
        { label: 'Released Items', icon: '✅', route: '/dashboard' },
      ],
    },
    {
      title: 'Changes',
      links: [
        { label: 'Change Orders', icon: '📝', route: '/dashboard', badge: '2', badgeTone: 'yellow' },
        { label: 'ECO-001 Detail', icon: '🔬', route: '/dashboard' },
      ],
    },
    {
      title: 'Quality',
      links: [
        { label: 'CAPA', icon: '⚠️', route: '/dashboard', badge: '3', badgeTone: 'yellow' },
        { label: 'Deviations', icon: '📌', route: '/dashboard' },
      ],
    },
    {
      title: 'Regulatory',
      links: [
        { label: 'Submissions', icon: '🏛', route: '/dashboard' },
        { label: 'Clinical Phases', icon: '🔬', route: '/dashboard' },
      ],
    },
  ];

  openLink(link: SidebarLink) {
    this.router.navigate([link.route || '/dashboard']);
  }

  isActive(link: SidebarLink): boolean {
    const path = this.router.url.split('?')[0];
    if (path === '/dashboard') {
      return link.label === 'Dashboard';
    }
    if (path.startsWith('/items')) {
      return link.label === 'All Items';
    }
    return path === (link.route || '/dashboard');
  }
}
