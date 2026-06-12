import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { InventoryService, Product } from '../../services/inventory.service';
import { RecentItemsService } from '../../services/recent-items.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

type DashboardView = 'workspace' | 'items' | 'changes' | 'regulatory' | 'reports';

type DashboardChange = {
  number: string;
  type: 'ECO' | 'Deviation';
  description: string;
  reason: string;
  workflowState: 'Review' | 'Draft' | 'Completed' | 'Approve';
  engineer: string;
  created: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemFormModal, ThemeToggle],
  template: `
    <div class="plm-shell" [class.light-theme]="themeService.theme() === 'light'">
      <header class="topnav">
        <button
          class="brand"
          type="button"
          (click)="selectView('workspace')"
          aria-label="NexaPLM home"
        >
          <span class="brand-mark">N</span>
          <span>NexaPLM</span>
        </button>

        <nav class="top-tabs" aria-label="Primary navigation">
          <button [class.active]="activeView === 'workspace'" (click)="selectView('workspace')">
            Workspace
          </button>
          <button [class.active]="activeView === 'items'" (click)="selectView('items')">
            Items
          </button>
          <button [class.active]="activeView === 'changes'" (click)="selectView('changes')">
            Changes
          </button>
          <button [class.active]="activeView === 'regulatory'" (click)="selectView('regulatory')">
            Regulatory
          </button>
          <button [class.active]="activeView === 'reports'" (click)="selectView('reports')">
            Reports
          </button>
        </nav>

        <div class="top-actions">
          <button class="ai-button" type="button" (click)="aiOpen = !aiOpen">
            <span aria-hidden="true">✦</span> AI Assistant
          </button>
          <app-theme-toggle></app-theme-toggle>
          <button
            class="round-button notification-button"
            type="button"
            aria-label="Notifications"
            title="Notifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2M10 21h4"></path>
            </svg>
            <span class="notification-dot"></span>
          </button>

          <div class="user-menu">
            <button class="avatar" type="button" aria-label="Open account menu">
              {{ initials }}
            </button>
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

      <div class="app-body">
        <aside class="sidebar">
          <div class="sidebar-section">NPI Process</div>
          <button
            class="sidebar-item"
            [class.active]="activeView === 'workspace'"
            (click)="selectView('workspace')"
          >
            <span class="nav-icon">⌂</span> Dashboard
          </button>
          <button class="sidebar-item" (click)="selectView('workspace')">
            <span class="nav-icon">◇</span> NPI Tracker
          </button>
          <button class="sidebar-item" (click)="selectView('workspace')">
            <span class="nav-icon">◷</span> Pending Actions
            <span class="sidebar-badge danger">5</span>
          </button>

          <div class="sidebar-section">Items</div>
          <button
            class="sidebar-item"
            [class.active]="activeView === 'items'"
            (click)="selectView('items')"
          >
            <span class="nav-icon">□</span> All Items
          </button>
          <button
            class="sidebar-item"
            (click)="showCreateModal = true"
            [disabled]="userService.isReadOnly()"
          >
            <span class="nav-icon">＋</span> Create Item
          </button>
          <button class="sidebar-item" (click)="selectView('items')">
            <span class="nav-icon">⌬</span> Formulations
          </button>
          <button class="sidebar-item" (click)="selectView('items')">
            <span class="nav-icon">✓</span> Released Items
          </button>

          <div class="sidebar-section">Changes</div>
          <button
            class="sidebar-item"
            [class.active]="activeView === 'changes'"
            (click)="selectView('changes')"
          >
            <span class="nav-icon">▤</span> Change Orders
            <span class="sidebar-badge warning">2</span>
          </button>
          <button class="sidebar-item" (click)="openMyChanges()">
            <span class="nav-icon">⌕</span> Change Review
          </button>

          <div class="sidebar-section">Quality</div>
          <button class="sidebar-item" (click)="selectView('regulatory')">
            <span class="nav-icon">△</span> CAPA <span class="sidebar-badge warning">3</span>
          </button>
          <button class="sidebar-item" (click)="selectView('regulatory')">
            <span class="nav-icon">○</span> Deviations
          </button>

          <div class="sidebar-section">Regulatory</div>
          <button
            class="sidebar-item"
            [class.active]="activeView === 'regulatory'"
            (click)="selectView('regulatory')"
          >
            <span class="nav-icon">▥</span> Submissions
          </button>
          <button class="sidebar-item" (click)="selectView('regulatory')">
            <span class="nav-icon">⌁</span> Clinical Phases
          </button>
        </aside>

        <main class="main-content">
          <section *ngIf="activeView === 'workspace'">
            <div class="page-heading">
              <div>
                <h1>Welcome, {{ userName }}</h1>
                <p>NexaPLM· {{ todayLabel }}</p>
              </div>
              <div class="heading-actions">
                <button class="button secondary" type="button">Import Data</button>

              </div>
            </div>

            <!-- Previous workspace body retained in source history.
              <div class="stats-grid">
                <article class="stat-card">
                  <span>Active NPIs</span><strong>7</strong
                  ><small class="success">↑ 2 this quarter</small>
                </article>
                <article class="stat-card">
                  <span>Pending Approvals</span><strong class="warning-text">5</strong
                  ><small>3 due this week</small>
                </article>
                <article class="stat-card">
                  <span>Open Change Orders</span><strong>4</strong
                  ><small class="danger-text">2 high priority</small>
                </article>
                <article class="stat-card">
                  <span>Items in Production</span><strong>24</strong
                  ><small class="success">All compliant</small>
                </article>
              </div>

              <div class="content-grid">
                <section class="panel npi-panel">
                  <div class="panel-title">
                    <h2>Active NPI Programs</h2>
                    <button type="button" (click)="selectView('items')">View all</button>
                  </div>
                  <div class="npi-list">
                    <button class="npi-row" type="button" (click)="openRecentItem('FG-001')">
                      <span class="product-icon blue">Rx</span>
                      <span class="npi-copy"
                        ><strong>Product-X Tablet 50mg</strong
                        ><small>FG-001 · Modified Release Tablet</small></span
                      >
                      <span class="phase"
                        ><b>Scale-Up</b><i><em style="width:72%"></em></i
                      ></span>
                      <span class="badge blue">On Track</span>
                    </button>
                    <button class="npi-row" type="button" (click)="openRecentItem('DS-001')">
                      <span class="product-icon purple">DS</span>
                      <span class="npi-copy"
                        ><strong>API Intermediate Program</strong
                        ><small>DS-001 · Drug Substance</small></span
                      >
                      <span class="phase"
                        ><b>Validation</b><i><em style="width:54%"></em></i
                      ></span>
                      <span class="badge amber">At Risk</span>
                    </button>
                    <button class="npi-row" type="button" (click)="selectView('items')">
                      <span class="product-icon teal">PK</span>
                      <span class="npi-copy"
                        ><strong>PVDC Blister Pack</strong
                        ><small>PKG-001 · Packaging Component</small></span
                      >
                      <span class="phase"
                        ><b>Commercial</b><i><em style="width:91%"></em></i
                      ></span>
                      <span class="badge green">On Track</span>
                    </button>
                  </div>
                </section>

                <section class="panel activity-panel">
                  <div class="panel-title">
                    <h2>Recent Activity</h2>
                    <span class="count">8</span>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon green">✓</span>
                    <p>
                      <strong>ECO-001 approved</strong
                      ><small>Formula update for FG-001 · 24 min ago</small>
                    </p>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon blue">↻</span>
                    <p>
                      <strong>DS-002 moved to Validation</strong
                      ><small>Lifecycle updated by {{ userName }} · 1 hr ago</small>
                    </p>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon purple">↑</span>
                    <p>
                      <strong>Protocol document uploaded</strong
                      ><small>VAL-2026-014.pdf · 2 hrs ago</small>
                    </p>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon amber">!</span>
                    <p>
                      <strong>Approval requested</strong
                      ><small>ECO-002 awaiting Quality review · 3 hrs ago</small>
                    </p>
                  </div>
                </section>
              </div>

              <div class="content-grid lower-grid">
                <section class="panel">
                  <div class="panel-title">
                    <h2>Pending Actions</h2>
                    <span class="count">5</span>
                  </div>
                  <div class="action-row">
                    <span class="priority high">High</span>
                    <p>
                      <strong>Review ECO-002 impact assessment</strong
                      ><small>Due today · Quality</small>
                    </p>
                    <button (click)="openMyChanges()">Review</button>
                  </div>
                  <div class="action-row">
                    <span class="priority medium">Med</span>
                    <p>
                      <strong>Approve DS-002 validation protocol</strong
                      ><small>Due Jun 13 · Regulatory</small>
                    </p>
                    <button (click)="openMyChanges()">Open</button>
                  </div>
                  <div class="action-row">
                    <span class="priority low">Low</span>
                    <p>
                      <strong>Complete packaging specification</strong
                      ><small>Due Jun 18 · Engineering</small>
                    </p>
                    <button (click)="selectView('items')">Open</button>
                  </div>
                </section>

                <section class="panel ai-insight-panel">
                  <div class="panel-title">
                    <h2><span class="gradient-text">✦ AI Insights</span></h2>
                    <span class="live-dot">Live</span>
                  </div>
                  <div class="insight">
                    <strong>Release risk detected</strong>
                    <p>
                      DS-002 validation protocol is missing an approval. This may delay ECO-002 by
                      approximately 3 days.
                    </p>
                    <button (click)="openMyChanges()">Review blocker</button>
                  </div>
                  <div class="insight">
                    <strong>Reuse opportunity</strong>
                    <p>FG-001 shares 82% of its formulation with an existing released item.</p>
                    <button (click)="selectView('items')">Compare items</button>
                  </div>
                </section>
              </div>
            -->

            <div class="stats-grid">
              <article class="stat-card">
                <span>Active NPIs</span>
                <strong>7</strong>
                <small class="success">↑ 2 this quarter</small>
              </article>
              <article class="stat-card">
                <span>Pending Approvals</span>
                <strong class="warning-text">4</strong>
                <small>Avg. 1.4 days waiting</small>
              </article>
              <article class="stat-card">
                <span>Items in Production</span>
                <strong class="production-text">12</strong>
                <small class="success">↑ 3 from last month</small>
              </article>
              <!-- <article class="stat-card">
                <span>Regulatory Filings</span>
                <strong class="purple-text">3</strong>
                <small>IND · NDA · EMA-MAA</small>
              </article> -->
            </div>

            <div class="reference-grid">
              <section class="panel approval-panel">
                <div class="section-heading">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="8"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                  <strong>Pending Approvals</strong>
                  <span class="count">4</span>
                </div>
                <div class="approval-table-wrap">
                  <table class="approval-table">
                    <thead>
                      <tr>
                        <th>Change</th>
                        <th>Type</th>
                        <th>Stage</th>
                        <th>Waiting</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <button class="record-link" (click)="openMyChanges()">ECO-001</button>
                        </td>
                        <td><span class="badge blue">ECO</span></td>
                        <td><span class="badge amber">Review</span></td>
                        <td class="muted-cell">2d</td>
                        <td>
                          <button class="table-action primary" (click)="openMyChanges()">
                            Approve
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <button class="record-link" (click)="openMyChanges()">ECO-002</button>
                        </td>
                        <td><span class="badge blue">ECO</span></td>
                        <td><span class="badge amber">Review</span></td>
                        <td class="muted-cell">1d</td>
                        <td>
                          <button class="table-action primary" (click)="openMyChanges()">
                            Approve
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <button class="record-link" (click)="selectView('regulatory')">
                            DEV-004
                          </button>
                        </td>
                        <td><span class="badge red">Deviation</span></td>
                        <td><span class="badge amber">Approve</span></td>
                        <td class="muted-cell">4d</td>
                        <td>
                          <button class="table-action" (click)="selectView('regulatory')">
                            Review
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="panel activity-panel">
                <div class="section-heading">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"></path>
                  </svg>
                  <strong>Recent Activity</strong>
                </div>
                <div class="activity-item">
                  <span class="activity-icon green">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12l4 4L19 6"></path>
                    </svg>
                  </span>
                  <div class="activity-copy">
                    <p>
                      <strong>ECO-001A</strong> completed — Component COMP-001 released to
                      Production
                    </p>
                    <small>2 hours ago · Reviewer A</small>
                  </div>
                </div>
                <div class="activity-item">
                  <span class="activity-icon blue">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7l8-4 8 4-8 4-8-4zM4 7v10l8 4 8-4V7M12 11v10"></path>
                    </svg>
                  </span>
                  <div class="activity-copy">
                    <p><strong>FG-001</strong> lifecycle promoted — Preliminary → Prototype</p>
                    <small>5 hours ago · System</small>
                  </div>
                </div>
                <div class="activity-item">
                  <span class="activity-icon purple">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 3l1.4 4.1L18 8.5l-4.1 1.4L12.5 14l-1.4-4.1L7 8.5l4.1-1.4L12 3zM18 15l.7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15z"
                      ></path>
                    </svg>
                  </span>
                  <div class="activity-copy">
                    <p><strong>AI</strong> flagged missing validation protocol for DS-002</p>
                    <small>1 day ago · AI Assistant</small>
                  </div>
                </div>
              </section>
            </div>

            <div class="dashboard-divider"></div>
<!--
            <section class="panel workflow-panel">
              <div class="section-heading">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 6l5-3 5 3 5-3 3 2v13l-5 3-5-3-5 3-3-2V6zM8 3v15M13 6v12M18 3v15"
                  ></path>
                </svg>
                <strong>NPI Stage Progress — Product-X (FG-001)</strong>
              </div>
              <div class="workflow-bar">
                <div class="workflow-step done">
                  <strong>Concept</strong><small>✓ Complete</small>
                </div>
                <div class="workflow-step done">
                  <strong>Feasibility</strong><small>✓ Complete</small>
                </div>
                <div class="workflow-step done">
                  <strong>Development</strong><small>✓ Complete</small>
                </div>
                <div class="workflow-step current">
                  <strong>Clinical Pilot</strong><small>↻ In Progress</small>
                </div>
                <div class="workflow-step"><strong>Validation</strong><small>Pending</small></div>
                <div class="workflow-step"><strong>Registration</strong><small>Pending</small></div>
                <div class="workflow-step"><strong>Launch</strong><small>Pending</small></div>
              </div>
              <div class="workflow-meta">
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 3v3M19 3v3M4 8h16M5 5h14a1 1 0 011 1v14H4V6a1 1 0 011-1z"></path>
                  </svg>
                  <span>Target Launch: <strong>Q2 2027</strong></span>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s7-5.1 7-12A7 7 0 105 9c0 6.9 7 12 7 12z"></path>
                    <circle cx="12" cy="9" r="2"></circle>
                  </svg>
                  <span>Current Phase: <strong class="warning-text">Clinical Pilot</strong></span>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3L2.5 20h19L12 3zM12 9v5M12 17h.01"></path>
                  </svg>
                  <span>At-Risk Items: <strong class="danger-text">2</strong></span>
                </div>
              </div>
            </section> -->

            <div class="reference-grid bottom-grid">
              <section class="panel ai-insight-panel">
                <div class="section-heading">
                  <svg class="purple-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 3l1.4 4.1L18 8.5l-4.1 1.4L12.5 14l-1.4-4.1L7 8.5l4.1-1.4L12 3zM18 15l.7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15z"
                    ></path>
                  </svg>
                  <strong class="gradient-text">AI Insights</strong>
                </div>
                <div class="insight">
                  <div class="insight-label">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M20 20l-4-4"></path>
                    </svg>
                    Risk Alert
                  </div>
                  <p>
                    Validation protocol for Drug Substance DS-002 is missing. This may block ECO-002
                    release. Recommend creating VP-DS-002 document now.
                  </p>
                  <div class="chip-row">
                    <button>Create Protocol</button><button>Snooze</button>
                  </div>
                </div>
                <div class="insight">
                  <div class="insight-label">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M9 18h6M10 22h4M8 14a7 7 0 118 0c-1.2 1-1.7 2-1.8 3H9.8C9.7 16 9.2 15 8 14z"
                      ></path>
                    </svg>
                    Suggestion
                  </div>
                  <p>
                    Based on your NPI timeline, COMP-003 should be released to Production before
                    June 20 to avoid Clinical Pilot delay.
                  </p>
                  <div class="chip-row">
                    <button (click)="openRecentItem('COMP-003')">View COMP-003</button>
                    <button (click)="openChangeCreate()">Create ECO</button>
                  </div>
                </div>
              </section>

              <section class="panel workspace-overview">
                <div class="section-heading">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>
                  </svg>
                  <strong>Workspace Overview</strong>
                </div>
                <div class="metric">
                  <div><span>NPI Completion</span><strong>42%</strong></div>
                  <i><em class="blue-fill" style="width:42%"></em></i>
                </div>
                <div class="metric">
                  <div>
                    <span>Regulatory Readiness</span><strong class="warning-text">28%</strong>
                  </div>
                  <i><em class="amber-fill" style="width:28%"></em></i>
                </div>
                <div class="metric">
                  <div>
                    <span>Quality Compliance</span><strong class="production-text">85%</strong>
                  </div>
                  <i><em class="green-fill" style="width:85%"></em></i>
                </div>
                <div class="metric">
                  <div><span>Document Control</span><strong class="purple-text">61%</strong></div>
                  <i><em class="purple-fill" style="width:61%"></em></i>
                </div>
              </section>
            </div>
          </section>

          <section *ngIf="activeView === 'items'" class="view-panel items-view">
            <div class="page-heading items-heading">
              <div>
                <h1>Items</h1>
                <p>Drug substances, products, components, and packaging</p>
              </div>
              <div class="heading-actions">
                <button class="button secondary" type="button" (click)="browseReleasedItems()">
                  Browse Released
                </button>
                <button
                  class="button primary"
                  type="button"
                  (click)="showCreateModal = true"
                  [disabled]="userService.isReadOnly()"
                >
                  + Create Item
                </button>
              </div>
            </div>

            <div class="item-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M20 20l-4-4"></path>
              </svg>
              <input
                type="search"
                [value]="itemQuery"
                (input)="updateItemQuery($event)"
                placeholder="Search items by number, description, or type..."
                aria-label="Search items"
              />
              <button type="button">Advanced Filter</button>
            </div>

            <div class="item-filter-row" aria-label="Item type filters">
              <button [class.active]="itemFilter === 'all'" (click)="itemFilter = 'all'">
                All ({{ inventoryService.inventory().length }})
              </button>
              <button
                [class.active]="itemFilter === 'drug-substance'"
                (click)="itemFilter = 'drug-substance'"
              >
                Drug Substance ({{ itemCount('drug-substance') }})
              </button>
              <button
                [class.active]="itemFilter === 'drug-product'"
                (click)="itemFilter = 'drug-product'"
              >
                Drug Product ({{ itemCount('drug-product') }})
              </button>
              <button
                [class.active]="itemFilter === 'raw-material'"
                (click)="itemFilter = 'raw-material'"
              >
                Raw Material ({{ itemCount('raw-material') }})
              </button>
              <button
                [class.active]="itemFilter === 'packaging'"
                (click)="itemFilter = 'packaging'"
              >
                Packaging ({{ itemCount('packaging') }})
              </button>
            </div>

            <div class="items-table-wrap">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Lifecycle</th>
                    <th>Revision</th>
                    <th>ECM Status</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let item of filteredItems"
                    tabindex="0"
                    (click)="openRecentItem(item.sku)"
                    (keydown.enter)="openRecentItem(item.sku)"
                  >
                    <td>
                      <span class="item-number">{{ item.sku }}</span>
                    </td>
                    <td class="item-description">{{ itemDescription(item) }}</td>
                    <td>
                      <span class="item-pill" [ngClass]="itemTypeClass(item)">
                        {{ itemTypeLabel(item) }}
                      </span>
                    </td>
                    <td>
                      <span class="item-pill" [ngClass]="lifecycleClass(item)">
                        {{ lifecycleLabel(item) }}
                      </span>
                    </td>
                    <td>{{ displayRevision(item.revision) }}</td>
                    <td>
                      <span class="item-pill" [ngClass]="ecmStatusClass(item)">
                        {{ ecmStatus(item) }}
                      </span>
                    </td>
                    <td class="updated-cell">{{ updatedDate(item) }}</td>
                    <td>
                      <button
                        class="open-item"
                        type="button"
                        (click)="$event.stopPropagation(); openRecentItem(item.sku)"
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!filteredItems.length">
                    <td class="empty-items" colspan="8">No items match the selected filters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section *ngIf="activeView === 'changes'" class="view-panel changes-view">
            <div class="page-heading changes-heading">
              <div>
                <h1>Changes</h1>
                <p>Engineering change orders, requests, and deviations</p>
              </div>
              <div class="heading-actions">
                <button class="button secondary" type="button" (click)="browseReleasedChanges()">
                  Browse Released
                </button>
                <button class="button primary" type="button" (click)="openChangeCreate()">
                  + Create Change
                </button>
              </div>
            </div>

            <div class="item-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M20 20l-4-4"></path>
              </svg>
              <input
                type="search"
                [value]="changeQuery"
                (input)="updateChangeQuery($event)"
                placeholder="Search changes by number, type, description..."
                aria-label="Search changes"
              />
              <button type="button">Advanced Filter</button>
            </div>

            <div class="items-table-wrap">
              <table class="items-table changes-table">
                <thead>
                  <tr>
                    <th>Change #</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Reason</th>
                    <th>Workflow State</th>
                    <th>Engineer</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let change of filteredChanges">
                    <td>
                      <button class="item-number change-number" type="button" (click)="openMyChanges()">
                        {{ change.number }}
                      </button>
                    </td>
                    <td>
                      <span
                        class="item-pill"
                        [ngClass]="change.type === 'Deviation' ? 'pill-red' : 'pill-blue'"
                      >
                        {{ change.type }}
                      </span>
                    </td>
                    <td class="change-description">{{ change.description }}</td>
                    <td class="change-reason">{{ change.reason }}</td>
                    <td>
                      <span
                        class="item-pill"
                        [ngClass]="workflowStateClass(change.workflowState)"
                      >
                        {{ change.workflowState }}
                      </span>
                    </td>
                    <td>{{ change.engineer }}</td>
                    <td class="change-created">{{ change.created }}</td>
                    <td>
                      <button class="open-item" type="button" (click)="openMyChanges()">
                        Open &rarr;
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!filteredChanges.length">
                    <td class="empty-items" colspan="8">No changes match your search.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section *ngIf="activeView === 'regulatory'" class="view-panel">
            <div class="page-heading">
              <div>
                <h1>Regulatory</h1>
                <p>Submission readiness, clinical phases, CAPA, and deviations.</p>
              </div>
            </div>
            <div class="quick-grid">
              <article class="quick-card static">
                <span>▥</span><strong>Submissions</strong
                ><small>2 active dossiers · 1 review due this week</small>
              </article>
              <article class="quick-card static">
                <span>⌁</span><strong>Clinical Phases</strong
                ><small>3 programs currently in clinical development</small>
              </article>
              <article class="quick-card static">
                <span>△</span><strong>CAPA</strong><small>3 open actions · 1 high priority</small>
              </article>
            </div>
          </section>

          <section *ngIf="activeView === 'reports'" class="view-panel">
            <div class="page-heading">
              <div>
                <h1>Reports</h1>
                <p>NPI throughput, change performance, compliance, and portfolio health.</p>
              </div>
            </div>
            <div class="report-placeholder panel">
              <div class="bar-chart" aria-label="Illustrative NPI throughput chart">
                <i style="height:42%"></i><i style="height:66%"></i><i style="height:54%"></i
                ><i style="height:82%"></i><i style="height:73%"></i><i style="height:92%"></i>
              </div>
              <strong>NPI Throughput</strong><small>Monthly portfolio progress</small>
            </div>
          </section>
        </main>

        <aside class="ai-panel" [class.open]="aiOpen">
          <div class="ai-header">
            <span class="ai-mark">✦</span><strong class="gradient-text">NexaPLM AI Assistant</strong
            ><button (click)="aiOpen = false">×</button>
          </div>
          <div class="ai-body">
            <article>
              <b>Active Alert</b>
              <p>
                DS-002 validation protocol is missing. ECO-002 has a release risk before its
                deadline.
              </p>
              <button (click)="openMyChanges()">Review change</button>
            </article>
            <article>
              <b>NPI Recommendation</b>
              <p>
                COMP-003 should move to Production before FG-001 can complete its release workflow.
              </p>
              <button (click)="selectView('items')">View item</button>
            </article>
            <article>
              <b>Regulatory Intel</b>
              <p>Two CTD Module 3 sections may need revision for the active submission.</p>
              <button (click)="selectView('regulatory')">View submissions</button>
            </article>
          </div>
          <div class="ai-input">
            <input placeholder="Ask about items, changes, compliance..." /><button>↑</button>
          </div>
        </aside>
      </div>
    </div>

    <app-item-form-modal
      *ngIf="showCreateModal"
      [theme]="themeService.theme()"
      (saved)="handleItemCreated()"
      (close)="showCreateModal = false"
    ></app-item-form-modal>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }
    * {
      box-sizing: border-box;
    }
    button,
    input {
      font: inherit;
    }
    .plm-shell {
      --bg: #0d1117;
      --surface: #161b22;
      --surface-2: #21262d;
      --surface-3: #30363d;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --subtle: #6e7681;
      --accent: #2f81f7;
      --accent-2: #388bfd;
      --green: #3fb950;
      --amber: #d29922;
      --red: #f85149;
      --purple: #bc8cff;
      --teal: #39d3c4;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .plm-shell.light-theme {
      --bg: #f5f7fa;
      --surface: #ffffff;
      --surface-2: #eef2f7;
      --surface-3: #dfe5ec;
      --border: #d8dee7;
      --text: #172033;
      --muted: #59677c;
      --subtle: #7b8798;
      --accent: #1f6feb;
      --accent-2: #1158c7;
      --green: #1a7f37;
      --amber: #9a6700;
      --red: #cf222e;
      --purple: #8250df;
      --teal: #087f8c;
    }
    .topnav {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      height: 52px;
      align-items: center;
      gap: 22px;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 0;
      background: transparent;
      color: var(--accent);
      font-size: 16px;
      font-weight: 800;
    }
    .brand-mark {
      display: grid;
      width: 27px;
      height: 27px;
      place-items: center;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #fff;
      font-size: 13px;
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
      gap: 9px;
    }
    .ai-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid color-mix(in srgb, var(--purple) 35%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--purple) 10%, transparent);
      color: var(--purple);
      font-size: 12px;
      font-weight: 700;
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
    }
    .round-button svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .round-button:hover {
      color: var(--text);
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
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
    }
    .user-menu:hover .user-dropdown,
    .user-menu:focus-within .user-dropdown {
      display: block;
    }
    .account-summary {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 9px 10px 10px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 5px;
    }
    .account-summary strong {
      font-size: 13px;
    }
    .account-summary span {
      color: var(--subtle);
      font-size: 11px;
    }
    .user-dropdown a {
      display: block;
      padding: 8px 10px;
      border-radius: 6px;
      color: var(--muted);
      font-size: 13px;
      text-decoration: none;
    }
    .user-dropdown a:hover {
      background: var(--surface-2);
      color: var(--text);
    }
    .user-dropdown .logout-link {
      color: var(--red);
    }
    .app-body {
      display: flex;
      min-height: calc(100vh - 52px);
    }
    .sidebar {
      position: sticky;
      top: 52px;
      display: flex;
      width: 210px;
      min-width: 210px;
      height: calc(100vh - 52px);
      flex-direction: column;
      overflow-y: auto;
      padding: 8px 0 18px;
      border-right: 1px solid var(--border);
      background: var(--surface);
    }
    .sidebar-section {
      padding: 12px 16px 4px;
      color: var(--subtle);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
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
      color: var(--muted);
      font-size: 13px;
      text-align: left;
    }
    .sidebar-item:hover {
      background: var(--surface-2);
      color: var(--text);
    }
    .sidebar-item.active {
      background: color-mix(in srgb, var(--accent) 13%, transparent);
      color: var(--accent);
      font-weight: 650;
    }
    .sidebar-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .nav-icon {
      width: 17px;
      color: currentColor;
      text-align: center;
    }
    .sidebar-badge {
      margin-left: auto;
      padding: 1px 6px;
      border-radius: 999px;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
    }
    .sidebar-badge.danger {
      background: var(--red);
    }
    .sidebar-badge.warning {
      background: var(--amber);
    }
    .main-content {
      flex: 1;
      min-width: 0;
      padding: 24px 28px 36px;
      overflow: hidden;
    }
    .page-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;
    }
    .page-heading h1 {
      margin: 0;
      color: var(--text);
      font-size: 20px;
      line-height: 1.2;
    }
    .page-heading p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 13px;
    }
    .heading-actions {
      display: flex;
      gap: 8px;
    }
    .button {
      padding: 7px 13px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .button.primary {
      border: 1px solid var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .button.primary:hover {
      background: var(--accent-2);
    }
    .button.secondary {
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
    }
    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .stat-card {
      display: flex;
      min-width: 0;
      flex-direction: column;
      padding: 15px 17px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
    }
    .stat-card span {
      color: var(--muted);
      font-size: 11.5px;
    }
    .stat-card strong {
      margin: 5px 0 3px;
      font-size: 26px;
      line-height: 1;
    }
    .stat-card small {
      color: var(--subtle);
      font-size: 11px;
    }
    .success {
      color: var(--green) !important;
    }
    .warning-text {
      color: var(--amber);
    }
    .danger-text {
      color: var(--red) !important;
    }
    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
      gap: 14px;
      margin-bottom: 14px;
    }
    .lower-grid {
      grid-template-columns: 1.2fr 1fr;
    }
    .panel {
      min-width: 0;
      padding: 15px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
    }
    .panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .panel-title h2 {
      margin: 0;
      color: var(--text);
      font-size: 12.5px;
    }
    .panel-title button {
      border: 0;
      background: transparent;
      color: var(--accent);
      font-size: 11px;
    }
    .count {
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--muted);
      font-size: 10px;
    }
    .npi-list {
      display: grid;
    }
    .npi-row {
      display: grid;
      grid-template-columns: 36px minmax(180px, 1fr) 130px auto;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 11px 5px;
      border: 0;
      border-bottom: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      text-align: left;
    }
    .npi-row:last-child {
      border-bottom: 0;
    }
    .npi-row:hover {
      background: color-mix(in srgb, var(--text) 2%, transparent);
    }
    .product-icon {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
    }
    .product-icon.blue {
      background: color-mix(in srgb, var(--accent) 16%, transparent);
      color: var(--accent);
    }
    .product-icon.purple {
      background: color-mix(in srgb, var(--purple) 16%, transparent);
      color: var(--purple);
    }
    .product-icon.teal {
      background: color-mix(in srgb, var(--teal) 16%, transparent);
      color: var(--teal);
    }
    .npi-copy,
    .phase {
      display: flex;
      min-width: 0;
      flex-direction: column;
    }
    .npi-copy strong {
      overflow: hidden;
      font-size: 12.5px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .npi-copy small,
    .phase b {
      margin-top: 3px;
      color: var(--subtle);
      font-size: 10.5px;
      font-weight: 500;
    }
    .phase i {
      height: 5px;
      margin-top: 6px;
      overflow: hidden;
      border-radius: 4px;
      background: var(--surface-2);
    }
    .phase em {
      display: block;
      height: 100%;
      border-radius: 4px;
      background: var(--accent);
    }
    .badge {
      padding: 2px 7px;
      border: 1px solid;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge.blue {
      border-color: color-mix(in srgb, var(--accent) 35%, transparent);
      background: color-mix(in srgb, var(--accent) 13%, transparent);
      color: var(--accent);
    }
    .badge.amber {
      border-color: color-mix(in srgb, var(--amber) 35%, transparent);
      background: color-mix(in srgb, var(--amber) 13%, transparent);
      color: var(--amber);
    }
    .badge.green {
      border-color: color-mix(in srgb, var(--green) 35%, transparent);
      background: color-mix(in srgb, var(--green) 13%, transparent);
      color: var(--green);
    }
    .activity-item {
      display: flex;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid var(--border);
    }
    .activity-item:last-child {
      border: 0;
    }
    .activity-icon {
      display: grid;
      width: 29px;
      height: 29px;
      flex: 0 0 29px;
      place-items: center;
      border-radius: 50%;
      font-size: 12px;
    }
    .activity-icon.green {
      background: color-mix(in srgb, var(--green) 14%, transparent);
      color: var(--green);
    }
    .activity-icon.blue {
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--accent);
    }
    .activity-icon.purple {
      background: color-mix(in srgb, var(--purple) 14%, transparent);
      color: var(--purple);
    }
    .activity-icon.amber {
      background: color-mix(in srgb, var(--amber) 14%, transparent);
      color: var(--amber);
    }
    .activity-item p,
    .action-row p {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      margin: 0;
    }
    .activity-item strong,
    .action-row strong {
      font-size: 12px;
    }
    .activity-item small,
    .action-row small {
      margin-top: 3px;
      color: var(--subtle);
      font-size: 10.5px;
    }
    .action-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .action-row:last-child {
      border: 0;
    }
    .priority {
      width: 32px;
      padding: 3px 0;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
    }
    .priority.high {
      background: color-mix(in srgb, var(--red) 14%, transparent);
      color: var(--red);
    }
    .priority.medium {
      background: color-mix(in srgb, var(--amber) 14%, transparent);
      color: var(--amber);
    }
    .priority.low {
      background: var(--surface-2);
      color: var(--muted);
    }
    .action-row button,
    .insight button {
      padding: 4px 8px;
      border: 1px solid var(--border);
      border-radius: 5px;
      background: var(--surface-2);
      color: var(--text);
      font-size: 10.5px;
    }
    .ai-insight-panel {
      border-color: color-mix(in srgb, var(--purple) 28%, var(--border));
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent), var(--purple));
      background-clip: text;
      color: transparent;
    }
    .live-dot {
      color: var(--green);
      font-size: 10px;
    }
    .live-dot:before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 4px;
      border-radius: 50%;
      background: var(--green);
    }
    .insight {
      padding: 10px;
      border: 1px solid color-mix(in srgb, var(--purple) 20%, var(--border));
      border-radius: 7px;
      background: color-mix(in srgb, var(--purple) 5%, transparent);
    }
    .insight + .insight {
      margin-top: 8px;
    }
    .insight strong {
      font-size: 11.5px;
    }
    .insight p {
      margin: 4px 0 8px;
      color: var(--muted);
      font-size: 11px;
      line-height: 1.45;
    }
    .production-text {
      color: var(--green) !important;
    }
    .purple-text {
      color: var(--purple) !important;
    }
    .reference-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 20px;
      margin-bottom: 12px;
      color: var(--text);
      font-size: 12.5px;
    }
    .section-heading > svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .section-heading .purple-icon {
      color: var(--purple);
    }
    .section-heading .count {
      margin-left: 1px;
    }
    .approval-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .approval-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .approval-table thead {
      background: var(--surface-2);
    }
    .approval-table th {
      padding: 8px 11px;
      color: var(--muted);
      font-size: 10px;
      font-weight: 750;
      letter-spacing: 0.05em;
      text-align: left;
      text-transform: uppercase;
    }
    .approval-table td {
      padding: 9px 11px;
      border-top: 1px solid var(--border);
      color: var(--text);
      vertical-align: middle;
    }
    .approval-table tbody tr:hover {
      background: color-mix(in srgb, var(--text) 2%, transparent);
    }
    .record-link {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--accent);
      font-weight: 650;
    }
    .muted-cell {
      color: var(--muted) !important;
    }
    .table-action {
      padding: 4px 9px;
      border: 1px solid var(--border);
      border-radius: 5px;
      background: var(--surface-2);
      color: var(--text);
      font-size: 10.5px;
      font-weight: 650;
    }
    .table-action.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .badge.red {
      border-color: color-mix(in srgb, var(--red) 35%, transparent);
      background: color-mix(in srgb, var(--red) 13%, transparent);
      color: var(--red);
    }
    .badge.purple {
      border-color: color-mix(in srgb, var(--purple) 35%, transparent);
      background: color-mix(in srgb, var(--purple) 13%, transparent);
      color: var(--purple);
    }
    .activity-panel {
      padding-bottom: 8px;
    }
    .activity-icon svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .activity-copy {
      min-width: 0;
      flex: 1;
    }
    .activity-copy p {
      margin: 0;
      color: var(--text);
      font-size: 12px;
      line-height: 1.4;
    }
    .activity-copy small {
      display: block;
      margin-top: 2px;
      color: var(--subtle);
      font-size: 10.5px;
    }
    .dashboard-divider {
      height: 1px;
      margin: 18px 0;
      background: var(--border);
    }
    .workflow-panel {
      margin-bottom: 18px;
    }
    .workflow-bar {
      display: flex;
      align-items: stretch;
      overflow-x: auto;
      margin: 14px 0 12px;
    }
    .workflow-step {
      display: flex;
      min-width: 92px;
      flex: 1;
      flex-direction: column;
      align-items: center;
      padding: 9px 12px;
      border: 1.5px solid var(--border);
      border-right: 0;
      background: var(--surface-2);
      color: var(--muted);
      text-align: center;
    }
    .workflow-step:first-child {
      border-radius: 6px 0 0 6px;
    }
    .workflow-step:last-child {
      border-right: 1.5px solid var(--border);
      border-radius: 0 6px 6px 0;
    }
    .workflow-step strong {
      font-size: 10.5px;
      font-weight: 650;
    }
    .workflow-step small {
      margin-top: 2px;
      color: var(--subtle);
      font-size: 9px;
    }
    .workflow-step.done {
      border-color: color-mix(in srgb, var(--green) 38%, transparent);
      background: color-mix(in srgb, var(--green) 8%, transparent);
      color: var(--green);
    }
    .workflow-step.done small {
      color: var(--green);
    }
    .workflow-step.current {
      border-color: var(--amber);
      background: color-mix(in srgb, var(--amber) 8%, transparent);
      color: var(--amber);
    }
    .workflow-step.current small {
      color: var(--amber);
    }
    .workflow-meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .workflow-meta > div {
      display: flex;
      align-items: center;
      gap: 7px;
      color: var(--muted);
      font-size: 11px;
    }
    .workflow-meta svg {
      width: 14px;
      height: 14px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .workflow-meta strong {
      color: var(--text);
    }
    .bottom-grid {
      align-items: stretch;
    }
    .ai-insight-panel {
      border-color: color-mix(in srgb, var(--purple) 22%, var(--border));
    }
    .insight-label {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--purple);
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .insight-label svg {
      width: 13px;
      height: 13px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip-row button {
      padding: 3px 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--text);
      font-size: 10.5px;
    }
    .chip-row button:hover {
      border-color: var(--purple);
      color: var(--purple);
    }
    .workspace-overview .section-heading {
      margin-bottom: 15px;
    }
    .metric + .metric {
      margin-top: 12px;
    }
    .metric > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
    }
    .metric span {
      color: var(--muted);
    }
    .metric strong {
      color: var(--text);
      font-size: 11px;
    }
    .metric > i {
      display: block;
      height: 6px;
      overflow: hidden;
      border-radius: 4px;
      background: var(--surface-2);
    }
    .metric em {
      display: block;
      height: 100%;
      border-radius: inherit;
    }
    .blue-fill {
      background: var(--accent);
    }
    .amber-fill {
      background: var(--amber);
    }
    .green-fill {
      background: var(--green);
    }
    .purple-fill {
      background: var(--purple);
    }
    .view-panel {
      max-width: 1200px;
    }
    .items-view {
      max-width: none;
    }
    .items-heading {
      margin-bottom: 24px;
    }
    .item-search {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 49px;
      margin-bottom: 19px;
      padding: 0 17px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--surface-2);
    }
    .item-search svg {
      width: 19px;
      height: 19px;
      fill: none;
      stroke: var(--purple);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .item-search input {
      min-width: 0;
      flex: 1;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--text);
      font-size: 13px;
    }
    .item-search input::placeholder {
      color: var(--subtle);
    }
    .item-search button {
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 12px;
      font-weight: 650;
    }
    .item-filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-bottom: 17px;
    }
    .item-filter-row button {
      padding: 4px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--muted);
      font-size: 11px;
      line-height: 1.2;
    }
    .item-filter-row button.active {
      border-color: color-mix(in srgb, var(--accent) 55%, transparent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--accent);
    }
    .items-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }
    .items-table {
      width: 100%;
      min-width: 1050px;
      border-collapse: collapse;
      text-align: left;
    }
    .items-table thead {
      background: var(--surface-2);
    }
    .items-table th {
      padding: 12px 16px;
      color: var(--muted);
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 13px 16px;
      border-top: 1px solid var(--border);
      color: var(--text);
      font-size: 12px;
      white-space: nowrap;
    }
    .items-table tbody tr {
      cursor: pointer;
      transition: background 0.14s ease;
    }
    .items-table tbody tr:hover,
    .items-table tbody tr:focus {
      outline: none;
      background: color-mix(in srgb, var(--accent) 5%, transparent);
    }
    .item-number {
      color: var(--accent);
      font-weight: 700;
    }
    .item-description {
      min-width: 330px;
      white-space: normal !important;
    }
    .item-pill {
      display: inline-flex;
      padding: 3px 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--muted);
      font-size: 10.5px;
      font-weight: 650;
    }
    .pill-blue {
      border-color: color-mix(in srgb, var(--accent) 40%, transparent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--accent);
    }
    .pill-purple {
      border-color: color-mix(in srgb, var(--purple) 40%, transparent);
      background: color-mix(in srgb, var(--purple) 14%, transparent);
      color: var(--purple);
    }
    .pill-green {
      border-color: color-mix(in srgb, var(--green) 38%, transparent);
      background: color-mix(in srgb, var(--green) 13%, transparent);
      color: var(--green);
    }
    .pill-amber {
      border-color: color-mix(in srgb, var(--amber) 40%, transparent);
      background: color-mix(in srgb, var(--amber) 13%, transparent);
      color: var(--amber);
    }
    .pill-gray {
      border-color: var(--border);
      background: var(--surface-2);
      color: var(--muted);
    }
    .updated-cell {
      color: var(--muted) !important;
    }
    .open-item {
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 11.5px;
      font-weight: 700;
    }
    .open-item:hover {
      color: var(--accent);
    }
    .empty-items {
      padding: 48px 20px !important;
      color: var(--subtle) !important;
      text-align: center;
    }
    .changes-heading {
      margin-bottom: 20px;
    }
    .changes-table {
      min-width: 1120px;
    }
    .change-number {
      padding: 0;
      border: 0;
      background: transparent;
    }
    .change-description {
      min-width: 300px;
      white-space: normal !important;
    }
    .change-reason {
      min-width: 220px;
      white-space: normal !important;
    }
    .pill-red {
      border-color: color-mix(in srgb, var(--red) 42%, transparent);
      background: color-mix(in srgb, var(--red) 14%, transparent);
      color: var(--red);
    }
    .change-created {
      color: var(--muted);
    }
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 14px;
    }
    .quick-card {
      display: flex;
      min-height: 155px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      color: var(--text);
      text-align: left;
    }
    .quick-card:hover:not(.static) {
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    .quick-card > span {
      color: var(--accent);
      font-size: 25px;
    }
    .quick-card strong {
      margin-top: 12px;
      font-size: 14px;
    }
    .quick-card small {
      margin-top: 5px;
      color: var(--muted);
      font-size: 11.5px;
      line-height: 1.45;
    }
    .recent-panel {
      margin-top: 14px;
    }
    .recent-empty {
      padding: 30px;
      color: var(--subtle);
      text-align: center;
    }
    .recent-row {
      display: grid;
      width: 100%;
      grid-template-columns: 100px 1fr auto;
      gap: 12px;
      padding: 10px;
      border: 0;
      border-top: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      text-align: left;
    }
    .recent-row small {
      color: var(--subtle);
    }
    .report-placeholder {
      display: flex;
      min-height: 320px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .bar-chart {
      display: flex;
      width: min(500px, 90%);
      height: 180px;
      align-items: flex-end;
      justify-content: center;
      gap: 18px;
      padding: 15px;
      border-bottom: 1px solid var(--border);
    }
    .bar-chart i {
      width: 42px;
      border-radius: 5px 5px 0 0;
      background: linear-gradient(var(--purple), var(--accent));
    }
    .report-placeholder strong {
      margin-top: 20px;
    }
    .report-placeholder small {
      color: var(--muted);
    }
    .ai-panel {
      display: none;
      width: 340px;
      min-width: 340px;
      flex-direction: column;
      border-left: 1px solid var(--border);
      background: var(--surface);
    }
    .ai-panel.open {
      display: flex;
    }
    .ai-header {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 13px 15px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .ai-header strong {
      flex: 1;
    }
    .ai-header > button {
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 20px;
    }
    .ai-mark {
      display: grid;
      width: 28px;
      height: 28px;
      place-items: center;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #fff;
    }
    .ai-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
    }
    .ai-body article {
      padding: 11px;
      border: 1px solid color-mix(in srgb, var(--purple) 23%, var(--border));
      border-radius: 8px;
      background: color-mix(in srgb, var(--purple) 5%, transparent);
    }
    .ai-body b {
      color: var(--purple);
      font-size: 10px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .ai-body p {
      margin: 6px 0 9px;
      color: var(--muted);
      font-size: 11.5px;
      line-height: 1.5;
    }
    .ai-body button {
      padding: 4px 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--text);
      font-size: 10px;
    }
    .ai-input {
      display: flex;
      gap: 7px;
      padding: 11px 14px;
      border-top: 1px solid var(--border);
    }
    .ai-input input {
      min-width: 0;
      flex: 1;
      padding: 8px 11px;
      border: 1px solid var(--border);
      border-radius: 999px;
      outline: 0;
      background: var(--surface-2);
      color: var(--text);
      font-size: 11px;
    }
    .ai-input button {
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #fff;
    }
    @media (max-width: 1100px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .content-grid,
      .lower-grid {
        grid-template-columns: 1fr;
      }
      .reference-grid {
        grid-template-columns: 1fr;
      }
      .ai-panel {
        position: fixed;
        top: 52px;
        right: 0;
        bottom: 0;
        z-index: 80;
        box-shadow: -15px 0 35px rgba(0, 0, 0, 0.25);
      }
    }
    @media (max-width: 780px) {
      .topnav {
        gap: 10px;
      }
      .top-tabs {
        display: none;
      }
      .ai-button {
        display: none;
      }
      .sidebar {
        width: 58px;
        min-width: 58px;
      }
      .sidebar-section,
      .sidebar-item:not(.active) .sidebar-badge {
        font-size: 0;
      }
      .sidebar-item {
        justify-content: center;
      }
      .nav-icon {
        font-size: 16px;
      }
      .main-content {
        padding: 20px 14px;
      }
      .quick-grid {
        grid-template-columns: 1fr;
      }
      .workflow-meta {
        grid-template-columns: 1fr;
      }
      .npi-row {
        grid-template-columns: 34px 1fr auto;
      }
      .phase {
        display: none;
      }
    }
    @media (max-width: 520px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .page-heading {
        flex-direction: column;
      }
      .heading-actions {
        width: 100%;
      }
      .heading-actions .button {
        flex: 1;
      }
      .ai-panel {
        width: 100%;
        min-width: 0;
      }
    }
  `,
})
export class Dashboard {
  readonly userService = inject(UserService);
  readonly inventoryService = inject(InventoryService);
  readonly recentItemsService = inject(RecentItemsService);
  readonly themeService = inject(ThemeService);
  readonly router = inject(Router);

