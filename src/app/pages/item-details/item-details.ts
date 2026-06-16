import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalSearch } from '../../components/global-search/global-search';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import {
  AttachmentFile,
  InventoryService,
  Product,
  ProductAttachment,
} from '../../services/inventory.service';
import { RecentItemsService } from '../../services/recent-items.service';
import { ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

type ItemDetailTab = 'Overview' | 'BOM' | 'Documents' | 'Changes' | 'History';
type BomTreeNode = {
  product: Product;
  level: number;
  path: string[];
};

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GlobalSearch, Sidebar, ThemeToggle],
  template: `
    <app-sidebar></app-sidebar>
    <div class="detail-page" [class.light-theme]="themeService.theme() === 'light'">
      <header class="reference-header">
        <button class="reference-brand" type="button" (click)="router.navigate(['/dashboard'])">
          <span>N</span>NexaPLM
        </button>
        <nav class="reference-tabs">
          <button (click)="router.navigate(['/dashboard'])">Workspace</button>
          <button
            class="active"
            (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'items' } })"
          >
            Items
          </button>
          <button (click)="router.navigate(['/changes'])">Changes</button>
          <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">
            Regulatory
          </button>
          <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'reports' } })">
            Reports
          </button>
        </nav>
        <div class="reference-actions">
          <button class="reference-ai">✦ AI Assistant</button>
          <app-theme-toggle></app-theme-toggle>
          <button class="reference-circle" aria-label="Search">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M20 20l-4-4"></path>
            </svg>
          </button>
          <button class="reference-circle reference-notification" aria-label="Notifications">
            <svg viewBox="0 0 24 24">
              <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2M10 21h4"></path>
            </svg>
            <i></i>
          </button>
          <div class="reference-user">
            <button>{{ initials }}</button>
            <nav>
              <strong>{{ userName }}</strong>
              <small>{{ userService.currentRole() }}</small>
              <a href="#" (click)="$event.preventDefault()">My Profile</a>
              <a href="#" (click)="$event.preventDefault()">Password Change</a>
              <a href="#" (click)="logout($event)">Logout</a>
            </nav>
          </div>
        </div>
      </header>

      <aside class="reference-sidebar">
        <span>NPI Process</span>
        <button (click)="router.navigate(['/dashboard'])">⌂ Dashboard</button>
        <button (click)="router.navigate(['/dashboard'])">◇ NPI Tracker</button>
        <button (click)="router.navigate(['/dashboard'])">
          ◷ Pending Actions <b class="red">5</b>
        </button>
        <span>Items</span>
        <button
          class="active"
          (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'items' } })"
        >
          □ All Items
        </button>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'items' } })">
          ＋ Create Item
        </button>
        <button (click)="activeTab = 'BOM'">⌬ Formulations</button>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'items' } })">
          ✓ Released Items
        </button>
        <span>Changes</span>
        <button (click)="router.navigate(['/changes'])">▤ Change Orders <b>2</b></button>
        <button (click)="router.navigate(['/changes/manage'])">⌕ ECO-001 Detail</button>
        <span>Quality</span>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">
          △ CAPA <b>3</b>
        </button>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">
          ○ Deviations
        </button>
        <span>Regulatory</span>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">
          ▥ Submissions
        </button>
        <button (click)="router.navigate(['/dashboard'], { queryParams: { tab: 'regulatory' } })">
          ⌁ Clinical Phases
        </button>
        <div class="recently-accessed detail-recents" aria-labelledby="detail-recents-title">
          <div class="recently-accessed-title" id="detail-recents-title">Recently Accessed</div>

          <button
            *ngFor="let item of recentItemsService.recentItems()"
            class="recent-item"
            type="button"
            (click)="router.navigate(['/items', item.sku])"
          >
            <span class="recent-item-icon">{{ recentItemInitials(item.partType) }}</span>
            <span class="recent-item-copy">
              <strong>{{ item.sku }}</strong>
              <small>{{ item.name }}</small>
              <small>{{ item.partType }} &middot; Rev {{ displayRevision(item.revision) }}</small>
            </span>
            <span class="recent-item-arrow" aria-hidden="true">&rsaquo;</span>
          </button>

          <div *ngIf="recentItemsService.recentItems().length === 0" class="recent-items-empty">
            No recently accessed items
          </div>
        </div>
      </aside>

      <header class="topbar">
        <button class="brand" type="button" (click)="router.navigate(['/dashboard'])">
          NexaPLM
        </button>

        <div class="topbar-center">
          <div class="search-cluster">
            <app-global-search></app-global-search>
          </div>

          <div class="top-actions" aria-label="Quick actions">
            <button type="button" aria-label="Favorites" title="Favorites">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3.8l2.53 5.13 5.66.82-4.1 4 .97 5.65L12 16.74 6.94 19.4l.97-5.65-4.1-4 5.66-.82L12 3.8z"
                ></path>
              </svg>
            </button>
            <button
              class="notification-button"
              type="button"
              aria-label="Notifications"
              title="Notifications"
            >
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

      <main *ngIf="item; else missingItem">
        <button
          class="back-button"
          type="button"
          (click)="router.navigate(['/items'])"
        >
          ← Back to Items
        </button>

        <span class="breadcrumb-item">/ &nbsp; {{ item.sku }}</span>
        <!-- <span class="success-badge breadcrumb-success">✓ Created Successfully</span> -->

        <section class="item-heading">
          <div class="item-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9z"></path>
              <path d="M4.5 7.8L12 12l7.5-4.2"></path>
              <path d="M12 12v9"></path>
            </svg>
          </div>
          <div>
            <div class="title-line">
              <h1>{{ item.sku }}</h1>
              <!-- <span class="revision-text">Rev {{ displayRevision(item.revision) }}</span> -->
            </div>
            <!-- <p>
              {{ getPartDescription() }} · {{ getPartTypeLabel() }} · Lifecycle:
              {{ lifecycleLabel }}
            </p> -->
          </div>
          <div class="reference-heading-actions removed-heading-actions">
            <span>● {{ lifecycleLabel }}</span>
            <button type="button" [routerLink]="['/items', item.sku, 'edit']">⋮ Actions</button>
          </div>
        </section>

        <nav class="detail-tabs" aria-label="Item detail sections">
          <button
            *ngFor="let tab of tabs"
            type="button"
            [class.active]="activeTab === tab"
            (click)="activeTab = tab"
          >
            {{ tab === 'BOM' ? 'BOM' : tab }}
          </button>
        </nav>

        <ng-container [ngSwitch]="activeTab">
          <section class="overview-layout" *ngSwitchCase="'Overview'">
            <div>
              <article class="card details-card" [class.open]="showAdditionalAttributes">
                <button
                  *ngIf="!userService.isReadOnly()"
                  class="edit-button"
                  type="button"
                  [routerLink]="['/items', item.sku, 'edit']"
                >
                  Edit
                </button>
                <h2>Item Details</h2>

                <div class="detail-row">
                  <span class="detail-icon item-number-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9z"></path>
                      <path d="M4.5 7.8L12 12l7.5-4.2"></path>
                      <path d="M12 12v9"></path>
                    </svg>
                  </span>
                  <span>
                    <small>Item Number</small>
                    <strong class="green-text">{{ item.sku }}</strong>
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-icon">D</span>
                  <span>
                    <small>Description</small>
                    <strong>{{ getPartDescription() }}</strong>
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-icon">T</span>
                  <span>
                    <small>Item Type</small>
                    <strong>{{ getPartTypeLabel() }}</strong>
                  </span>
                </div>
                <!-- <div class="detail-row no-border">
                  <span class="detail-icon">L</span>
                  <span>
                    <small>Lifecycle</small>
                    <strong>{{ item.lifecycle }}</strong>
                  </span>
                </div> -->
                <div class="detail-row reference-attribute">
                  <span>
                    <small>Classification</small>
                    <strong>{{ getClassificationLabel() }}</strong>
                  </span>
                </div>
                <div class="detail-row reference-attribute">
                  <span>
                    <small>Dosage Form</small>
                    <strong>Film-Coated Tablet</strong>
                  </span>
                </div>
                <div class="detail-row reference-attribute">
                  <span>
                    <small>Strength</small>
                    <strong>50 mg</strong>
                  </span>
                </div>
                <div class="detail-row reference-attribute">
                  <span>
                    <small>Route of Admin</small>
                    <strong>Oral</strong>
                  </span>
                </div>

                <div class="attribute-toggle">
                  <span></span>
                  <button
                    type="button"
                    [attr.aria-expanded]="showAdditionalAttributes"
                    (click)="showAdditionalAttributes = !showAdditionalAttributes"
                  >
                    {{ showAdditionalAttributes ? '⌃' : '⌄' }}
                  </button>
                  <span></span>
                </div>

                <div class="extra-content" *ngIf="showAdditionalAttributes">
                  <div>
                    <small>Part Classification</small>
                    <strong>{{ getPartTypeLabel() }} | {{ getClassificationLabel() }}</strong>
                  </div>
                  <div>
                    <small>Category</small>
                    <strong>{{ item.category }}</strong>
                  </div>
                  <div>
                    <small>Quantity</small>
                    <strong>{{ item.quantity }}</strong>
                  </div>
                  <div>
                    <small>Status</small>
                    <strong>{{ item.status }}</strong>
                  </div>
                </div>
              </article>

              <article class="card suggestions-card">
                <h2>Suggested Attributes <span>applied on creation</span></h2>
                <div class="pill-list">
                  <span>Category: {{ item.category }}</span>
                  <span>UOM: {{ getUnitOfMeasure() }}</span>
                  <span>Revision: {{ item.revision }}</span>
                  <span>Type: {{ item.type }}</span>
                </div>
              </article>
            </div>

            <aside>
              <article class="card status-card">
                <h2>Status</h2>
                <div>
                  <span>Revision</span><strong class="green-tag">{{ item.revision }}</strong>
                </div>
                <div>
                  <span>Documents</span><strong>{{ item.attachments.length }}</strong>
                </div>
                <div>
                  <span>BOM Status</span
                  ><strong>{{ item.bom.length ? 'Available' : 'No BOM' }}</strong>
                </div>
                <div>
                  <span>CO Status</span
                  ><strong>{{ item.changes.length ? 'Active' : 'None' }}</strong>
                </div>
              </article>

              <article class="card lifecycle-card">
                <h2>Lifecycle</h2>
                <ul>
                  <li
                    *ngFor="let stage of lifecycleStages"
                    [class.active]="stage === item.lifecycle"
                  >
                    <span></span>
                    {{ stage }}
                    <small *ngIf="stage === item.lifecycle">Current</small>
                  </li>
                </ul>
              </article>
            </aside>
          </section>

          <section class="card tab-panel" *ngSwitchCase="'BOM'">
            <div class="panel-heading">
              <div>
                <h2>Bill of Materials</h2>
                <p>Manage components and nested assemblies for {{ item.sku }}.</p>
              </div>
              <div class="panel-actions" *ngIf="!userService.isReadOnly()">
                <button class="primary-button" type="button" (click)="openBomAdd(item.sku)">
                  Add
                </button>
                <button
                  class="danger-button"
                  type="button"
                  [disabled]="!getBomTree().length"
                  (click)="openBomRemove()"
                >
                  Remove
                </button>
              </div>
            </div>

            <div class="action-panel" *ngIf="isBomAddOpen && !userService.isReadOnly()">
              <span
                >Adding under <strong>{{ selectedBomParentSku }}</strong></span
              >
              <select [(ngModel)]="selectedBomChildSku" aria-label="Select item to add to BOM">
                <option value="">Select part</option>
                <option *ngFor="let product of getAvailableBomItems()" [value]="product.sku">
                  {{ product.sku }} - {{ product.name }}
                </option>
              </select>
              <button
                class="primary-button"
                type="button"
                [disabled]="!selectedBomChildSku"
                (click)="addBomItem()"
              >
                Add Item
              </button>
              <button class="soft-button" type="button" (click)="closeBomAdd()">Cancel</button>
            </div>

            <div class="action-panel" *ngIf="isBomRemoveOpen && !userService.isReadOnly()">
              <span>Remove BOM item</span>
              <select [(ngModel)]="selectedBomRemovePath" aria-label="Select BOM item to remove">
                <option value="">Select item</option>
                <option *ngFor="let node of getBomTree()" [value]="node.path.join('>')">
                  {{ node.product.sku }} - {{ node.product.name }}
                </option>
              </select>
              <button
                class="danger-button"
                type="button"
                [disabled]="!selectedBomRemovePath"
                (click)="removeSelectedBomItem()"
              >
                Remove Item
              </button>
              <button class="soft-button" type="button" (click)="closeBomRemove()">Cancel</button>
            </div>

            <div class="data-table">
              <div class="bom-row bom-header">
                <span>Item Number</span>
                <span>Description</span>
                <span>Revision</span>
                <span>Lifecycle</span>
                <span>Level</span>
                <span *ngIf="!userService.isReadOnly()">Actions</span>
              </div>
              <div *ngFor="let node of getBomTree()" class="bom-row" [style.--level]="node.level">
                <button class="item-link" type="button" (click)="navigateToItem(node.product.sku)">
                  {{ node.product.sku }}
                </button>
                <span>{{ getBomDescription(node.product) }}</span>
                <span>{{ node.product.revision }}</span>
                <span>{{ node.product.lifecycle }}</span>
                <span>{{ node.level }}</span>
                <span class="row-actions" *ngIf="!userService.isReadOnly()">
                  <button class="soft-button" type="button" (click)="openBomAdd(node.product.sku)">
                    Add child
                  </button>
                  <button class="danger-button" type="button" (click)="removeBomItem(node)">
                    Remove
                  </button>
                </span>
              </div>
              <p class="empty-message" *ngIf="!getBomTree().length">
                No BOM components attached to this item.
              </p>
            </div>
          </section>

          <section class="card tab-panel" *ngSwitchCase="'Documents'">
            <div class="panel-heading">
              <div>
                <h2>Documents</h2>
                <p>Files and documents linked to {{ item.sku }}.</p>
              </div>
              <div class="panel-actions">
                <button
                  *ngIf="!userService.isReadOnly()"
                  class="primary-button"
                  type="button"
                  (click)="documentUpload.click()"
                >
                  Add Document
                </button>
                <input
                  #documentUpload
                  type="file"
                  multiple
                  hidden
                  (change)="uploadAttachments($event)"
                />
              </div>
            </div>

            <div class="document-list">
              <article *ngFor="let document of getVisibleAttachments(); let i = index">
                <span class="document-icon">D</span>
                <span class="document-copy">
                  <strong>{{ getAttachmentName(document, i) }}</strong>
                  <small
                    >{{ getAttachmentType(document) }} · {{ getAttachmentSize(document, i) }}</small
                  >
                </span>
                <button class="soft-button" type="button" (click)="downloadAttachment(document, i)">
                  Download
                </button>
                <button
                  *ngIf="!userService.isReadOnly()"
                  class="danger-button"
                  type="button"
                  (click)="removeAttachment(document, i)"
                >
                  Remove
                </button>
              </article>
              <p class="empty-message" *ngIf="!getVisibleAttachments().length">
                No documents available.
              </p>
            </div>
          </section>

          <section class="card tab-panel" *ngSwitchCase="'Changes'">
            <div class="panel-heading">
              <div>
                <h2>Changes</h2>
                <p>Change orders associated with {{ item.sku }}.</p>
              </div>
            </div>
            <div class="simple-table">
              <div class="simple-row simple-header">
                <span>Change Number</span>
                <span>Description</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              <div class="simple-row" *ngFor="let change of item.changes">
                <strong>{{ change.id }}</strong>
                <span>{{ change.description }}</span>
                <span>{{ change.status }}</span>
                <span>{{ change.date || '—' }}</span>
              </div>
              <p class="empty-message" *ngIf="!item.changes.length">No changes available.</p>
            </div>
          </section>

          <section class="card tab-panel" *ngSwitchCase="'History'">
            <div class="panel-heading">
              <div>
                <h2>History</h2>
                <p>Recorded activity for {{ item.sku }}.</p>
              </div>
            </div>
            <div class="history-list">
              <article *ngFor="let entry of item.history">
                <span class="history-dot"></span>
                <span>
                  <strong>{{ entry.action }}</strong>
                  <small>{{ entry.user }} · {{ entry.date | date: 'medium' }}</small>
                  <p *ngIf="entry.details">{{ entry.details }}</p>
                </span>
              </article>
              <p class="empty-message" *ngIf="!item.history.length">No history available.</p>
            </div>
          </section>
        </ng-container>
      </main>

      <ng-template #missingItem>
        <main class="missing-item">Item not found.</main>
      </ng-template>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #eeeff4;
      color: #25324b;
    }
    * {
      box-sizing: border-box;
    }
    button,
    input,
    select {
      font: inherit;
    }

    .detail-page {
      min-height: 100vh;
      padding: 22px 28px 36px;
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Arial,
        sans-serif;
    }

    .back-button,
    .edit-button,
    .primary-button,
    .soft-button,
    .danger-button {
      border-radius: 999px;
      padding: 9px 16px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
    }
    .back-button {
      margin-bottom: 18px;
      border: 1px solid #dcebc3;
      background: #f3f8e9;
      color: #5f8919;
    }
    .item-heading {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 14px;
    }
    .item-icon {
      display: grid;
      width: 45px;
      height: 45px;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 12px;
      background: #f3f8e9;
      color: #6a951c;
    }
    .item-icon svg,
    .item-number-icon svg {
      width: 21px;
      height: 21px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .title-line {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    h1 {
      margin: 0;
      color: #25324b;
      font-size: 1.9rem;
      line-height: 1.1;
    }
    .item-heading p {
      margin: 5px 0 0;
      color: #8f96ab;
      font-size: 0.86rem;
    }
    .success-badge {
      padding: 6px 14px;
      border: 1px solid #b7efc8;
      border-radius: 999px;
      background: #dcfce7;
      color: #16a34a;
      font-size: 0.72rem;
    }

    .detail-tabs {
      display: flex;
      gap: 52px;
      width: 74%;
      margin: 18px 0 24px;
      overflow-x: auto;
      border-bottom: 1px solid #dfe2ea;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .detail-tabs::-webkit-scrollbar {
      display: none;
    }
    .detail-tabs button {
      position: relative;
      flex: 0 0 auto;
      height: 52px;
      padding: 0 8px 13px;
      border: 0;
      background: transparent;
      color: #8f96ab;
      font-size: 0.86rem;
      font-weight: 700;
    }
    .detail-tabs button.active {
      color: #6a951c;
    }
    .detail-tabs button.active::after {
      position: absolute;
      right: 2px;
      bottom: -1px;
      left: 2px;
      height: 3px;
      border-radius: 2px;
      background: #86bc25;
      content: '';
    }

    .overview-layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
      gap: 20px;
      align-items: start;
    }
    .card {
      padding: 20px;
      border: 1px solid #e2e5ec;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(31, 50, 88, 0.04);
    }
    .card h2 {
      margin: 0 0 18px;
      color: #2f3a56;
      font-size: 1rem;
    }
    .details-card {
      position: relative;
      padding: 24px 20px 30px;
    }
    .edit-button {
      position: absolute;
      top: 20px;
      right: 22px;
      border: 1px solid #dcebc3;
      background: #f3f8e9;
      color: #5f8919;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid #f0f1f5;
    }
    .detail-row.no-border {
      border-bottom: 0;
    }
    .detail-icon {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      flex: 0 0 auto;
      border-radius: 10px;
      background: #f4f5f8;
      color: #7d8496;
      font-weight: 800;
    }
    .item-number-icon {
      background: #f3f8e9;
      color: #6a951c;
    }
    .detail-row small,
    .extra-content small {
      display: block;
      margin-bottom: 3px;
      color: #9aa1b5;
      font-size: 0.76rem;
    }
    .detail-row strong,
    .extra-content strong {
      color: #25324b;
      font-size: 0.9rem;
    }
    .green-text {
      color: #6a951c !important;
    }
    .attribute-toggle {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 10px;
      margin: 8px 0 0;
    }
    .attribute-toggle span {
      height: 1px;
      background: #ececf3;
    }
    .attribute-toggle button {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border: 1px solid #dcebc3;
      border-radius: 50%;
      background: #f3f8e9;
      color: #5f8919;
    }
    .extra-content {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 12px;
      padding: 14px;
      border: 1px solid #efeff5;
      border-radius: 14px;
      background: #fbfbfe;
    }
    .extra-content > div {
      padding: 12px;
      border: 1px solid #eef0f5;
      border-radius: 12px;
      background: #fff;
    }
    .suggestions-card,
    .lifecycle-card {
      margin-top: 20px;
    }
    .suggestions-card h2 {
      color: #5f8919;
    }
    .suggestions-card h2 span {
      color: #a0a6b7;
      font-size: 0.76rem;
      font-weight: 500;
    }
    .pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pill-list span {
      padding: 8px 12px;
      border: 1px solid #ebeef3;
      border-radius: 999px;
      background: #f4f5f8;
      color: #556079;
      font-size: 0.74rem;
    }
    .status-card > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      color: #677087;
      font-size: 0.84rem;
    }
    .status-card strong {
      padding: 6px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      background: #f3f4f6;
      color: #5f667a;
      font-size: 0.72rem;
    }
    .status-card .green-tag {
      border-color: #dcebc3;
      background: #f3f8e9;
      color: #5f8919;
    }
    .lifecycle-card ul {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .lifecycle-card li {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #c2c7d3;
      font-size: 0.84rem;
    }
    .lifecycle-card li > span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d7d9e0;
    }
    .lifecycle-card li.active {
      color: #5f8919;
      font-weight: 700;
    }
    .lifecycle-card li.active > span {
      background: #86bc25;
    }
    .lifecycle-card li small {
      margin-left: auto;
      padding: 4px 10px;
      border: 1px solid #dcebc3;
      border-radius: 999px;
      background: #f3f8e9;
      color: #5f8919;
    }

    .tab-panel {
      min-height: 430px;
    }
    .panel-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .panel-heading h2 {
      margin-bottom: 4px;
    }
    .panel-heading p {
      margin: 0;
      color: #8f96ab;
      font-size: 0.82rem;
    }
    .panel-actions,
    .row-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .primary-button {
      border: 1px solid #86bc25;
      background: #86bc25;
      color: #24420a;
    }
    .soft-button {
      border: 1px solid #dcebc3;
      background: #f3f8e9;
      color: #5f8919;
    }
    .danger-button {
      border: 1px solid #f3c4c4;
      background: #fff1f1;
      color: #b42318;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .action-panel {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      padding: 14px;
      border: 1px solid #e2e5ec;
      border-radius: 14px;
      background: #f4f6fa;
    }
    .action-panel select {
      min-width: min(100%, 300px);
      padding: 9px 12px;
      border: 1px solid #dbe0e8;
      border-radius: 10px;
      background: #fff;
    }
    .data-table,
    .simple-table {
      overflow-x: auto;
      border: 1px solid #e2e5ec;
      border-radius: 14px;
    }
    .bom-row {
      display: grid;
      grid-template-columns: minmax(150px, 1fr) minmax(200px, 1.3fr) 100px 120px 70px 190px;
      min-width: 880px;
      align-items: center;
      border-bottom: 1px solid #e6e9ef;
      color: #50627c;
      font-size: 0.8rem;
    }
    .bom-row > span,
    .item-link {
      padding: 14px 16px;
    }
    .bom-header {
      background: #f4f6fa;
      color: #8191ae;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .item-link {
      border: 0;
      background: transparent;
      color: #5f8919;
      font-weight: 800;
      text-align: left;
      padding-left: calc(16px + (var(--level) - 1) * 20px);
    }
    .document-list {
      display: grid;
      gap: 10px;
    }
    .document-list article {
      display: grid;
      grid-template-columns: 38px minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid #e6e9ef;
      border-radius: 14px;
      background: #f8f9fb;
    }
    .document-icon {
      display: grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border-radius: 10px;
      background: #f3f8e9;
      color: #5f8919;
      font-weight: 900;
    }
    .document-copy strong,
    .document-copy small {
      display: block;
    }
    .document-copy small {
      color: #8f96ab;
      font-size: 0.72rem;
    }
    .simple-row {
      display: grid;
      grid-template-columns: 150px minmax(220px, 1fr) 120px 140px;
      min-width: 700px;
      border-bottom: 1px solid #e6e9ef;
    }
    .simple-row > * {
      padding: 14px 16px;
      color: #50627c;
      font-size: 0.8rem;
    }
    .simple-header {
      background: #f4f6fa;
      color: #8191ae;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .history-list {
      display: grid;
      gap: 12px;
    }
    .history-list article {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr);
      gap: 12px;
      padding: 14px;
      border: 1px solid #e6e9ef;
      border-radius: 14px;
      background: #f8f9fb;
    }
    .history-dot {
      width: 8px;
      height: 8px;
      margin-top: 6px;
      border-radius: 50%;
      background: #86bc25;
    }
    .history-list strong,
    .history-list small {
      display: block;
    }
    .history-list small,
    .history-list p {
      color: #8f96ab;
      font-size: 0.74rem;
    }
    .history-list p {
      margin: 5px 0 0;
    }
    .empty-message,
    .missing-item {
      padding: 42px 18px;
      color: #98a4ba;
      text-align: center;
    }

    /* Reference-matched dark PLM shell */
    :host {
      --detail-bg: #0d1117;
      --detail-surface: #161b22;
      --detail-surface-2: #21262d;
      --detail-border: #30363d;
      --detail-text: #e6edf3;
      --detail-muted: #8b949e;
      --detail-subtle: #6e7681;
      --detail-blue: #2f81f7;
      --detail-green: #3fb950;
      --detail-amber: #d29922;
      --detail-purple: #bc8cff;
      background: var(--detail-bg);
      color: var(--detail-text);
    }
    .detail-page {
      min-height: 100vh;
      padding: 0;
      background: var(--detail-bg);
      color: var(--detail-text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .detail-page.light-theme {
      --detail-bg: #f5f7fa;
      --detail-surface: #ffffff;
      --detail-surface-2: #eef2f7;
      --detail-border: #d8dee7;
      --detail-text: #172033;
      --detail-muted: #59677c;
      --detail-subtle: #7b8798;
      --detail-blue: #1f6feb;
      --detail-green: #1a7f37;
      --detail-amber: #9a6700;
      --detail-purple: #8250df;
    }
    .reference-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      height: 53px;
      align-items: center;
      gap: 22px;
      padding: 0 22px;
      border-bottom: 1px solid var(--detail-border);
      background: var(--detail-surface);
    }
    .reference-brand {
      display: flex;
      align-items: center;
      gap: 9px;
      border: 0;
      background: transparent;
      color: var(--detail-blue);
      font-size: 16px;
      font-weight: 850;
    }
    .reference-brand span {
      display: grid;
      width: 32px;
      height: 32px;
      place-items: center;
      border-radius: 9px;
      background: linear-gradient(135deg, var(--detail-blue), var(--detail-purple));
      color: #fff;
      font-size: 13px;
    }
    .reference-tabs {
      display: flex;
      align-self: stretch;
      flex: 1;
    }
    .reference-tabs button {
      padding: 0 20px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--detail-muted);
      font-size: 13px;
    }
    .reference-tabs button.active {
      border-bottom-color: var(--detail-blue);
      background: rgba(47, 129, 247, 0.09);
      color: var(--detail-blue);
    }
    .reference-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .reference-ai {
      padding: 6px 13px;
      border: 1px solid rgba(188, 140, 255, 0.35);
      border-radius: 999px;
      background: rgba(188, 140, 255, 0.1);
      color: var(--detail-purple);
      font-size: 12px;
      font-weight: 750;
    }
    .reference-circle {
      position: relative;
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border: 1px solid var(--detail-border);
      border-radius: 50%;
      background: var(--detail-surface-2);
      color: var(--detail-muted);
    }
    .reference-circle svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .reference-notification i {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #f85149;
    }
    .reference-user {
      position: relative;
    }
    .reference-user > button {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--detail-blue), var(--detail-purple));
      color: #fff;
      font-size: 11px;
      font-weight: 800;
    }
    .reference-user nav {
      position: absolute;
      top: calc(100% + 7px);
      right: 0;
      z-index: 120;
      display: none;
      width: 210px;
      padding: 9px;
      border: 1px solid var(--detail-border);
      border-radius: 9px;
      background: var(--detail-surface);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
    }
    .reference-user:hover nav,
    .reference-user:focus-within nav {
      display: flex;
      flex-direction: column;
    }
    .reference-user nav strong,
    .reference-user nav small {
      padding: 2px 8px;
    }
    .reference-user nav small {
      padding-bottom: 9px;
      border-bottom: 1px solid var(--detail-border);
      color: var(--detail-subtle);
    }
    .reference-user nav a {
      padding: 8px;
      color: var(--detail-muted);
      font-size: 12px;
    }
    .reference-sidebar {
      display: none !important;
      position: fixed;
      top: 53px;
      bottom: 0;
      left: 0;
      z-index: 40;
      display: flex;
      width: 263px;
      flex-direction: column;
      overflow-y: auto;
      padding: 23px 12px 270px;
      border-right: 1px solid var(--detail-border);
      background: var(--detail-surface);
    }
    .reference-sidebar > span {
      padding: 11px 8px 5px;
      color: #7f91ad;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .reference-sidebar button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--detail-muted);
      font-size: 13px;
      text-align: left;
    }
    .reference-sidebar button:hover,
    .reference-sidebar button.active {
      background: var(--detail-surface-2);
      color: var(--detail-text);
    }
    .reference-sidebar b {
      margin-left: auto;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--detail-amber);
      color: #fff;
      font-size: 10px;
    }
    .reference-sidebar b.red {
      background: #f85149;
    }
    .detail-recents {
      position: absolute;
      right: 12px;
      bottom: 0;
      left: 12px;
      max-height: 270px;
      overflow-y: auto;
    }
    .recently-accessed {
      display: flex;
      min-height: 190px;
      flex-direction: column;
      gap: 8px;
      margin: 20px 10px 12px;
      padding: 14px 10px;
      border: 1px solid var(--detail-border);
      border-radius: 12px;
      background: color-mix(in srgb, var(--detail-surface-2) 42%, var(--detail-surface));
    }
    .recently-accessed-title {
      padding: 0 4px 6px;
      color: var(--detail-text);
      font-size: 12px;
      font-weight: 750;
    }
    .reference-sidebar .recent-item {
      display: grid;
      grid-template-columns: 30px minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      width: 100%;
      padding: 9px 8px;
      border: 1px solid transparent;
      border-radius: 9px;
      background: transparent;
      color: var(--detail-text);
      text-align: left;
    }
    .reference-sidebar .recent-item:hover {
      border-color: var(--detail-border);
      background: var(--detail-surface-2);
    }
    .recent-item-icon {
      display: grid;
      width: 30px;
      height: 30px;
      place-items: center;
      border-radius: 8px;
      background: color-mix(in srgb, var(--detail-blue) 15%, transparent);
      color: var(--detail-blue);
      font-size: 10px;
      font-weight: 800;
    }
    .recent-item-copy {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 2px;
    }
    .recent-item-copy strong,
    .recent-item-copy small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .recent-item-copy strong {
      color: var(--detail-text);
      font-size: 14px;
    }
    .recent-item-copy small {
      color: var(--detail-muted);
      font-size: 12px;
    }
    .recent-item-arrow {
      color: var(--detail-subtle);
      font-size: 18px;
    }
    .recent-items-empty {
      display: grid;
      min-height: 116px;
      place-items: center;
      padding: 14px;
      border: 1px dashed var(--detail-border);
      border-radius: 10px;
      color: var(--detail-subtle);
      font-size: 11px;
      text-align: center;
    }
    app-sidebar,
    .reference-header,
    .reference-sidebar,
    .topbar,
    .section-separator {
      display: none !important;
    }
    .detail-page > main {
      min-height: calc(100vh - 52px);
      margin-left: 0;
      padding: 31px 34px 45px;
      background: var(--detail-bg);
    }
    .back-button {
      margin: 0 15px 12px 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--detail-muted);
      font-size: 12px;
    }
    .breadcrumb-item {
      margin-right: 14px;
      color: var(--detail-muted);
      font-size: 12px;
    }
    .breadcrumb-success,
    .success-badge {
      padding: 3px 10px;
      border-color: rgba(63, 185, 80, 0.35);
      background: rgba(63, 185, 80, 0.13);
      color: var(--detail-green);
      font-size: 10px;
    }
    .item-heading {
      position: relative;
      justify-content: space-between;
      margin: 3px 0 16px;
    }
    .item-icon {
      display: none;
    }
    .title-line {
      gap: 7px;
    }
    h1 {
      color: var(--detail-text);
      font-size: 20px;
    }
    .revision-text {
      color: var(--detail-muted);
      font-size: 11px;
    }
    .item-heading p {
      margin-top: 5px;
      color: var(--detail-muted);
      font-size: 12px;
    }
    .reference-heading-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }
    .reference-heading-actions span {
      padding: 6px 14px;
      border: 1px solid rgba(210, 153, 34, 0.4);
      border-radius: 999px;
      background: rgba(210, 153, 34, 0.13);
      color: var(--detail-amber);
      font-size: 11px;
      font-weight: 750;
    }
    .reference-heading-actions button {
      padding: 7px 12px;
      border: 1px solid var(--detail-border);
      border-radius: 6px;
      background: var(--detail-surface-2);
      color: var(--detail-text);
      font-size: 11px;
      font-weight: 700;
    }
    .detail-tabs {
      width: 100%;
      gap: 28px;
      margin: 0 0 22px;
      border-bottom-color: var(--detail-border);
    }
    .detail-tabs button {
      height: 48px;
      padding: 0 19px 10px;
      color: var(--detail-muted);
      font-size: 12px;
    }
    .detail-tabs button.active {
      color: var(--detail-blue);
    }
    .detail-tabs button.active::after {
      height: 2px;
      background: var(--detail-blue);
    }
    .overview-layout {
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
      gap: 17px;
    }
    .card {
      padding: 20px 22px;
      border-color: var(--detail-border);
      border-radius: 12px;
      background: var(--detail-surface);
      color: var(--detail-text);
      box-shadow: none;
    }
    .card h2 {
      color: var(--detail-text);
      font-size: 12px;
    }
    .details-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 13px 34px;
      padding: 22px;
    }
    .details-card h2 {
      grid-column: 1 / -1;
      margin-bottom: 2px;
    }
    .attribute-toggle,
    .extra-content {
      display: none !important;
    }
    .removed-heading-actions {
      display: none !important;
    }
    .edit-button {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: 1px solid rgba(139, 92, 246, 0.22);
      background: rgba(139, 92, 246, 0.08);
      color: #8b5cf6;
      font-size: 12px;
      font-weight: 600;
    }
    .detail-row {
      min-width: 0;
      padding: 0;
      border: 0;
    }
    .detail-icon {
      display: none;
    }
    .detail-row small,
    .reference-attribute small {
      color: var(--detail-subtle);
      font-size: 10px;
    }
    .detail-row strong,
    .reference-attribute strong {
      color: var(--detail-text);
      font-size: 12px;
      font-weight: 500;
    }
    .green-text {
      color: var(--detail-blue) !important;
      font-weight: 700 !important;
    }
    .suggestions-card {
      margin-top: 17px;
      border-color: rgba(188, 140, 255, 0.28);
      background: rgba(188, 140, 255, 0.055);
    }
    .suggestions-card h2 {
      margin-bottom: 12px;
      color: var(--detail-purple);
      font-size: 10px;
    }
    .suggestions-card h2::before {
      content: '✦ ';
    }
    .suggestions-card h2 span {
      color: var(--detail-subtle);
      font-size: 10px;
    }
    .pill-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 30px;
    }
    .pill-list span {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--detail-text);
      font-size: 11px;
    }
    .suggestions-card::after {
      content: 'Accept All     Edit';
      display: block;
      margin-top: 13px;
      color: var(--detail-text);
      font-size: 11px;
      font-weight: 700;
      white-space: pre;
    }
    .status-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 30px;
      border-radius: 12px 12px 0 0;
      border-bottom: 0;
    }
    .status-card h2 {
      grid-column: 1 / -1;
      margin-bottom: 2px;
    }
    .status-card > div {
      align-items: flex-start;
      flex-direction: column;
      gap: 3px;
      margin: 0;
      color: var(--detail-subtle);
      font-size: 10px;
    }
    .status-card strong {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--detail-text);
      font-size: 12px;
    }
    .status-card .green-tag {
      padding: 3px 9px;
      border: 1px solid rgba(63, 185, 80, 0.35);
      border-radius: 999px;
      background: rgba(63, 185, 80, 0.13);
      color: var(--detail-green);
    }
    .lifecycle-card {
      margin-top: 0;
      border-top: 0;
      border-radius: 0 0 12px 12px;
    }
    .lifecycle-card li {
      color: var(--detail-subtle);
      font-size: 12px;
    }
    .lifecycle-card li > span {
      width: 10px;
      height: 10px;
      background: var(--detail-border);
    }
    .lifecycle-card li.active {
      color: var(--detail-blue);
    }
    .lifecycle-card li.active > span {
      background: var(--detail-blue);
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.22);
    }
    .lifecycle-card li small {
      border-color: rgba(47, 129, 247, 0.4);
      background: rgba(47, 129, 247, 0.13);
      color: var(--detail-blue);
    }
    .tab-panel,
    .action-panel,
    .document-list article,
    .history-list article {
      border-color: var(--detail-border);
      background: var(--detail-surface);
      color: var(--detail-text);
    }
    .panel-heading p,
    .document-copy small,
    .history-list small,
    .history-list p {
      color: var(--detail-muted);
    }
    .data-table,
    .simple-table {
      border-color: var(--detail-border);
    }
    .bom-row,
    .simple-row {
      border-bottom-color: var(--detail-border);
      color: var(--detail-muted);
    }
    .bom-header,
    .simple-header {
      background: var(--detail-surface-2);
      color: var(--detail-muted);
    }
    .item-link {
      color: var(--detail-blue);
    }
    .primary-button {
      border-color: var(--detail-blue);
      background: var(--detail-blue);
      color: #fff;
    }
    .soft-button {
      border-color: var(--detail-border);
      background: var(--detail-surface-2);
      color: var(--detail-text);
    }
    .reference-brand {
      font-size: 18px;
    }
    .reference-tabs button,
    .reference-sidebar button {
      font-size: 15px;
    }
    .reference-sidebar > span {
      font-size: 11px;
    }
    .reference-ai,
    .reference-user nav a {
      font-size: 14px;
    }
    .back-button,
    .breadcrumb-item {
      font-size: 14px;
    }
    .breadcrumb-success,
    .success-badge {
      font-size: 12px;
    }
    h1 {
      font-size: 25px;
    }
    .revision-text {
      font-size: 14px;
    }
    .item-heading p {
      font-size: 15px;
    }
    .reference-heading-actions span,
    .reference-heading-actions button {
      font-size: 14px;
    }
    .detail-tabs button {
      font-size: 15px;
    }
    .card h2 {
      font-size: 15px;
    }
    .detail-row small,
    .reference-attribute small,
    .status-card > div {
      font-size: 12px;
    }
    .detail-row strong,
    .reference-attribute strong,
    .status-card strong,
    .lifecycle-card li {
      font-size: 15px;
    }
    .suggestions-card h2,
    .suggestions-card h2 span {
      font-size: 12px;
    }
    .pill-list span,
    .suggestions-card::after {
      font-size: 14px;
    }
    .panel-heading p,
    .bom-row,
    .simple-row > *,
    .document-copy small,
    .history-list small,
    .history-list p {
      font-size: 13px;
    }

    @media (max-width: 1000px) {
      .reference-sidebar {
        display: none !important;
      }
      .detail-page > main {
        margin-left: 0;
      }
      .reference-tabs {
        display: none;
      }
      .detail-tabs {
        width: 100%;
      }
      .overview-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .reference-sidebar {
        display: none !important;
      }
      .reference-actions .reference-ai {
        display: none;
      }
      .detail-page > main {
        margin-left: 0;
        padding: 22px 16px 28px;
      }
      .detail-tabs {
        gap: 24px;
      }
      .details-card,
      .pill-list,
      .status-card {
        grid-template-columns: 1fr;
      }
      .extra-content {
        grid-template-columns: 1fr;
      }
      .panel-heading {
        flex-direction: column;
      }
      .document-list article {
        grid-template-columns: 38px minmax(0, 1fr);
      }
      .document-list article button {
        grid-column: 2;
      }
    }
  `,
})
export class ItemDetails implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly inventoryService = inject(InventoryService);
  readonly recentItemsService = inject(RecentItemsService);
  readonly themeService = inject(ThemeService);
  readonly userService = inject(UserService);

  readonly tabs: ItemDetailTab[] = ['Overview', 'BOM', 'Documents', 'Changes', 'History'];
  readonly lifecycleStages = ['Preliminary', 'Design', 'Prototype', 'Production', 'Obsolete'];

  item: Product | null = null;
  activeTab: ItemDetailTab = 'Overview';
  showAdditionalAttributes = false;
  isBomAddOpen = false;
  isBomRemoveOpen = false;
  selectedBomParentSku = '';
  selectedBomChildSku = '';
  selectedBomRemovePath = '';

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.loadItem(params.get('sku'));
    });
  }

  private loadItem(sku: string | null) {
    if (!sku) {
      this.router.navigate(['/items']);
      return;
    }

    this.item = this.inventoryService.getData().find((product) => product.sku === sku) || null;
    if (!this.item) {
      this.router.navigate(['/items']);
      return;
    }

    this.recentItemsService.track(this.item);
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

  get lifecycleLabel(): string {
    return this.item?.lifecycle === 'Design'
      ? 'Preliminary'
      : this.item?.lifecycle || 'Preliminary';
  }

  displayRevision(revision: string): string {
    return revision.split('.')[0] || revision;
  }

  recentItemInitials(partType: string): string {
    return partType
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getPartTypeLabel(): string {
    return this.item?.partType || this.item?.part || this.item?.type || 'Part';
  }

  getPartDescription(): string {
    return this.item?.partDescription || this.item?.name || 'No description available';
  }

  getClassificationLabel(): string {
    return this.item?.classification || this.item?.category || 'Unclassified';
  }

  getUnitOfMeasure(): string {
    return this.item?.type === 'Document' ? 'File' : 'Each';
  }

  getBomTree(): BomTreeNode[] {
    if (!this.item) return [];
    return this.buildBomTree(this.item.sku, 1, [this.item.sku]);
  }

  openBomAdd(parentSku: string) {
    if (this.userService.isReadOnly()) return;
    this.selectedBomParentSku = parentSku;
    this.selectedBomChildSku = '';
    this.isBomAddOpen = true;
    this.closeBomRemove();
  }

  closeBomAdd() {
    this.isBomAddOpen = false;
    this.selectedBomParentSku = '';
    this.selectedBomChildSku = '';
  }

  openBomRemove() {
    if (this.userService.isReadOnly()) return;
    this.selectedBomRemovePath = '';
    this.isBomRemoveOpen = true;
    this.closeBomAdd();
  }

  closeBomRemove() {
    this.isBomRemoveOpen = false;
    this.selectedBomRemovePath = '';
  }

  getAvailableBomItems(): Product[] {
    if (!this.item || !this.selectedBomParentSku) return [];
    const parent = this.inventoryService
      .getData()
      .find((product) => product.sku === this.selectedBomParentSku);
    const existingChildren = new Set(parent?.bom || []);

    return this.inventoryService
      .getData()
      .filter(
        (product) =>
          product.sku !== this.selectedBomParentSku &&
          !existingChildren.has(product.sku) &&
          !this.isAncestorOrSelf(product.sku, this.selectedBomParentSku),
      );
  }

  addBomItem() {
    if (!this.selectedBomParentSku || !this.selectedBomChildSku || this.userService.isReadOnly())
      return;
    this.inventoryService.attachBomComponent(this.selectedBomParentSku, this.selectedBomChildSku);
    this.refreshCurrentItem();
    this.closeBomAdd();
  }

  removeSelectedBomItem() {
    const path = this.selectedBomRemovePath.split('>').filter(Boolean);
    if (path.length < 2) return;
    this.removeBomLink(path[path.length - 2], path[path.length - 1]);
    this.closeBomRemove();
  }

  removeBomItem(node: BomTreeNode) {
    if (node.path.length < 2 || this.userService.isReadOnly()) return;
    this.removeBomLink(node.path[node.path.length - 2], node.product.sku);
  }

  getBomDescription(product: Product): string {
    return product.partDescription || product.name;
  }

  navigateToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  getVisibleAttachments(): ProductAttachment[] {
    return this.item?.attachments || [];
  }

  uploadAttachments(event: Event) {
    if (!this.item || this.userService.isReadOnly()) return;
    const input = event.target as HTMLInputElement;

    Array.from(input.files || []).forEach((file) => {
      if (!this.item) return;
      const attachment: AttachmentFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        modifiedOn: new Date().toISOString(),
        modifiedBy: this.userName,
      };

      this.inventoryService.addAttachment(this.item.sku, attachment);
      this.refreshCurrentItem();

      const reader = new FileReader();
      reader.onload = () => {
        if (!this.item) return;
        this.inventoryService.updateAttachmentData(
          this.item.sku,
          attachment.id,
          String(reader.result || ''),
        );
        this.refreshCurrentItem();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeAttachment(attachment: ProductAttachment, index: number) {
    if (!this.item || this.userService.isReadOnly()) return;
    this.inventoryService.removeAttachment(this.item.sku, this.getAttachmentId(attachment, index));
    this.refreshCurrentItem();
  }

  downloadAttachment(attachment: ProductAttachment, index: number) {
    const link = document.createElement('a');
    link.download = this.getAttachmentName(attachment, index);
    link.href =
      typeof attachment !== 'string' && attachment.dataUrl
        ? attachment.dataUrl
        : URL.createObjectURL(new Blob([''], { type: this.getAttachmentType(attachment) }));
    link.click();

    if (typeof attachment === 'string' || !attachment.dataUrl) {
      URL.revokeObjectURL(link.href);
    }
  }

  getAttachmentId(attachment: ProductAttachment, index: number): string {
    return typeof attachment === 'string' ? `${attachment}-${index}` : attachment.id;
  }

  getAttachmentName(attachment: ProductAttachment, index: number): string {
    if (typeof attachment !== 'string') return attachment.name;
    return attachment || `document-${index + 1}`;
  }

  getAttachmentType(attachment: ProductAttachment): string {
    if (typeof attachment !== 'string') return attachment.type || 'Document';
    const extension = attachment.split('.').pop()?.toUpperCase();
    return extension ? `${extension} Document` : 'Document';
  }

  getAttachmentSize(attachment: ProductAttachment, index: number): string {
    if (typeof attachment === 'string') return index === 0 ? '2.4 MB' : '348 KB';
    if (attachment.size < 1024) return `${attachment.size} B`;
    if (attachment.size < 1024 * 1024) return `${(attachment.size / 1024).toFixed(1)} KB`;
    return `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`;
  }

  logout(event: Event) {
    event.preventDefault();
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  private buildBomTree(parentSku: string, level: number, path: string[]): BomTreeNode[] {
    const parent = this.inventoryService.getData().find((product) => product.sku === parentSku);
    if (!parent?.bom?.length) return [];

    return parent.bom.flatMap((childSku) => {
      if (path.includes(childSku)) return [];
      const child = this.inventoryService.getData().find((product) => product.sku === childSku);
      if (!child) return [];
      const childPath = [...path, childSku];
      return [
        { product: child, level, path: childPath },
        ...this.buildBomTree(childSku, level + 1, childPath),
      ];
    });
  }

  private removeBomLink(parentSku: string, childSku: string) {
    this.inventoryService.detachBomComponent(parentSku, childSku);
    this.refreshCurrentItem();
  }

  private refreshCurrentItem() {
    if (!this.item) return;
    this.item =
      this.inventoryService.getData().find((product) => product.sku === this.item?.sku) ||
      this.item;
  }

  private isAncestorOrSelf(candidateSku: string, parentSku: string): boolean {
    if (candidateSku === parentSku) return true;
    const candidate = this.inventoryService
      .getData()
      .find((product) => product.sku === candidateSku);
    if (!candidate?.bom?.length) return false;
    if (candidate.bom.includes(parentSku)) return true;
    return candidate.bom.some((childSku) => this.isAncestorOrSelf(childSku, parentSku));
  }
}
