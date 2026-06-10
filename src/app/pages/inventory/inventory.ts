import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { InventoryService } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ItemFormModal],
  template: `
    <div class="items-page">
      <header class="topbar">
        <button class="brand" type="button" (click)="router.navigate(['/dashboard'])">NexaPLM</button>

        <div class="topbar-center">
          <div class="search-cluster">
            <input
              type="search"
              placeholder="Search Items/Changes/Users..."
              aria-label="Search Items, Changes or Users">
            <button type="button" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M20 20L16.65 16.65"></path>
              </svg>
            </button>
          </div>

          <div class="top-actions" aria-label="Quick actions">
            <button type="button" aria-label="Favorites" title="Favorites">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.8l2.53 5.13 5.66.82-4.1 4 .97 5.65L12 16.74 6.94 19.4l.97-5.65-4.1-4 5.66-.82L12 3.8z"></path>
              </svg>
            </button>
            <button class="notification-button" type="button" aria-label="Notifications" title="Notifications">
              <span class="notification-dot" aria-hidden="true"></span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18H9"></path>
                <path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"></path>
              </svg>
            </button>
            <button type="button" aria-label="Data import" title="Data import">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v10"></path>
                <path d="M8 9l4 4 4-4"></path>
                <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="user-menu">
          <button class="user-trigger" type="button">
            {{ userName }} <span aria-hidden="true">▾</span>
          </button>
          <nav class="user-dropdown" aria-label="User menu">
            <a href="#" (click)="$event.preventDefault()">My Profile</a>
            <a href="#" (click)="$event.preventDefault()">Password Change</a>
            <a href="#" (click)="logout($event)">Logout</a>
            <a href="#" (click)="$event.preventDefault()">Help</a>
            <a href="#" (click)="$event.preventDefault()">About NexaPLM</a>
          </nav>
        </div>
      </header>

      <div class="section-separator" aria-hidden="true"></div>

      <main>
        <div class="page-heading">
          <div>
            <h1>Items</h1>
            <p>Browse and open product lifecycle records.</p>
          </div>
          <button class="return-button" type="button" (click)="returnToItemTab()">
            Return to item
          </button>
        </div>

        <section class="items-card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item Number</th>
                  <th>Active Revision</th>
                  <th>Item Type</th>
                  <th>Part Type</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let item of inventoryService.inventory()"
                  tabindex="0"
                  (click)="navigateToItem(item.sku)"
                  (keydown.enter)="navigateToItem(item.sku)">
                  <td><span class="item-number">{{ item.sku }}</span></td>
                  <td>{{ item.revision }}</td>
                  <td>{{ item.part || item.type }}</td>
                  <td>{{ item.partType || '—' }}</td>
                </tr>
                <tr *ngIf="inventoryService.inventory().length === 0">
                  <td colspan="4" class="empty-row">No items found.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="status-text">{{ inventoryService.inventory().length }} items</p>
        </section>
      </main>
    </div>

    <app-item-form-modal
      *ngIf="showCreateModal"
      (saved)="showCreateModal = false"
      (close)="showCreateModal = false">
    </app-item-form-modal>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #eeeff4;
      color: #223964;
    }

    * { box-sizing: border-box; }

    .items-page {
      min-height: 100vh;
      padding: 22px 28px 36px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 18px;
    }

    .brand {
      flex: 0 0 auto;
      padding: 0;
      border: 0;
      background: transparent;
      color: #223964;
      font-size: 1.45rem;
      font-weight: 900;
      letter-spacing: .01em;
      line-height: 1;
    }

    .topbar-center {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 18px;
      min-width: 0;
    }

    .search-cluster {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 64px;
    }

    .search-cluster input,
    .search-cluster button,
    .top-actions button {
      height: 44px;
      border: 1px solid #dbe0e8;
      border-radius: 18px;
      background: rgba(255, 255, 255, .84);
      color: #223964;
      box-shadow: 0 2px 8px rgba(31, 50, 88, .04), 0 12px 20px rgba(31, 50, 88, .03);
    }

    .search-cluster input {
      width: 340px;
      padding: 0 14px;
      outline: none;
      font-size: .88rem;
    }

    .search-cluster input::placeholder { color: #8191ae; }

    .search-cluster button,
    .top-actions button {
      display: inline-flex;
      width: 48px;
      min-width: 48px;
      align-items: center;
      justify-content: center;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: #28406f;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .top-actions button:first-child svg { fill: rgba(40, 64, 111, .08); }
    .notification-button { position: relative; }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 9px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff6b6b;
      box-shadow: 0 0 0 2px #fff;
    }

    .user-menu {
      position: relative;
      padding-bottom: 18px;
      margin-bottom: -18px;
    }

    .user-trigger {
      padding: 9px 15px;
      border: 1px solid #d6dae3;
      border-radius: 999px;
      background: rgba(255, 255, 255, .82);
      color: #223964;
      font-size: .88rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(31, 50, 88, .04);
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 2px);
      right: 0;
      z-index: 20;
      display: none;
      min-width: 200px;
      padding: 10px;
      border: 1px solid #dfe2ea;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 12px 28px rgba(28, 45, 87, .12);
    }

    .user-menu:hover .user-dropdown,
    .user-menu:focus-within .user-dropdown { display: block; }

    .user-dropdown a {
      display: block;
      padding: 9px 12px;
      border-radius: 12px;
      color: #223964;
      font-size: .92rem;
      text-decoration: none;
    }

    .user-dropdown a:hover { background: #f3f5f8; }

    .section-separator {
      height: 1px;
      margin: 22px 0 26px;
      background: linear-gradient(90deg, transparent, rgba(133, 148, 176, .72), transparent);
    }

    .page-heading {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 22px;
    }

    h1 {
      margin: 0;
      color: #223964;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: .01em;
    }

    .page-heading p {
      margin: 4px 0 0;
      color: #8191ae;
      font-size: .9rem;
    }

    .return-button {
      padding: 11px 22px;
      border: 0;
      border-radius: 14px;
      background: linear-gradient(135deg, #a7d84a, #86bc25);
      color: #24420a;
      font-size: .9rem;
      font-weight: 800;
      box-shadow: 0 6px 14px rgba(134, 188, 37, .28);
    }

    .items-card {
      padding: 28px 28px 22px;
      border: 1px solid #e2e5ec;
      border-radius: 26px;
      background: rgba(250, 250, 251, .88);
      box-shadow: 0 2px 8px rgba(31, 50, 88, .04), 0 12px 20px rgba(31, 50, 88, .03);
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid #e2e5ec;
      border-radius: 18px;
      background: #fafafc;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      padding: 17px 22px;
      border-bottom: 1px solid #dfe4ed;
      background: #f4f6fa;
      color: #8191ae;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: .05em;
      text-transform: uppercase;
    }

    td {
      padding: 17px 22px;
      border-bottom: 1px solid #e6e9ef;
      color: #50627c;
      font-size: .88rem;
    }

    tbody tr {
      cursor: pointer;
      transition: background .2s ease;
    }

    tbody tr:hover,
    tbody tr:focus {
      outline: none;
      background: #f3f8e9;
    }

    tbody tr:last-child td { border-bottom: 0; }

    .item-number {
      display: inline-flex;
      padding: 6px 11px;
      border: 1px solid #dcebc3;
      border-radius: 999px;
      background: #f3f8e9;
      color: #5f8919;
      font-weight: 800;
    }

    .empty-row {
      padding: 48px 20px;
      color: #98a4ba;
      text-align: center;
    }

    .status-text {
      margin: 18px 0 0;
      color: #98a4ba;
      font-size: .85rem;
    }

    @media (max-width: 1000px) {
      .topbar { flex-wrap: wrap; }
      .topbar-center { order: 3; width: 100%; }
      .search-cluster { flex: 1; margin-left: 0; }
      .search-cluster input { width: 100%; }
    }

    @media (max-width: 700px) {
      .items-page { padding: 18px 16px 28px; }
      .topbar-center { align-items: stretch; flex-direction: column; }
      .top-actions { margin-left: 0; }
      .page-heading { align-items: stretch; flex-direction: column; }
      .return-button { width: 100%; }
      .items-card { padding: 18px; }
    }
  `
})
export class Items {
  readonly inventoryService = inject(InventoryService);
  readonly userService = inject(UserService);
  readonly router = inject(Router);

  showCreateModal = false;

  get userName(): string {
    return this.userService.currentUser() || 'User1';
  }

  navigateToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  returnToItemTab() {
    this.router.navigate(['/dashboard'], { queryParams: { tab: 'items' } });
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