  activeView: DashboardView = 'workspace';
  showCreateModal = false;
  aiOpen = false;
  itemQuery = '';
  itemFilter: 'all' | 'drug-substance' | 'drug-product' | 'raw-material' | 'packaging' = 'all';
  changeQuery = '';
  readonly changes: DashboardChange[] = [
    {
      number: 'ECO-001',
      type: 'ECO',
      description: 'NPI Prototype Release of Product-X',
      reason: 'New Product Introduction',
      workflowState: 'Review',
      engineer: 'Test User',
      created: '05 Jun 2026',
    },
    {
      number: 'ECO-002',
      type: 'ECO',
      description: 'Prototype FG-001 Production Release',
      reason: 'New Product Introduction',
      workflowState: 'Draft',
      engineer: 'Test User',
      created: '07 Jun 2026',
    },
    {
      number: 'ECO-001A',
      type: 'ECO',
      description: 'Release of Component A',
      reason: 'NPI Component Release',
      workflowState: 'Completed',
      engineer: 'Analyst A',
      created: '03 Jun 2026',
    },
    {
      number: 'DEV-004',
      type: 'Deviation',
      description: 'Batch #2024B temperature excursion during storage',
      reason: 'Manufacturing Deviation',
      workflowState: 'Approve',
      engineer: 'QA Team',
      created: '08 Jun 2026',
    },
  ];
  readonly todayLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  constructor() {
    this.setActiveViewFromUrl(this.router.url);
  }

