import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
          <button class="active" type="button">Workspace</button>
          <button type="button">Items</button>
          <button type="button">Changes</button>
          <button type="button">Reports &amp; Analytics</button>
        </nav>

        <div class="dashboard-layout">
          <aside class="recent-panel">
            <h2>Recently Accessed</h2>
            <div class="empty-recent">No recently accessed items</div>
          </aside>

          <section class="workspace-panel">
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
        </div>
      </main>
    </div>
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
    .workspace-panel {
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

      h1 {
        font-size: 1.55rem;
      }
    }
  `
})
export class Dashboard {
  readonly userService = inject(UserService);
  readonly router = inject(Router);

  get userName(): string {
    return this.userService.currentUser() || 'User1';
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
