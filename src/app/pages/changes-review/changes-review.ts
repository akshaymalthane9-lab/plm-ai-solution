import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface ChangeRequestDetails {
  coNumber: string;
  changeType: string;
  priority: string;
  description: string;
  createdDate?: string;
}

@Component({
  selector: 'app-changes-review',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="review-container flex-col gap-8">
      <div class="page-header flex-col gap-2">
        <div class="header-top flex items-center justify-between gap-4">
          <div>
            <h1 class="page-title">Change Request Review</h1>
            <p class="text-muted">Review the submitted change details and monitor workflow progress.</p>
          </div>
          <button class="btn btn-secondary" type="button" (click)="router.navigate(['/changes'])">
            ← Back to Changes
          </button>
        </div>

        <nav class="tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'Overview'"
            (click)="selectTab('Overview')"
          >Overview</button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'Affected Items'"
            (click)="selectTab('Affected Items')"
          >Affected Items</button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'Workflow States'"
            (click)="selectTab('Workflow States')"
          >Workflow States</button>
        </nav>
      </div>

      <div class="card review-panel p-6">
        <ng-container *ngIf="changeDetails; else noData">
          <section *ngIf="activeTab === 'Overview'">
            <h2 class="section-title">Overview</h2>
            <div class="overview-grid">
              <div class="overview-item">
                <span class="label">CO Number</span>
                <strong>{{ changeDetails.coNumber }}</strong>
              </div>
              <div class="overview-item">
                <span class="label">Change Type</span>
                <strong>{{ changeDetails.changeType }}</strong>
              </div>
              <div class="overview-item">
                <span class="label">Priority</span>
                <strong>{{ changeDetails.priority }}</strong>
              </div>
              <div class="overview-item">
                <span class="label">Created Date</span>
                <strong>{{ changeDetails.createdDate }}</strong>
              </div>
              <div class="overview-item full-width">
                <span class="label">Description</span>
                <p class="description-box">{{ changeDetails.description }}</p>
              </div>
            </div>
          </section>

          <section *ngIf="activeTab === 'Affected Items'">
            <h2 class="section-title">Affected Items</h2>
            <p class="text-muted mb-4">This change request has no affected items assigned yet.</p>
            <div class="item-placeholder card p-4">
              <div class="placeholder-label">CO Number</div>
              <div>{{ changeDetails.coNumber }}</div>
            </div>
            <div class="item-placeholder card p-4 mt-3">
              <div class="placeholder-label">Priority</div>
              <div>{{ changeDetails.priority }}</div>
            </div>
          </section>

          <section *ngIf="activeTab === 'Workflow States'">
            <h2 class="section-title">Workflow States</h2>
            <div class="workflow-step-list">
              <div class="workflow-step active">
                <span class="step-marker">1</span>
                <div>
                  <strong>Overview Submitted</strong>
                  <p class="text-muted">Request details have been captured and are ready for review.</p>
                </div>
              </div>
              <div class="workflow-step">
                <span class="step-marker">2</span>
                <div>
                  <strong>Review Pending</strong>
                  <p class="text-muted">The change request will move into review once approved.</p>
                </div>
              </div>
              <div class="workflow-step">
                <span class="step-marker">3</span>
                <div>
                  <strong>Approval / Release</strong>
                  <p class="text-muted">Track the final workflow state as approvals progress.</p>
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
    .page-header { display: flex; flex-direction: column; gap: 1.5rem; }
    .header-top { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .page-title { margin: 0; font-size: 1.9rem; color: var(--text-primary); font-weight: 700; }
    .text-muted { color: var(--text-muted); font-size: 0.95rem; }
    .tabs { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .tab-btn { padding: 0.85rem 1.25rem; border-radius: 999px; border: 1px solid var(--border-color); background: var(--bg-app); color: var(--text-secondary); cursor: pointer; font-weight: 600; transition: all var(--transition-fast); }
    .tab-btn.active { background: var(--accent-primary); color: #fff; border-color: transparent; }
    .review-panel { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); }
    .section-title { font-size: 1.25rem; margin-bottom: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
    .overview-item { background: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 1.25rem; }
    .overview-item.full-width { grid-column: 1 / -1; }
    .label { display: block; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .description-box { margin: 0; white-space: pre-wrap; line-height: 1.65; }
    .item-placeholder { border: 1px dashed var(--border-color); }
    .placeholder-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
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
  `
})
export class ChangesReview {
  router = inject(Router);
  activeTab: 'Overview' | 'Affected Items' | 'Workflow States' = 'Overview';
  changeDetails: ChangeRequestDetails | null = null;

  constructor() {
    const currentNav = this.router.getCurrentNavigation();
    const navigationState = currentNav?.extras?.state as { changeRequest?: Partial<ChangeRequestDetails> } | undefined;
    const routeState = navigationState?.changeRequest || (window.history.state?.changeRequest as Partial<ChangeRequestDetails> | undefined) || null;

    if (routeState) {
      this.changeDetails = {
        ...routeState,
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

  selectTab(tab: 'Overview' | 'Affected Items' | 'Workflow States') {
    this.activeTab = tab;
  }
}