  get userName(): string {
    return this.userService.currentUser() || 'User1';
  }

  get initials(): string {
    return this.userName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  get filteredItems(): Product[] {
    const query = this.itemQuery.trim().toLowerCase();
    return this.inventoryService
      .inventory()
      .filter((item) => this.itemFilter === 'all' || this.itemCategory(item) === this.itemFilter)
      .filter((item) => {
        if (!query) {
          return true;
        }
        return [
          item.sku,
          item.name,
          item.partDescription,
          item.partType,
          item.category,
          item.classification,
          item.lifecycle,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      });
  }

  get filteredChanges(): DashboardChange[] {
    const query = this.changeQuery.trim().toLowerCase();
    if (!query) {
      return this.changes;
    }

    return this.changes.filter((change) =>
      [
        change.number,
        change.type,
        change.description,
        change.reason,
        change.workflowState,
        change.engineer,
        change.created,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }

  selectView(view: DashboardView) {
    this.activeView = view;
  }

  updateItemQuery(event: Event) {
    this.itemQuery = (event.target as HTMLInputElement).value;
  }

  updateChangeQuery(event: Event) {
    this.changeQuery = (event.target as HTMLInputElement).value;
  }

  workflowStateClass(state: DashboardChange['workflowState']): string {
    if (state === 'Completed') return 'pill-green';
    if (state === 'Draft') return 'pill-gray';
    return 'pill-amber';
  }

  browseReleasedItems() {
    this.itemFilter = 'all';
    this.itemQuery = 'production';
  }

  itemCount(category: Exclude<Dashboard['itemFilter'], 'all'>): number {
    return this.inventoryService.inventory().filter((item) => this.itemCategory(item) === category)
      .length;
  }

  itemDescription(item: Product): string {
    return item.partDescription || item.name || item.partType || item.type;
  }

  itemTypeLabel(item: Product): string {
    const category = this.itemCategory(item);
    if (category === 'drug-substance') return 'Drug Substance';
    if (category === 'drug-product') return 'Finished Good';
    if (category === 'raw-material') return item.partType || 'Raw Material';
    if (category === 'packaging') return 'Packaging';
    return item.partType || item.part || item.type;
  }

  itemTypeClass(item: Product): string {
    const category = this.itemCategory(item);
    if (category === 'drug-product') return 'pill-blue';
    if (category === 'drug-substance') return 'pill-purple';
    if (category === 'packaging') return 'pill-green';
    return 'pill-gray';
  }

  lifecycleLabel(item: Product): string {
    return item.lifecycle === 'Design' ? 'Preliminary' : item.lifecycle;
  }

  lifecycleClass(item: Product): string {
    if (item.lifecycle === 'Production') return 'pill-green';
    if (item.lifecycle === 'Prototype') return 'pill-amber';
    return 'pill-gray';
  }

  displayRevision(revision: string): string {
    return revision.split('.')[0] || revision;
  }

  ecmStatus(item: Product): string {
    if (item.changes?.some((change) => /draft|review|pending/i.test(change.status))) {
      return 'Pending';
    }
    if (item.lifecycle === 'Production') {
      return 'Completed';
    }
    if (item.bom?.length) {
      return 'Defined';
    }
    return 'Pending';
  }

  ecmStatusClass(item: Product): string {
    const status = this.ecmStatus(item);
    if (status === 'Pending') return 'pill-amber';
    return 'pill-green';
  }

  updatedDate(item: Product): string {
    const rawDate = item.history?.[0]?.date;
    if (!rawDate) {
      return '—';
    }
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) {
      return rawDate;
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private itemCategory(
    item: Product,
  ): 'drug-substance' | 'drug-product' | 'raw-material' | 'packaging' | 'other' {
    const value = [item.sku, item.partType, item.category, item.classification, item.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (/packag|pkg-|blister/.test(value)) return 'packaging';
    if (/drug substance|api|^ds-/.test(value)) return 'drug-substance';
    if (/finished good|drug product|^fg-/.test(value)) return 'drug-product';
    if (/raw material|excipient|semi-finished|component|^comp-|^rm-/.test(value)) {
      return 'raw-material';
    }
    return 'other';
  }

  handleItemCreated() {
    this.showCreateModal = false;
    this.activeView = 'items';
    this.router.navigate(['/dashboard'], { queryParams: { tab: 'items' } });
  }

  openChangeCreate() {
    this.router.navigate(['/changes/create']);
  }

  openMyChanges() {
    this.router.navigate(['/changes/manage']);
  }

  browseReleasedChanges() {
    this.router.navigate(['/changes/manage'], { queryParams: { status: 'released' } });
  }

  openRecentItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  setActiveViewFromUrl(url: string) {
    const query = url.split('?')[1] || '';
    const requestedTab = new URLSearchParams(query).get('tab');
    if (
      requestedTab === 'items' ||
      requestedTab === 'changes' ||
      requestedTab === 'regulatory' ||
      requestedTab === 'reports'
    ) {
      this.activeView = requestedTab;
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
