import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { InventoryService, Product } from '../../services/inventory.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, ItemFormModal, Sidebar, ThemeToggle],
  template: `
    <app-sidebar class="edit-local-sidebar"></app-sidebar>
    <div class="edit-page" [class.light-theme]="themeService.theme() === 'light'">
      <main *ngIf="item">
        <button class="back-button" type="button" (click)="goToItem(item.sku)">← Back to Item</button>

        <section class="edit-heading">
          <div class="edit-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9z"></path>
              <path d="M4.5 7.8L12 12l7.5-4.2"></path>
              <path d="M12 12v9"></path>
            </svg>
          </div>
          <div>
            <h1>Edit {{ item.sku }}</h1>
            <p>Update item attributes and save your changes.</p>
          </div>
        </section>

        <app-item-form-modal
          [editItem]="item"
          [pageMode]="true"
          [theme]="themeService.theme()"
          (saved)="goToItem($event)"
          (close)="goToItem(item.sku)">
        </app-item-form-modal>
      </main>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #eeeff4; color: #25324b; }
    .edit-local-sidebar,
    .edit-local-header {
      display: none !important;
    }
    .edit-page {
      --bg: #0d1117;
      --surface: #161b22;
      --surface-2: #21262d;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #2f81f7;
      --purple: #bc8cff;
      --red: #f85149;
      min-height: 100vh;
      margin-left: 0;
      padding: 22px 28px 36px;
      background: var(--bg);
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .edit-page.light-theme {
      --bg: #f5f7fa;
      --surface: #ffffff;
      --surface-2: #eef2f7;
      --border: #d8dee7;
      --text: #172033;
      --muted: #59677c;
      --accent: #1f6feb;
      --purple: #8250df;
      --red: #cf222e;
    }
    main {
      width: min(1180px, 100%);
      margin: 0;
    }
    .back-button { margin-bottom: 18px; padding: 9px 16px; border: 1px solid #dcebc3; border-radius: 999px; background: #f3f8e9; color: #5f8919; font-weight: 700; }
    .edit-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .edit-icon { display: grid; width: 45px; height: 45px; place-items: center; border-radius: 12px; background: #f3f8e9; color: #6a951c; }
    .edit-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    h1 { margin: 0; color: var(--text); font-size: 1.8rem; }
    .edit-heading p { margin: 4px 0 0; color: var(--muted); font-size: .86rem; }
    @media (max-width: 900px) {
      .top-tabs { display: none; }
      .ai-button { display: none; }
    }
    @media (max-width: 700px) {
      .edit-page { margin-left: 0; padding: 18px 16px 28px; }
      .topnav { gap: 12px; margin: 0 -16px 20px; }
    }
  `,
})
export class ItemEdit implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly inventoryService = inject(InventoryService);
  readonly themeService = inject(ThemeService);
  readonly userService = inject(UserService);

  item: Product | null = null;

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
    this.item = sku ? this.inventoryService.getData().find(product => product.sku === sku) || null : null;
    if (!this.item) {
      this.router.navigate(['/items']);
    }
  }

  get userName(): string {
    return this.userService.currentUser() || 'User1';
  }

  get initials(): string {
    return this.userName
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  goToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
