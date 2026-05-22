import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventoryService, Product } from '../../services/inventory.service';

interface ChangeRequestDetails {
  coNumber: string;
  changeType: string;
  priority: string;
  description: string;
  createdDate?: string;
  status?: string;
  requestedBy?: string;
  affectedItemSkus?: string[];
}

type ReviewTab = 'General Information' | 'Affected Objects' | 'Workflow';

@Component({
  selector: 'app-changes-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="review-container flex-col gap-8">
      <div class="page-header flex-col gap-2">
        <div class="header-top flex items-center justify-between gap-4">
          <div>
            <h1 class="page-title">Change Request Review</h1>
        
          </div>
          <button class="btn btn-secondary" type="button" (click)="router.navigate(['/changes'])">
            ← Back to Changes
          </button>
        </div>

        <nav class="tabs" aria-label="Change order sections">
          <button
            class="tab-btn"
            *ngFor="let tab of tabs"
            type="button"
            [class.active]="activeTab === tab"
            (click)="selectTab(tab)"
          >{{ tab }}</button>
        </nav>
      </div>

      <div class="card review-panel" style="margin-top: 1rem">
        <ng-container *ngIf="changeDetails; else noData">
          <section *ngIf="activeTab === 'General Information'" class="tab-panel">
            <h2 class="section-title">General Information</h2>
            <div class="details-list">
              <div class="detail-row">
                <span class="label">Number:</span>
                <strong>{{ changeDetails.coNumber }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <strong>{{ changeDetails.changeType }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Description:</span>
                <strong>{{ changeDetails.description }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Priority:</span>
                <strong>{{ changeDetails.priority }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <strong>Open</strong>
              </div>
              <div class="detail-row">
                <span class="label">Requested By:</span>
                <strong>Admin</strong>
              </div>
              <div class="detail-row">
                <span class="label">Assigned To:</span>
                <strong>Admin</strong>
              </div>
              <div class="detail-row">
                <span class="label">Created By:</span>
                <strong>Admin</strong>
              </div>
              <div class="detail-row">
                <span class="label">Approval Date:</span>
                <strong>{{ changeDetails.createdDate }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Context Segment:</span>
                <strong>CO_DESIGN_CHANGE</strong>
              </div>
            </div>
          </section>

          <section *ngIf="activeTab === 'Affected Objects'" class="tab-panel">
            <div class="affected-header">
              <h2 class="section-title">Affected Objects</h2>
              <div class="affected-actions">
                <button class="btn btn-primary" type="button" (click)="toggleAddSearch()">Add</button>
                <button class="btn btn-secondary" type="button" [disabled]="!selectedAffectedSku" (click)="removeAffectedItem()">Remove</button>
              </div>
            </div>

            <div class="search-panel" *ngIf="showAddSearch">
              <label class="search-label" for="affectedItemSearch">Search item</label>
              <input
                id="affectedItemSearch"
                class="search-input"
                type="search"
                [(ngModel)]="itemSearchQuery"
                placeholder="Search by item number or common name"
              />
              <div class="search-results" *ngIf="filteredInventoryItems().length; else noSearchResults">
                <div class="search-result-row" *ngFor="let item of filteredInventoryItems()">
                  <div>
                    <strong class="font-mono">{{ item.sku }}</strong>
                    <span>{{ item.name }}</span>
                  </div>
                  <button
                    class="btn btn-secondary btn-sm"
                    type="button"
                    [disabled]="isAffectedItem(item.sku)"
                    (click)="addAffectedItem(item)"
                  >
                    {{ isAffectedItem(item.sku) ? 'Added' : 'Add' }}
                  </button>
                </div>
              </div>
              <ng-template #noSearchResults>
                <div class="empty-search text-muted">No matching items found.</div>
              </ng-template>
            </div>

            <div class="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Line No.</th>
                    <th>Item Number</th>
                    <th>Class</th>
                    <th>Description</th>
                    <th>Old Rev</th>
                    <th>New Rev</th>
                    <th>Old Lifecycle</th>
                    <th>New Lifecycle</th>
                    <th>Effective Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of affectedItems(); let index = index">
                    <td>
                      <input
                        type="radio"
                        name="affectedItem"
                        [value]="item.sku"
                        [(ngModel)]="selectedAffectedSku"
                      />
                    </td>
                    <td>{{ index + 1 }}</td>
                    <td>
                      <a class="item-link font-mono" [routerLink]="['/inventory', item.sku]">{{ item.sku }}</a>
                    </td>
                    <td>{{ item.classification || item.partType || item.part || item.type }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.revision }}</td>
                    <td>{{ nextRevision(item.revision) }}</td>
                    <td>{{ item.lifecycle }}</td>
                    <td>{{ item.lifecycle }}</td>
                    <td>-</td>
                  </tr>
                  <tr *ngIf="affectedItems().length === 0">
                    <td colspan="10" class="empty-table-cell">No affected items added.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section *ngIf="activeTab === 'Workflow'" class="tab-panel">
            <div class="workflow-stage-strip" aria-label="Workflow stages">
              <div class="workflow-stage completed">
                <span class="stage-status"></span>
                <div>
                  <strong>1 Open</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage completed">
                <span class="stage-status"></span>
                <div>
                  <strong>2 Concept &amp; Definition</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage completed">
                <span class="stage-status"></span>
                <div>
                  <strong>3 Engineering Development</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage completed">
                <span class="stage-status"></span>
                <div>
                  <strong>4 Validation &amp; Qualification</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage active">
                <span class="stage-status"></span>
                <div>
                  <strong>5 Approval</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage completed">
                <span class="stage-status"></span>
                <div>
                  <strong>6 Scheduled</strong>
                  <span>Completed</span>
                </div>
              </div>
              <div class="workflow-stage final">
                <span class="stage-status"></span>
                <div>
                  <strong>7 Production</strong>
                  <span>Completed</span>
                </div>
              </div>
            </div>

            <div class="workflow-board">
              <div class="workflow-summary">
                <h2 class="section-title">Workflow Summary</h2>
                <div class="summary-list">
                  <div class="summary-row">
                    <span class="summary-caret">›</span>
                    <strong>Status Changed to Production</strong>
                    <span>Changed On {{ changeDetails.createdDate }} 5:55 AM CST</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-caret">›</span>
                    <strong>Status Changed to Scheduled</strong>
                    <span>Changed On {{ changeDetails.createdDate }} 5:55 AM CST</span>
                  </div>
                  <div class="summary-row selected">
                    <span class="summary-caret">›</span>
                    <div>
                      <strong>Status Changed to Approval</strong>
                      <div class="assignee-row">
                        <span class="person-dot"></span>
                        <span>Admin_Product</span>
                      </div>
                    </div>
                    <span>Changed On {{ changeDetails.createdDate }} 5:54 AM CST</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-caret">›</span>
                    <strong>Status Changed to Validation &amp; Qualification</strong>
                    <span>Changed On {{ changeDetails.createdDate }} 5:49 AM CST</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-caret">›</span>
                    <strong>Status Changed to Engineering Development</strong>
                    <span>Changed On {{ changeDetails.createdDate }} 5:49 AM CST</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-caret">›</span>
                    <strong>Status Changed to Concept &amp; Definition</strong>
                    <span>Changed On {{ changeDetails.createdDate }} 5:48 AM CST</span>
                  </div>
                </div>
              </div>

              <div class="approver-panel">
                <div class="approver-header">
                  <h2 class="section-title">Approvers: Approval</h2>
                  <div class="approver-actions">
                    <button type="button">Action</button>
                    <button type="button">+</button>
                    <button type="button">x</button>
                  </div>
                </div>

                <div class="table-shell workflow-table-shell">
                  <table class="workflow-table">
                    <thead>
                      <tr>
                        <th>Assigned To</th>
                        <th>Role</th>
                        <th>Activity Type</th>
                        <th>Response Required From</th>
                        <th>Response</th>
                        <th>Rejection Reason</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="assignee-row">
                            <span class="person-dot"></span>
                            <span>Admin_Product</span>
                          </div>
                        </td>
                        <td>-</td>
                        <td>Approval</td>
                        <td>-</td>
                        <td><span class="approved-dot"></span>Approved On 4</td>
                        <td>-</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

        </ng-container>

        <ng-template #noData>
          <div class="empty-state text-center p-8">
            <div class="empty-icon">📄</div>
            <h3 class="mt-4">No change request available</h3>
            <p class="text-muted mt-2">Submit a new change request from the Changes page to see the overview and workflow tabs.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: `
    .review-container { max-width: 1100px; margin: 0 auto; width: 100%; }
    .page-header { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; }
    .header-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .page-title { margin: 0; font-size: 1.9rem; color: var(--text-primary); font-weight: 700; }
    .text-muted { color: var(--text-muted); font-size: 0.95rem; }
    .tabs { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .tab-btn { padding: 0.85rem 1.25rem; border-radius: 999px; border: 1px solid #94a3b8; background: var(--bg-app); color: var(--text-secondary); cursor: pointer; font-weight: 600; transition: all var(--transition-fast); }
    .tab-btn.active { background: var(--accent-primary); color: #fff; border-color: transparent; }
    .review-panel { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); }
    .tab-panel { padding: 1.5rem; min-height: 360px; }
    .section-title { font-size: 1.25rem; margin-bottom: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .affected-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    .affected-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .search-panel { display: grid; gap: 0.75rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: var(--bg-app); }
    .search-input { width: 100%; padding: 0.8rem 0.9rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-surface); color: var(--text-primary); outline: none; }
    .search-input:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(134, 188, 37, 0.12); }
    .search-results { display: grid; gap: 0.5rem; max-height: 220px; overflow: auto; }
    .search-result-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.75rem; border: 1px solid var(--border-color-light); border-radius: var(--border-radius-sm); background: var(--bg-surface); }
    .empty-search { padding: 0.75rem; }
    .details-list { display: grid; gap: 0.8rem; max-width: 720px; }
    .detail-row { display: grid; grid-template-columns: 220px 1fr; align-items: start; gap: 2.5rem; color: var(--text-primary); }
    .label { display: block; font-size: 0.95rem; color: var(--text-secondary); font-weight: 700; }
    .detail-row strong { font-size: 0.96rem; color: var(--text-primary); font-weight: 700; }
    .table-shell { overflow-x: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); }
    table { width: 100%; border-collapse: collapse; min-width: 920px; }
    th { background: var(--bg-app); color: var(--text-primary); font-weight: 700; text-align: left; border-right: 1px solid var(--border-color); padding: 0.7rem 0.9rem; white-space: nowrap; }
    td { padding: 0.85rem 0.9rem; color: var(--text-secondary); border-right: 1px solid var(--border-color-light); white-space: nowrap; }
    th:last-child, td:last-child { border-right: 0; }
    tbody tr { background: var(--bg-surface); }
    .item-link { color: var(--accent-primary-hover); font-weight: 700; }
    .empty-table-cell { text-align: center; color: var(--text-muted); padding: 2rem; }
    .empty-tab-panel { border: 1px dashed var(--border-color); border-radius: var(--border-radius-md); background: var(--bg-app); padding: 1rem; color: var(--text-secondary); }
    .history-entry { display: grid; gap: 0.25rem; border-left: 3px solid var(--accent-primary); padding-left: 1rem; color: var(--text-secondary); }
    .workflow-stage-strip { display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); gap: 0.75rem; overflow-x: auto; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
    .workflow-stage { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 0.65rem; align-items: start; min-height: 76px; padding: 0.9rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-app); color: var(--text-secondary); }
    .workflow-stage::after { content: '›'; position: absolute; right: -0.55rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.5rem; z-index: 1; }
    .workflow-stage:last-child::after { content: ''; }
    .workflow-stage strong { display: block; font-size: 0.78rem; line-height: 1.25; color: var(--text-primary); }
    .workflow-stage span:not(.stage-status) { display: block; margin-top: 0.15rem; font-size: 0.75rem; color: var(--text-secondary); }
    .stage-status { width: 14px; height: 14px; border-radius: 50%; background: var(--accent-primary); margin-top: 0.1rem; box-shadow: 0 0 0 3px var(--accent-primary-subtle); }
    .workflow-stage.active { border-color: var(--accent-primary); background: var(--accent-primary-subtle); box-shadow: 0 0 0 1px var(--accent-primary); }
    .workflow-stage.final { background: rgba(134, 188, 37, 0.18); border-color: rgba(134, 188, 37, 0.35); }
    .workflow-board { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1rem; padding-top: 1rem; }
    .workflow-summary, .approver-panel { min-height: 360px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: var(--bg-surface); overflow: hidden; }
    .workflow-summary .section-title, .approver-panel .section-title { margin: 0; padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 1rem; }
    .summary-list { display: grid; }
    .summary-row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.75rem; align-items: start; min-height: 58px; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color-light); color: var(--text-secondary); font-size: 0.86rem; }
    .summary-row strong { color: var(--text-secondary); font-weight: 600; }
    .summary-row > span:last-child { white-space: nowrap; color: var(--text-secondary); font-size: 0.82rem; }
    .summary-row.selected { min-height: 96px; background: var(--accent-primary-subtle); border-left: 3px solid var(--accent-primary); }
    .summary-row.selected strong { color: var(--text-primary); }
    .summary-caret { color: var(--text-muted); font-size: 1.4rem; line-height: 1; }
    .assignee-row { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--accent-primary-hover); font-weight: 600; }
    .person-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--bg-app); border: 1px solid var(--border-color); display: inline-block; position: relative; }
    .person-dot::before { content: ''; position: absolute; top: 3px; left: 6px; width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); }
    .person-dot::after { content: ''; position: absolute; left: 4px; bottom: 3px; width: 8px; height: 5px; border-radius: 8px 8px 2px 2px; background: var(--text-muted); }
    .approver-header { border-bottom: 1px solid var(--border-color); }
    .approver-actions { display: flex; align-items: center; gap: 0.35rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--border-color-light); }
    .approver-actions button { border: 0; background: transparent; color: var(--text-secondary); font-weight: 600; padding: 0.2rem 0.4rem; }
    .workflow-table-shell { border: 0; border-radius: 0; }
    .workflow-table { min-width: 760px; }
    .approved-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; margin-right: 0.4rem; vertical-align: -2px; background: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-subtle); }
    .workflow-step-list { display: grid; gap: 1rem; }
    .workflow-step { display: grid; grid-template-columns: auto 1fr; gap: 1rem; padding: 1.25rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--bg-app); }
    .workflow-step.active { border-color: var(--accent-primary); background: rgba(134, 188, 37, 0.08); }
    .step-marker { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-surface); border: 1px solid var(--border-color); font-weight: 700; color: var(--text-primary); }
    .empty-state { background: var(--bg-app); border: 1px dashed var(--border-color); border-radius: var(--border-radius-md); }
    .empty-icon { font-size: 2.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .card { box-shadow: var(--shadow-sm); }
    @media (max-width: 760px) {
      .header-top { align-items: flex-start; flex-direction: column; }
      .tabs { display: flex; width: 100%; }
      .tab-btn { min-width: 135px; font-size: 0.88rem; }
      .detail-row { grid-template-columns: 1fr; gap: 0.15rem; }
      .tab-panel { padding: 1.25rem 1rem; }
      .affected-header { flex-direction: column; }
      .affected-actions { width: 100%; justify-content: flex-start; }
      .workflow-stage-strip { grid-template-columns: repeat(7, minmax(180px, 1fr)); }
      .workflow-board { grid-template-columns: 1fr; }
      .summary-row { grid-template-columns: auto 1fr; }
      .summary-row > span:last-child { grid-column: 2; white-space: normal; }
    }
  `
})
export class ChangesReview {
  router = inject(Router);
  inventoryService = inject(InventoryService);
  private changeStorageKey = 'deloitte_plm_change_requests_v1';
  tabs: ReviewTab[] = ['General Information', 'Affected Objects', 'Workflow'];
  activeTab: ReviewTab = 'General Information';
  changeDetails: ChangeRequestDetails | null = null;
  showAddSearch = false;
  itemSearchQuery = '';
  selectedAffectedSku = '';

  constructor() {
    const currentNav = this.router.getCurrentNavigation();
    const navigationState = currentNav?.extras?.state as { changeRequest?: Partial<ChangeRequestDetails> } | undefined;
    const routeState = navigationState?.changeRequest || (window.history.state?.changeRequest as Partial<ChangeRequestDetails> | undefined) || null;

    if (routeState) {
      this.changeDetails = {
        ...routeState,
        affectedItemSkus: routeState.affectedItemSkus ?? this.getStoredAffectedItemSkus(routeState.coNumber || ''),
        createdDate: routeState.createdDate ?? this.formatCurrentDate()
      } as ChangeRequestDetails;
    }
  }

  formatCurrentDate() {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  selectTab(tab: ReviewTab) {
    this.activeTab = tab;
  }

  toggleAddSearch() {
    this.showAddSearch = !this.showAddSearch;
    if (this.showAddSearch) {
      this.itemSearchQuery = '';
    }
  }

  filteredInventoryItems(): Product[] {
    const query = this.itemSearchQuery.trim().toLowerCase();
    const items = this.inventoryService.getData();

    if (!query) {
      return items.slice(0, 8);
    }

    return items
      .filter(item =>
        item.sku.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }

  affectedItems(): Product[] {
    const affectedSkus = this.changeDetails?.affectedItemSkus || [];
    return affectedSkus
      .map(sku => this.inventoryService.getData().find(item => item.sku === sku))
      .filter(Boolean) as Product[];
  }

  isAffectedItem(sku: string): boolean {
    return (this.changeDetails?.affectedItemSkus || []).includes(sku);
  }

  addAffectedItem(item: Product) {
    if (!this.changeDetails || this.isAffectedItem(item.sku)) {
      return;
    }

    this.changeDetails = {
      ...this.changeDetails,
      affectedItemSkus: [...(this.changeDetails.affectedItemSkus || []), item.sku]
    };
    this.selectedAffectedSku = item.sku;
    this.showAddSearch = false;
    this.itemSearchQuery = '';
    this.persistAffectedItems();
  }

  removeAffectedItem() {
    if (!this.changeDetails || !this.selectedAffectedSku) {
      return;
    }

    this.changeDetails = {
      ...this.changeDetails,
      affectedItemSkus: (this.changeDetails.affectedItemSkus || []).filter(sku => sku !== this.selectedAffectedSku)
    };
    this.selectedAffectedSku = '';
    this.persistAffectedItems();
  }

  nextRevision(revision: string) {
    const numericRevision = Number(revision);
    if (Number.isFinite(numericRevision)) {
      return String(numericRevision + 1);
    }

    return revision || '-';
  }

  private getStoredAffectedItemSkus(coNumber: string): string[] {
    const storedChange = this.getStoredChanges().find(change => change.coNumber === coNumber);
    return storedChange?.affectedItemSkus || [];
  }

  private persistAffectedItems() {
    if (!this.changeDetails) {
      return;
    }

    const storedChanges = this.getStoredChanges();
    const updatedChanges = storedChanges.map(change => {
      if (change.coNumber === this.changeDetails?.coNumber) {
        return {
          ...change,
          affectedItemSkus: this.changeDetails.affectedItemSkus || []
        };
      }
      return change;
    });

    const hasStoredChange = updatedChanges.some(change => change.coNumber === this.changeDetails?.coNumber);
    const changesToSave = hasStoredChange
      ? updatedChanges
      : [{ ...this.changeDetails, affectedItemSkus: this.changeDetails.affectedItemSkus || [] }, ...updatedChanges];

    localStorage.setItem(this.changeStorageKey, JSON.stringify(changesToSave));
  }

  private getStoredChanges(): ChangeRequestDetails[] {
    const saved = localStorage.getItem(this.changeStorageKey);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as ChangeRequestDetails[];
    } catch {
      return [];
    }
  }
}
