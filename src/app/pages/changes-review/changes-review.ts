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
  reviewer?: string;
  workflowStatus?: WorkflowStage;
  workflowMaxVisitedIndex?: number;
  affectedItemSkus?: string[];
  affectedItemUpdates?: Record<string, AffectedItemUpdate>;
}

type ReviewTab = 'General Information' | 'Affected Objects' | 'Workflow';
type NewLifecycle = 'Design' | 'Production' | 'Obsolete' | 'Development';
type WorkflowStage = 'Open' | 'Submit' | 'Review' | 'Released' | 'Completed';

interface AffectedItemUpdate {
  newRevision: string;
  newLifecycle: NewLifecycle;
  effectiveDate: string;
}

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
                <strong>{{ changeDetails.description || '-' }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Priority:</span>
                <strong>{{ changeDetails.priority }}</strong>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <strong>{{ selectedWorkflowStage }}</strong>
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
                    <td>
                      <input
                        class="table-control revision-control"
                        type="text"
                        [ngModel]="getAffectedItemUpdate(item).newRevision"
                        (ngModelChange)="updateAffectedItemField(item.sku, 'newRevision', $event)"
                      />
                    </td>
                    <td>{{ item.lifecycle }}</td>
                    <td>
                      <select
                        class="table-control lifecycle-control"
                        [ngModel]="getAffectedItemUpdate(item).newLifecycle"
                        (ngModelChange)="updateAffectedItemField(item.sku, 'newLifecycle', $event)"
                      >
                        <option *ngFor="let lifecycle of newLifecycleOptions" [value]="lifecycle">{{ lifecycle }}</option>
                      </select>
                    </td>
                    <td>
                      <input
                        class="table-control date-control"
                        type="date"
                        [min]="todayDate"
                        [ngModel]="getAffectedItemUpdate(item).effectiveDate"
                        (ngModelChange)="updateEffectiveDate(item.sku, $event)"
                      />
                    </td>
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
              <button
                class="workflow-stage"
                *ngFor="let stage of workflowStages; let last = last"
                type="button"
                [class.active]="selectedWorkflowStage === stage"
                [class.previous]="isWorkflowStageVisited(stage) && selectedWorkflowStage !== stage"
                [class.unvisited]="!isWorkflowStageVisited(stage)"
                [class.locked]="!canClickWorkflowStage(stage)"
                (click)="selectWorkflowStage(stage)"
              >
                <span class="stage-status"></span>
                <span>
                  <strong>{{ stage }}</strong>
                  <small>{{ getWorkflowStageHint(stage) }}</small>
                </span>
              </button>
            </div>

            <div class="workflow-board">
              <div class="approver-panel">
                <div class="approver-header">
                  <h2 class="section-title">Workflow Approval</h2>
                  <div class="approver-actions">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="markAwaitingApproval()">Action</button>
                    <button class="btn btn-secondary btn-sm" type="button" (click)="assignReviewer()">Add</button>
                    <button class="btn btn-secondary btn-sm" type="button" (click)="clearReviewer()">Remove</button>
                  </div>
                </div>

                <div class="table-shell workflow-table-shell">
                  <table class="workflow-table">
                    <thead>
                      <tr>
                        <th>Workflow Status</th>
                        <th>Reviewer</th>
                        <th>Action</th>
                        <th>Req'd</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span class="status-pill">{{ selectedWorkflowStage }}</span>
                        </td>
                        <td>
                          <div class="assignee-row">
                            <span class="person-dot"></span>
                            <span>{{ workflowReviewer }}</span>
                          </div>
                        </td>
                        <td>{{ workflowAction }}</td>
                        <td>Yes</td>
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
    .table-control { width: 100%; min-width: 118px; padding: 0.5rem 0.6rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-surface); color: var(--text-primary); font: inherit; }
    .table-control:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(134, 188, 37, 0.12); }
    .revision-control { min-width: 110px; }
    .lifecycle-control { min-width: 138px; }
    .date-control { min-width: 145px; }
    .empty-table-cell { text-align: center; color: var(--text-muted); padding: 2rem; }
    .empty-tab-panel { border: 1px dashed var(--border-color); border-radius: var(--border-radius-md); background: var(--bg-app); padding: 1rem; color: var(--text-secondary); }
    .history-entry { display: grid; gap: 0.25rem; border-left: 3px solid var(--accent-primary); padding-left: 1rem; color: var(--text-secondary); }
    .workflow-stage-strip { display: grid; grid-template-columns: repeat(5, minmax(132px, 1fr)); gap: 2rem; overflow-x: auto; padding: 2rem 1rem 1.75rem; border-bottom: 1px solid var(--border-color); }
    .workflow-stage { position: relative; display: grid; place-items: center; min-height: 62px; padding: 0.65rem 0.8rem; border: 2px solid #2563eb; border-radius: 6px; background: #eff6ff; color: #1d4ed8; text-align: center; cursor: pointer; box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08); }
    .workflow-stage::before { content: ''; position: absolute; left: calc(100% + 1px); top: 50%; width: 2rem; height: 2px; background: var(--text-muted); }
    .workflow-stage::after { content: ''; position: absolute; left: calc(100% + 1.75rem); top: calc(50% - 5px); border-left: 8px solid var(--text-muted); border-top: 5px solid transparent; border-bottom: 5px solid transparent; z-index: 1; }
    .workflow-stage:last-child::before, .workflow-stage:last-child::after { content: ''; display: none; }
    .workflow-stage strong { display: block; font-size: 0.82rem; line-height: 1.2; color: inherit; }
    .workflow-stage small { display: block; margin-top: 0.2rem; font-size: 0.72rem; color: inherit; opacity: 0.78; }
    .stage-status { display: none; }
    .workflow-stage.previous { border-color: #16a34a; background: #dcfce7; color: #166534; }
    .workflow-stage.active { border-color: #f97316; background: #ffedd5; color: #9a3412; box-shadow: 0 0 0 1px #f97316, 0 6px 14px rgba(15, 23, 42, 0.08); }
    .workflow-stage.unvisited { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
    .workflow-stage.locked { cursor: not-allowed; box-shadow: none; }
    .workflow-board { display: grid; grid-template-columns: 1fr; gap: 1rem; padding-top: 1rem; }
    .approver-panel { min-height: 360px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: var(--bg-surface); overflow: hidden; }
    .approver-panel .section-title { margin: 0; padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 1rem; }
    .assignee-row { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--accent-primary-hover); font-weight: 600; }
    .person-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--bg-app); border: 1px solid var(--border-color); display: inline-block; position: relative; }
    .person-dot::before { content: ''; position: absolute; top: 3px; left: 6px; width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); }
    .person-dot::after { content: ''; position: absolute; left: 4px; bottom: 3px; width: 8px; height: 5px; border-radius: 8px 8px 2px 2px; background: var(--text-muted); }
    .approver-header { border-bottom: 1px solid var(--border-color); }
    .approver-actions { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--border-color-light); }
    .workflow-table-shell { border: 0; border-radius: 0; }
    .workflow-table { min-width: 640px; }
    .status-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 92px; padding: 0.25rem 0.7rem; border-radius: 999px; color: #9a3412; background: #ffedd5; border: 1px solid #fed7aa; font-weight: 700; }
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
      .workflow-stage-strip { grid-template-columns: repeat(5, 132px); }
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
  workflowStages: WorkflowStage[] = ['Open', 'Submit', 'Review', 'Released', 'Completed'];
  selectedWorkflowStage: WorkflowStage = 'Open';
  workflowMaxVisitedIndex = 0;
  workflowReviewer = 'Admin_Product';
  workflowAction = 'awaiting approval';
  changeDetails: ChangeRequestDetails | null = null;
  showAddSearch = false;
  itemSearchQuery = '';
  selectedAffectedSku = '';
  newLifecycleOptions: NewLifecycle[] = ['Design', 'Production', 'Obsolete', 'Development'];
  todayDate = this.formatDateForInput(new Date());

  constructor() {
    const currentNav = this.router.getCurrentNavigation();
    const navigationState = currentNav?.extras?.state as { changeRequest?: Partial<ChangeRequestDetails> } | undefined;
    const routeState = navigationState?.changeRequest || (window.history.state?.changeRequest as Partial<ChangeRequestDetails> | undefined) || null;

    if (routeState) {
      this.changeDetails = {
        ...routeState,
        affectedItemSkus: routeState.affectedItemSkus ?? this.getStoredAffectedItemSkus(routeState.coNumber || ''),
        affectedItemUpdates: routeState.affectedItemUpdates ?? this.getStoredAffectedItemUpdates(routeState.coNumber || ''),
        reviewer: routeState.reviewer ?? this.getStoredReviewer(routeState.coNumber || ''),
        workflowStatus: routeState.workflowStatus ?? this.toWorkflowStage(routeState.status),
        workflowMaxVisitedIndex: routeState.workflowMaxVisitedIndex ?? this.getStoredWorkflowMaxVisitedIndex(routeState.coNumber || ''),
        createdDate: routeState.createdDate ?? this.formatCurrentDate()
      } as ChangeRequestDetails;
      this.selectedWorkflowStage = this.changeDetails.workflowStatus || 'Open';
      this.workflowMaxVisitedIndex = Math.max(
        this.changeDetails.workflowMaxVisitedIndex || 0,
        this.workflowStages.indexOf(this.selectedWorkflowStage)
      );
      this.workflowReviewer = this.changeDetails.reviewer || 'Admin_Product';
      this.ensureAffectedItemUpdates();
      this.persistWorkflow();
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

  selectWorkflowStage(stage: WorkflowStage) {
    if (!this.canClickWorkflowStage(stage)) {
      return;
    }

    this.selectedWorkflowStage = stage;
    this.workflowMaxVisitedIndex = Math.max(this.workflowMaxVisitedIndex, this.workflowStages.indexOf(stage));
    this.persistWorkflow();
  }

  canClickWorkflowStage(stage: WorkflowStage) {
    const selectedIndex = this.workflowStages.indexOf(this.selectedWorkflowStage);
    const targetIndex = this.workflowStages.indexOf(stage);
    return targetIndex <= selectedIndex || targetIndex === selectedIndex + 1;
  }

  isWorkflowStageVisited(stage: WorkflowStage) {
    return this.workflowStages.indexOf(stage) <= this.workflowMaxVisitedIndex;
  }

  getWorkflowStageHint(stage: WorkflowStage) {
    const selectedIndex = this.workflowStages.indexOf(this.selectedWorkflowStage);
    const targetIndex = this.workflowStages.indexOf(stage);

    if (targetIndex === selectedIndex) {
      return 'Selected';
    }

    if (targetIndex === selectedIndex + 1) {
      return 'Next';
    }

    if (targetIndex < selectedIndex) {
      return 'Previous';
    }

    return 'Locked';
  }

  markAwaitingApproval() {
    this.workflowAction = 'awaiting approval';
    this.persistWorkflow();
  }

  assignReviewer() {
    this.workflowReviewer = 'Admin_Product';
    this.persistWorkflow();
  }

  clearReviewer() {
    this.workflowReviewer = '-';
    this.persistWorkflow();
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
      affectedItemSkus: [...(this.changeDetails.affectedItemSkus || []), item.sku],
      affectedItemUpdates: {
        ...(this.changeDetails.affectedItemUpdates || {}),
        [item.sku]: this.createAffectedItemUpdate(item)
      }
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

    const { [this.selectedAffectedSku]: removedUpdate, ...affectedItemUpdates } = this.changeDetails.affectedItemUpdates || {};
    this.changeDetails = {
      ...this.changeDetails,
      affectedItemSkus: (this.changeDetails.affectedItemSkus || []).filter(sku => sku !== this.selectedAffectedSku),
      affectedItemUpdates
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

  getAffectedItemUpdate(item: Product): AffectedItemUpdate {
    if (!this.changeDetails) {
      return this.createAffectedItemUpdate(item);
    }

    const existingUpdate = this.changeDetails.affectedItemUpdates?.[item.sku];
    if (existingUpdate) {
      return existingUpdate;
    }

    const newUpdate = this.createAffectedItemUpdate(item);
    this.changeDetails = {
      ...this.changeDetails,
      affectedItemUpdates: {
        ...(this.changeDetails.affectedItemUpdates || {}),
        [item.sku]: newUpdate
      }
    };
    this.persistAffectedItems();
    return newUpdate;
  }

  updateAffectedItemField<K extends keyof AffectedItemUpdate>(sku: string, field: K, value: AffectedItemUpdate[K]) {
    if (!this.changeDetails) {
      return;
    }

    const item = this.inventoryService.getData().find(product => product.sku === sku);
    const currentUpdate = this.changeDetails.affectedItemUpdates?.[sku] || this.createAffectedItemUpdate(item);

    this.changeDetails = {
      ...this.changeDetails,
      affectedItemUpdates: {
        ...(this.changeDetails.affectedItemUpdates || {}),
        [sku]: {
          ...currentUpdate,
          [field]: value
        }
      }
    };
    this.persistAffectedItems();
  }

  updateEffectiveDate(sku: string, dateValue: string) {
    const effectiveDate = dateValue < this.todayDate ? this.todayDate : dateValue;
    this.updateAffectedItemField(sku, 'effectiveDate', effectiveDate);
  }

  private ensureAffectedItemUpdates() {
    if (!this.changeDetails) {
      return;
    }

    const updates = { ...(this.changeDetails.affectedItemUpdates || {}) };
    for (const sku of this.changeDetails.affectedItemSkus || []) {
      const item = this.inventoryService.getData().find(product => product.sku === sku);
      updates[sku] = updates[sku] || this.createAffectedItemUpdate(item);
      updates[sku].effectiveDate = this.normalizeEffectiveDate(updates[sku].effectiveDate);
    }

    this.changeDetails = {
      ...this.changeDetails,
      affectedItemUpdates: updates
    };
    this.persistAffectedItems();
  }

  private createAffectedItemUpdate(item?: Product): AffectedItemUpdate {
    return {
      newRevision: item ? this.nextRevision(item.revision) : '',
      newLifecycle: this.toNewLifecycle(item?.lifecycle),
      effectiveDate: this.todayDate
    };
  }

  private normalizeEffectiveDate(dateValue: string) {
    if (!dateValue || dateValue < this.todayDate) {
      return this.todayDate;
    }

    return dateValue;
  }

  private toNewLifecycle(lifecycle?: string): NewLifecycle {
    return this.newLifecycleOptions.includes(lifecycle as NewLifecycle) ? lifecycle as NewLifecycle : 'Design';
  }

  private formatDateForInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getStoredAffectedItemSkus(coNumber: string): string[] {
    const storedChange = this.getStoredChanges().find(change => change.coNumber === coNumber);
    return storedChange?.affectedItemSkus || [];
  }

  private getStoredAffectedItemUpdates(coNumber: string): Record<string, AffectedItemUpdate> {
    const storedChange = this.getStoredChanges().find(change => change.coNumber === coNumber);
    return storedChange?.affectedItemUpdates || {};
  }

  private getStoredReviewer(coNumber: string): string {
    const storedChange = this.getStoredChanges().find(change => change.coNumber === coNumber);
    return storedChange?.reviewer || 'Admin_Product';
  }

  private getStoredWorkflowMaxVisitedIndex(coNumber: string): number {
    const storedChange = this.getStoredChanges().find(change => change.coNumber === coNumber);
    const statusIndex = this.workflowStages.indexOf(this.toWorkflowStage(storedChange?.workflowStatus || storedChange?.status));
    return Math.max(storedChange?.workflowMaxVisitedIndex || 0, statusIndex);
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
          affectedItemSkus: this.changeDetails.affectedItemSkus || [],
          affectedItemUpdates: this.changeDetails.affectedItemUpdates || {},
          status: this.selectedWorkflowStage,
          workflowStatus: this.selectedWorkflowStage,
          workflowMaxVisitedIndex: this.workflowMaxVisitedIndex,
          reviewer: this.workflowReviewer
        };
      }
      return change;
    });

    const hasStoredChange = updatedChanges.some(change => change.coNumber === this.changeDetails?.coNumber);
    const changesToSave = hasStoredChange
      ? updatedChanges
      : [{
        ...this.changeDetails,
        affectedItemSkus: this.changeDetails.affectedItemSkus || [],
        affectedItemUpdates: this.changeDetails.affectedItemUpdates || {},
        status: this.selectedWorkflowStage,
        workflowStatus: this.selectedWorkflowStage,
        workflowMaxVisitedIndex: this.workflowMaxVisitedIndex,
        reviewer: this.workflowReviewer
      }, ...updatedChanges];

    localStorage.setItem(this.changeStorageKey, JSON.stringify(changesToSave));
  }

  private persistWorkflow() {
    if (!this.changeDetails) {
      return;
    }

    this.changeDetails = {
      ...this.changeDetails,
      status: this.selectedWorkflowStage,
      workflowStatus: this.selectedWorkflowStage,
      workflowMaxVisitedIndex: this.workflowMaxVisitedIndex,
      reviewer: this.workflowReviewer
    };
    this.persistAffectedItems();
  }

  private toWorkflowStage(status?: string): WorkflowStage {
    return this.workflowStages.includes(status as WorkflowStage) ? status as WorkflowStage : 'Open';
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
