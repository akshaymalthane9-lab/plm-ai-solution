import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RecentItemsService } from '../../services/recent-items.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar" [class.dark-theme]="themeService.theme() === 'dark'">
      <button
        class="sidebar-item"
        [class.active]="isDashboardActive()"
        type="button"
        (click)="goToDashboard()"
      >
        <span class="nav-icon">&#8962;</span>
        Dashboard
      </button>

      <button class="sidebar-item" type="button" (click)="goToDashboard()">
        <span class="nav-icon">&#9671;</span>
        NPI Tracker
      </button>

      <div class="recently-accessed">
        <div class="recently-accessed-title">Recently Accessed</div>

        <button
          *ngFor="let item of recentItemsService.recentItems()"
          class="recent-item"
          type="button"
          (click)="openRecentItem(item.sku)"
        >
          <span class="recent-item-copy">
            <strong>{{ item.sku }} - {{ item.name }}</strong>
          </span>
        </button>

        <div *ngIf="recentItemsService.recentItems().length === 0" class="recent-items-empty">
          No recently accessed items
        </div>
      </div>
    </aside>
  `,
  styles: `
    :host {
      display: block;
      width: 280px;
      min-width: 280px;
    }
    .sidebar {
      --sidebar-surface: #ffffff;
      --sidebar-surface-2: #eef2f7;
      --sidebar-border: #d8dee7;
      --sidebar-text: #172033;
      --sidebar-muted: #59677c;
      --sidebar-subtle: #7b8798;
      --sidebar-accent: #1f6feb;
      position: fixed;
      top: 52px;
      bottom: 0;
      left: 0;
      z-index: 40;
      display: flex;
      width: 280px;
      flex-direction: column;
      overflow-y: auto;
      padding: 8px 0 18px;
      border-right: 1px solid var(--sidebar-border);
      background: var(--sidebar-surface);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }
    .sidebar.dark-theme {
      --sidebar-surface: #161b22;
      --sidebar-surface-2: #21262d;
      --sidebar-border: #30363d;
      --sidebar-text: #e6edf3;
      --sidebar-muted: #8b949e;
      --sidebar-subtle: #6e7681;
      --sidebar-accent: #2f81f7;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 1px 6px;
      padding: 7px 10px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--sidebar-muted);
      font-size: 13px;
      text-align: left;
    }
    .sidebar-item:hover {
      background: var(--sidebar-surface-2);
      color: var(--sidebar-text);
    }
    .sidebar-item.active {
      background: color-mix(in srgb, var(--sidebar-accent) 13%, transparent);
      color: var(--sidebar-accent);
      font-weight: 650;
    }
    .nav-icon {
      width: 17px;
      color: currentColor;
      text-align: center;
    }
    .recently-accessed {
      display: flex;
      min-height: 190px;
      flex-direction: column;
      gap: 8px;
      margin: 20px 10px 12px;
      padding: 14px 10px;
      border: 1px solid var(--sidebar-border);
      border-radius: 12px;
      background: color-mix(in srgb, var(--sidebar-surface-2) 42%, transparent);
    }
    .recently-accessed-title {
      padding: 0 4px 6px;
      color: var(--sidebar-text);
      font-size: 12px;
      font-weight: 750;
    }
    .recent-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 9px 8px;
      border: 1px solid transparent;
      border-radius: 9px;
      background: transparent;
      color: var(--sidebar-text);
      text-align: left;
    }
    .recent-item:hover {
      border-color: var(--sidebar-border);
      background: var(--sidebar-surface-2);
    }
    .recent-item-copy { min-width: 0; }
    .recent-item-copy strong {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .recent-item-copy strong {
      color: var(--sidebar-text);
      font-size: 14px;
    }
    .recent-items-empty {
      display: grid;
      min-height: 116px;
      place-items: center;
      padding: 14px;
      border: 1px dashed var(--sidebar-border);
      border-radius: 10px;
      color: var(--sidebar-subtle);
      font-size: 11px;
      text-align: center;
    }
    @media (max-width: 780px) {
      :host {
        width: 58px;
        min-width: 58px;
      }
      .sidebar {
        width: 58px;
      }
      .sidebar-item {
        justify-content: center;
        font-size: 0;
      }
      .nav-icon {
        font-size: 16px;
      }
      .recently-accessed {
        display: none;
      }
    }
  `
})
export class Sidebar {
  readonly recentItemsService = inject(RecentItemsService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  isDashboardActive(): boolean {
    return this.router.url.split('?')[0] === '/dashboard';
  }

  openRecentItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

}
