import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalSearch } from '../../components/global-search/global-search';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { InventoryService, Product } from '../../services/inventory.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, GlobalSearch, ItemFormModal, Sidebar, ThemeToggle],
  template: `
    <app-sidebar></app-sidebar>
    <div class="edit-page" [class.dark-theme]="themeService.theme() === 'dark'">
      <header class="topbar">
        <button class="brand" type="button" (click)="router.navigate(['/dashboard'])">NexaPLM</button>

        <div class="topbar-center">
          <div class="search-cluster">
            <app-global-search></app-global-search>
          </div>

          <div class="top-actions">
            <app-theme-toggle></app-theme-toggle>
            <button type="button" aria-label="Favorites">
              <svg viewBox="0 0 24 24"><path d="M12 3.8l2.53 5.13 5.66.82-4.1 4 .97 5.65L12 16.74 6.94 19.4l.97-5.65-4.1-4 5.66-.82L12 3.8z"></path></svg>
            </button>
            <button class="notification-button" type="button" aria-label="Notifications">
              <span class="notification-dot"></span>
              <svg viewBox="0 0 24 24"><path d="M15 18H9"></path><path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"></path></svg>
            </button>
            <button type="button" aria-label="Data import">
              <svg viewBox="0 0 24 24"><path d="M12 3v10"></path><path d="M8 9l4 4 4-4"></path><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path></svg>
            </button>
          </div>
        </div>

        <div class="user-menu">
          <button class="user-trigger" type="button">{{ userName }} <span>▾</span></button>
          <nav class="user-dropdown">
            <a href="#" (click)="$event.preventDefault()">My Profile</a>
            <a href="#" (click)="$event.preventDefault()">Password Change</a>
            <a href="#" (click)="logout($event)">Logout</a>
            <a href="#" (click)="$event.preventDefault()">Help</a>
          </nav>
        </div>
      </header>

      <div class="section-separator"></div>

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
    .edit-page { min-height: 100vh; margin-left: 280px; padding: 22px 28px 36px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    .edit-page.dark-theme { background: #0d1117; color: #e6edf3; }
    .edit-page.dark-theme .brand,
    .edit-page.dark-theme h1 { color: #e6edf3; }
    .edit-page.dark-theme .edit-heading p { color: #8b949e; }
    .edit-page.dark-theme .user-trigger,
    .edit-page.dark-theme .user-dropdown {
      border-color: #30363d;
      background: #161b22;
      color: #e6edf3;
    }
    .edit-page.dark-theme .user-dropdown a { color: #c9d1d9; }
    .edit-page.dark-theme .user-dropdown a:hover { background: #21262d; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
    .brand { padding: 0; border: 0; background: transparent; color: #223964; font-size: 1.45rem; font-weight: 900; }
    .topbar-center { display: flex; flex: 1; align-items: center; gap: 18px; min-width: 0; }
    .search-cluster { display: flex; flex: 0 0 520px; width: 520px; align-items: center; gap: 10px; margin-left: 64px; }
    .search-cluster input, .search-cluster button, .top-actions button { height: 44px; border: 1px solid #dbe0e8; border-radius: 18px; background: rgba(255,255,255,.84); box-shadow: 0 2px 8px rgba(31,50,88,.04); }
    .search-cluster input { width: 340px; padding: 0 14px; outline: none; }
    .search-cluster button, .top-actions button { display: inline-flex; width: 48px; align-items: center; justify-content: center; }
    .top-actions { display: flex; gap: 10px; margin-left: auto; }
    svg { width: 18px; height: 18px; fill: none; stroke: #28406f; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .notification-button { position: relative; }
    .notification-dot { position: absolute; top: 8px; right: 9px; width: 8px; height: 8px; border-radius: 50%; background: #ff6b6b; }
    .user-menu { position: relative; padding-bottom: 18px; margin-bottom: -18px; }
    .user-trigger { padding: 9px 15px; border: 1px solid #d6dae3; border-radius: 999px; background: rgba(255,255,255,.82); color: #223964; font-weight: 700; }
    .user-dropdown { position: absolute; top: 100%; right: 0; z-index: 20; display: none; min-width: 190px; padding: 10px; border: 1px solid #dfe2ea; border-radius: 18px; background: #fff; box-shadow: 0 12px 28px rgba(28,45,87,.12); }
    .user-menu:hover .user-dropdown, .user-menu:focus-within .user-dropdown { display: block; }
    .user-dropdown a { display: block; padding: 9px 12px; border-radius: 12px; color: #223964; text-decoration: none; }
    .user-dropdown a:hover { background: #f3f5f8; }
    .section-separator { height: 1px; margin: 22px 0 24px; background: linear-gradient(90deg,transparent,rgba(133,148,176,.72),transparent); }
    main { width: min(980px,100%); margin: 0 auto; }
    .back-button { margin-bottom: 18px; padding: 9px 16px; border: 1px solid #dcebc3; border-radius: 999px; background: #f3f8e9; color: #5f8919; font-weight: 700; }
    .edit-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .edit-icon { display: grid; width: 45px; height: 45px; place-items: center; border-radius: 12px; background: #f3f8e9; color: #6a951c; }
    .edit-icon svg { width: 22px; height: 22px; stroke: currentColor; }
    h1 { margin: 0; font-size: 1.8rem; color: #25324b; }
    .edit-heading p { margin: 4px 0 0; color: #8f96ab; font-size: .86rem; }
    @media (max-width: 900px) {
      .topbar { flex-wrap: wrap; }
      .topbar-center { order: 3; width: 100%; }
      .search-cluster { margin-left: 0; }
      .search-cluster input { width: 100%; }
    }
    @media (max-width: 700px) {
      .edit-page { margin-left: 58px; }
      .edit-page { padding: 18px 16px 28px; }
      .topbar-center { align-items: stretch; flex-direction: column; }
      .search-cluster { flex: 1 1 auto; width: 100%; }
      .top-actions { margin-left: 0; }
    }
  `
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

  goToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
