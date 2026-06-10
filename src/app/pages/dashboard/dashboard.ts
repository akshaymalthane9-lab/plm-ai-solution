import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemFormModal],
  template: `
    <div class="dashboard-page">
      <header class="topbar">
        <div class="brand" aria-label="NexaPLM">NexaPLM</div>

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
        <h1>Welcome, {{ userName }}</h1>

        <nav class="dashboard-toolbar" aria-label="Dashboard navigation">
          <button
            type="button"
            [class.active]="activeView === 'workspace'"
            (click)="activeView = 'workspace'">
            Workspace
          </button>
          <button
            type="button"
            [class.active]="activeView === 'items'"
            (click)="activeView = 'items'">
            Items
          </button>
          <button
            type="button"
            [class.active]="activeView === 'changes'"
            (click)="activeView = 'changes'">
            Changes
          </button>
          <button
            type="button"
            [class.active]="activeView === 'reports'"
            (click)="activeView = 'reports'">
            Reports &amp; Analytics
          </button>
        </nav>

        <div class="dashboard-layout">
          <aside class="recent-panel">
            <h2>Recently Accessed</h2>
            <div class="empty-recent">No recently accessed items</div>
          </aside>

          <section class="workspace-panel" *ngIf="activeView === 'workspace'">
            <h2>Workspace Overview</h2>

            <div class="summary-row">
              <div>Pending Approvals</div>
              <div>Recent Activity</div>
            </div>

            <div class="workspace-columns">
              <article class="workspace-card">
                <div class="workspace-item">
                  <strong>ECO-0145 Approval</strong>
                  <span>Due today · Engineering Change Order</span>
                  <small class="alert">High</small>
                </div>
                <div class="workspace-item">
                  <strong>Drawing Release Review</strong>
                  <span>Pending sign-off · CAD document package</span>
                  <small>Review</small>
                </div>
                <div class="workspace-item">
                  <strong>BOM Deviation Request</strong>
                  <span>Awaiting approval · Manufacturing update</span>
                  <small>Open</small>
                </div>
              </article>

              <article class="workspace-card">
                <div class="workspace-item">
                  <strong>Part-100238 revised</strong>
                  <span>Updated 20 mins ago · Rev B published</span>
                  <small>Update</small>
                </div>
                <div class="workspace-item">
                  <strong>Workflow completed</strong>
                  <span>Packaging review closed · 1 hour ago</span>
                  <small>Done</small>
                </div>
                <div class="workspace-item">
                  <strong>Document uploaded</strong>
                  <span>Test report added · 2 hours ago</span>
                  <small>New</small>
                </div>
              </article>
            </div>

            <p class="status-text">Current view: WORKSPACE</p>
          </section>

          <section class="items-panel" *ngIf="activeView === 'items'">
            <div class="items-grid">
              <article class="item-action-card">
                <div class="item-action-content">
                  <strong>Create Item</strong>
                  <p>Create a new item with attributes, lifecycle, BOM, and relationships.</p>
                  <button
                    type="button"
                    [disabled]="userService.isReadOnly()"
                    (click)="showCreateModal = true">
                    Create
                  </button>
                </div>
              </article>

              <article class="item-action-card">
                <div class="item-action-content">
                  <strong>Show Items Created By Me</strong>
                  <p>View and manage items created by you across the system.</p>
                  <button type="button" (click)="router.navigate(['/items'])">Open</button>
                </div>
              </article>

              <article class="item-action-card">
                <div class="item-action-content">
                  <strong>Browse Released Items</strong>
                  <p>Quickly browse released items available for reuse and reference.</p>
                  <button type="button" (click)="router.navigate(['/items'])">Browse</button>
                </div>
              </article>
            </div>

            <p class="status-text">Current view: ITEMS</p>
          </section>

          <section class="empty-view-panel" *ngIf="activeView === 'changes'">
            <p class="status-text">Current view: CHANGES</p>
          </section>

          <section class="empty-view-panel" *ngIf="activeView === 'reports'">
            <p class="status-text">Current view: REPORTS &amp; ANALYTICS</p>
          </section>
        </div>
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

    * {
      box-sizing: border-box;
    }

    .dashboard-page {
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
      color: #223964;
      font-size: 1.45rem;
      font-weight: 900;
      letter-spacing: .01em;
      line-height: 1;
      white-space: nowrap;
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

    .search-cluster input::placeholder {
      color: #8191ae;
    }

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

    .top-actions button:first-child svg {
      fill: rgba(40, 64, 111, .08);
    }

    .notification-button {
      position: relative;
    }

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
    .user-menu:focus-within .user-dropdown {
      display: block;
    }

    .user-dropdown a {
      display: block;
      padding: 9px 12px;
      border-radius: 12px;
      color: #223964;
      font-size: .92rem;
      text-decoration: none;
    }

    .user-dropdown a:hover {
      background: #f3f5f8;
    }

    .section-separator {
      height: 1px;
      margin: 22px 0 26px;
      background: linear-gradient(90deg, transparent, rgba(133, 148, 176, .72), transparent);
    }

    h1 {
      margin: 0 0 12px;
      color: #223964;
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: .01em;
    }

    .dashboard-toolbar {
      display: flex;
      gap: 12px;
      width: calc(100% - 308px);
      margin: 0 0 22px 308px;
      padding: 8px;
      overflow-x: auto;
      border: 1px solid #e2e6ef;
      border-radius: 20px;
      background: rgba(255, 255, 255, .68);
      box-shadow: 0 8px 20px rgba(31, 50, 88, .06);
    }

    .dashboard-toolbar button {
      flex: 1 1 0;
      padding: 12px 18px;
      border: 0;
      border-radius: 14px;
      background: transparent;
      color: #8191ae;
      font-size: .95rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .dashboard-toolbar button.active {
      background: linear-gradient(135deg, #a7d84a, #86bc25);
      color: #24420a;
      box-shadow: 0 6px 14px rgba(134, 188, 37, .28);
    }

    .dashboard-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 28px;
      align-items: start;
    }

    .recent-panel,
    .workspace-panel,
    .items-panel,
    .empty-view-panel {
      border: 1px solid #e2e5ec;
      border-radius: 26px;
      background: rgba(250, 250, 251, .88);
      box-shadow: 0 2px 8px rgba(31, 50, 88, .04), 0 12px 20px rgba(31, 50, 88, .03);
    }

    .recent-panel {
      min-height: 560px;
      padding: 26px 22px;
    }

    .recent-panel h2,
    .workspace-panel h2 {
      margin: 0 0 20px;
      color: #223964;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: .01em;
    }

    .empty-recent {
      display: flex;
      min-height: 120px;
      align-items: center;
      justify-content: center;
      border: 1px dashed #e6e9ef;
      border-radius: 18px;
      background: #f4f5f8;
      color: #98a4ba;
      font-size: .92rem;
      text-align: center;
    }

    .workspace-panel {
      padding: 28px 28px 24px;
    }

    .summary-row,
    .workspace-columns {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
    }

    .summary-row {
      margin-bottom: 18px;
    }

    .summary-row div {
      display: flex;
      min-height: 58px;
      align-items: center;
      justify-content: center;
      padding: 0 18px;
      border: 1px solid #e6e9ef;
      border-radius: 18px;
      background: #f4f5f8;
      color: #223964;
      font-size: .98rem;
      font-weight: 700;
      text-align: center;
    }

    .workspace-columns {
      gap: 24px;
    }

    .workspace-card {
      display: grid;
      gap: 12px;
      min-height: 320px;
      align-content: center;
      padding: 22px;
      border: 1px solid #e6e9ef;
      border-radius: 30px;
      background: #fafafc;
    }

    .workspace-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 16px;
      border: 1px solid #e6e9ef;
      border-radius: 16px;
      background: #f4f6fa;
      text-align: center;
    }

    .workspace-item strong {
      color: #223964;
      font-size: .94rem;
    }

    .workspace-item span {
      color: #8191ae;
      font-size: .82rem;
    }

    .workspace-item small {
      min-width: 74px;
      padding: 6px 10px;
      border: 1px solid #dcebc3;
      border-radius: 999px;
      background: #f3f8e9;
      color: #5f8919;
      font-size: .8rem;
      font-weight: 700;
    }

    .workspace-item small.alert {
      border-color: #f8ddbe;
      background: #fff3e8;
      color: #9a5b11;
    }

    .status-text {
      margin: 18px 0 0;
      color: #98a4ba;
      font-size: .9rem;
    }

    .items-panel {
      padding: 52px 28px 24px;
    }

    .empty-view-panel {
      display: flex;
      min-height: 560px;
      align-items: flex-end;
      padding: 28px 28px 24px;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }

    .item-action-card {
      display: flex;
      min-height: 250px;
      align-items: center;
      justify-content: center;
      padding: 22px;
      border: 1px solid #e2e5ec;
      border-radius: 30px;
      background: #fafafc;
    }

    .item-action-content {
      display: flex;
      width: 100%;
      min-height: 132px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 18px 20px;
      border: 1px solid #e2e5ec;
      border-radius: 16px;
      background: #f4f6fa;
      text-align: center;
    }

    .item-action-content strong {
      color: #102852;
      font-size: .94rem;
    }

    .item-action-content p {
      margin: 3px 0 17px;
      color: #8191ae;
      font-size: .82rem;
      line-height: 1.4;
    }

    .item-action-content button {
      min-width: 92px;
      padding: 8px 22px;
      border: 1px solid #d7e0f2;
      border-radius: 999px;
      background: #eef3ff;
      color: #244d99;
      font-size: .9rem;
      font-weight: 700;
    }

    .item-action-content button:disabled {
      cursor: not-allowed;
      opacity: .5;
    }

    @media (max-width: 1100px) {
      .topbar {
        flex-wrap: wrap;
      }

      .topbar-center {
        order: 3;
        width: 100%;
      }

      .search-cluster {
        flex: 1;
        margin-left: 0;
      }

      .search-cluster input {
        width: 100%;
      }

      .dashboard-toolbar {
        width: 100%;
        margin-left: 0;
      }

      .dashboard-layout {
        grid-template-columns: 1fr;
      }

      .recent-panel {
        min-height: auto;
      }

      .items-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .dashboard-page {
        padding: 18px 16px 28px;
      }

      .topbar-center {
        align-items: stretch;
        flex-direction: column;
      }

      .top-actions {
        margin-left: 0;
      }

      .dashboard-toolbar button {
        flex: 0 0 auto;
        min-width: 140px;
      }

      .summary-row,
      .workspace-columns {
        grid-template-columns: 1fr;
      }

      .items-panel {
        padding: 28px 18px 20px;
      }

      h1 {
        font-size: 1.55rem;
      }
    }
  `
})
export class Dashboard {
  readonly userService = inject(UserService);
  readonly router = inject(Router);
  activeView: 'workspace' | 'items' | 'changes' | 'reports' = 'workspace';
  showCreateModal = false;

  get userName(): string {
    return this.userService.currentUser() || 'User1';
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
