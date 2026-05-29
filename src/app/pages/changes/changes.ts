import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ChangeRequest {
  coNumber: string;
  changeType: string;
  priority: string;
  description: string;
  createdDate: string;
  status: string;
  requestedBy: string;
  reviewer?: string;
  workflowStatus?: string;
  workflowMaxVisitedIndex?: number;
  affectedItemSkus?: string[];
  affectedItemUpdates?: Record<string, unknown>;
}

@Component({
  selector: 'app-changes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="changes-container flex-col gap-8">
      <div class="page-header">
        <h1 class="page-title">Changes Management</h1>
        <p class="text-muted">Create and manage product changes and updates</p>
      </div>

      <div class="success-banner card p-4" *ngIf="submittedChange">
        <strong>Change request submitted:</strong>
        <div>CO Number: {{ submittedChange.coNumber }}</div>
        <div>Change Type: {{ submittedChange.changeType }}</div>
        <div>Priority: {{ submittedChange.priority }}</div>
      </div>

      <div class="options-grid grid">
        <!-- Create Changes Option -->
        <div class="option-card card flex-col gap-6">
          <div class="icon-container">
            <span class="option-icon">✏️</span>
          </div>
          <div class="content flex-col gap-2">
            <h3 class="option-title">Create Changes</h3>
            <p class="option-description">Create a new change request and review its details on the review page.</p>
          </div>
          <div class="action-footer">
            <button class="btn btn-primary" type="button" (click)="openCreateForm()">Create Changes</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showCreateForm" (click)="closeForm()">
        <div class="modal-card flex-col" (click)="$event.stopPropagation()">
          <div class="modal-header border-b">
            <div class="flex justify-between items-center w-full">
              <div>
                <h2 class="title">Create Change Request</h2>
                <p class="text-muted mt-2">Fill in the change order details and submit when ready.</p>
              </div>
              <button class="close-icon-btn flex items-center justify-center" type="button" (click)="closeForm()">✕</button>
            </div>
          </div>

          <form (ngSubmit)="submitChange()" class="create-change-form">
            <div class="modal-body">
              <div class="field-group">
                <label class="field-label" for="coNumber">CO Number *</label>
                <input
                  id="coNumber"
                  type="text"
                  class="field-input"
                  name="coNumber"
                  [(ngModel)]="coNumber"
                  placeholder="2500 or CO-2500"
                  required
                  (input)="normalizeCOInput()"
                />
                
              </div>

              <div class="field-group">
                <label class="field-label" for="changeType">Change Type *</label>
                <select id="changeType" class="field-input" name="changeType" [(ngModel)]="changeType" required>
                  <option value="ECO">ECO</option>
                  <option value="MCO">MCO</option>
                  <option value="Deviation">Deviation</option>
                  <option value="Change Request">Change Request</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label" for="priority">Priority *</label>
                <select id="priority" class="field-input" name="priority" [(ngModel)]="priority" required>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label" for="description">Description</label>
                <textarea
                  id="description"
                  class="field-textarea"
                  name="description"
                  [(ngModel)]="description"
                  placeholder="Describe the change details..."
                  (input)="updateDescriptionCount()"
                ></textarea>
                <div class="description-meta flex justify-between items-center">
                  <span [class.error-text]="description.length > 1000">{{ description.length }} / 1000</span>
                  <span class="field-help">Max 1000 characters.</span>
                </div>
                <div class="error-message" *ngIf="description.length > 1000">
                  Description cannot exceed 1000 characters.
                </div>
              </div>

            </div>

            <div class="modal-footer border-t bg-surface">
              <div class="flex justify-end items-center w-full gap-4">
                <button class="btn btn-secondary" type="button" (click)="closeForm()">Cancel</button>
                <button class="btn btn-primary" type="submit" [disabled]="!canSubmit()">Submit Change</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: `
    .changes-container {
      animation: fadeIn var(--transition-fast);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 0;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
       margin-top: 1rem;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.03em;
    }

    .text-muted {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85rem 1.4rem;
      border-radius: 40px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .btn-primary {
      background: var(--accent-primary);
      color: #fff;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      background: var(--accent-primary-dark, #76ba1b);
    }

    .btn-secondary {
      background: var(--bg-app);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      background: var(--border-color);
    }

    .success-banner {
      border: 1px solid var(--accent-primary);
      background: var(--accent-primary-subtle);
      color: var(--text-primary);
      padding: 1rem;
      border-radius: var(--border-radius-sm);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      backdrop-filter: blur(2px);
      animation: fadeIn var(--transition-fast);
    }

    .modal-card {
      width: min(720px, 100%);
      max-height: calc(100vh - 3rem);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-float);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem 1.75rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .title {
      font-size: 1.35rem;
      margin: 0;
      color: var(--text-primary);
      font-weight: 700;
    }

    .close-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-app);
      border: 1px solid var(--border-color);
      font-size: 1.1rem;
      color: var(--text-muted);
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .close-icon-btn:hover {
      background: var(--border-color);
      color: var(--text-primary);
    }

    .create-change-form {
      min-height: 0;
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    .modal-body {
      padding: 1.5rem 1.75rem;
      background: var(--bg-app);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-footer {
      padding: 1rem 1.75rem;
      display: flex;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .create-form {
      display: none;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.75rem;
    }

    .form-title {
      margin: 0;
      font-size: 1.4rem;
      color: var(--text-primary);
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .field-label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .field-input,
    .field-textarea,
    select {
      width: 100%;
      padding: 0.8rem 0.9rem;
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .field-input:focus,
    .field-textarea:focus,
    select:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(134, 188, 37, 0.12);
    }

    .field-textarea {
      min-height: 130px;
      resize: vertical;
    }

    .field-help {
      color: var(--text-muted);
      font-size: 0.85rem;
      line-height: 1.45;
    }

    .description-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .success-message {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--accent-primary-subtle);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--accent-primary);
      color: var(--text-primary);
    }

    .error-message {
      color: var(--color-danger);
      font-size: 0.9rem;
    }

    .error-text {
      color: var(--color-danger);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .option-card {
      padding: 2.5rem;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .option-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-float);
      border-color: var(--accent-primary);
    }

    .icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 1.5rem 0;
      background: var(--bg-app);
      border-radius: var(--border-radius-md);
    }

    .option-icon {
      font-size: 3rem;
      display: block;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .option-description {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .action-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color-light);
    }

    .action-text {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--accent-primary);
      transition: transform var(--transition-fast);
    }

    .option-card:hover .action-text {
      transform: translateX(4px);
    }

    .manage-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .manage-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .section-title {
      margin: 0 0 0.35rem;
      font-size: 1.35rem;
      color: var(--text-primary);
      font-weight: 700;
    }

    .manage-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .table-shell {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 960px;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 0.9rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color-light);
      color: var(--text-secondary);
      font-size: 0.92rem;
      vertical-align: middle;
    }

    th {
      background: var(--bg-app);
      color: var(--text-primary);
      font-weight: 700;
      white-space: nowrap;
    }

    tbody tr:hover {
      background: var(--accent-primary-subtle);
    }

    .co-number {
      color: var(--text-primary);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      white-space: nowrap;
    }

    .priority-pill,
    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 68px;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .priority-pill.high {
      color: #b91c1c;
      background: #fee2e2;
      border-color: #fecaca;
    }

    .priority-pill.medium {
      color: #92400e;
      background: #fef3c7;
      border-color: #fde68a;
    }

    .priority-pill.low {
      color: #047857;
      background: #d1fae5;
      border-color: #a7f3d0;
    }

    .status-pill {
      color: var(--accent-primary-hover);
      background: var(--accent-primary-subtle);
      border-color: var(--accent-primary);
    }

    .description-cell {
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .link-button {
      border: 0;
      background: transparent;
      color: var(--accent-primary-hover);
      font-weight: 700;
      cursor: pointer;
      padding: 0.25rem 0;
    }

    .link-button:hover {
      text-decoration: underline;
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
      padding: 3rem 1.5rem;
      text-align: center;
      background: var(--bg-app);
    }

    .empty-state h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.15rem;
    }

    .flex-col {
      display: flex;
      flex-direction: column;
    }

    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }

    @media (max-width: 640px) {
      .modal-overlay {
        align-items: stretch;
        padding: 0.75rem;
      }

      .modal-card {
        max-height: calc(100vh - 1.5rem);
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .modal-footer .flex {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .modal-footer .btn {
        width: 100%;
      }

      .manage-header {
        flex-direction: column;
      }

      .manage-actions {
        width: 100%;
      }

      .manage-actions .btn {
        flex: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
})
export class Changes {
  router = inject(Router);
  private changeStorageKey = 'deloitte_plm_change_requests_v1';
  showCreateForm = false;
  coNumber = '';
  changeType = 'ECO';
  priority = 'High';
  description = '';
  submittedChange: { coNumber: string; changeType: string; priority: string; description: string } | null = null;
  changeRequests: ChangeRequest[] = [];

  constructor() {
    this.changeRequests = this.loadChangeRequests();
  }

  openCreateForm() {
    this.showCreateForm = true;
  }

  closeForm() {
    this.showCreateForm = false;
  }

  updateDescriptionCount() {
    if (this.description.length > 1000) {
      this.description = this.description.slice(0, 1000);
    }
  }

  normalizeCOInput() {
    const value = this.coNumber.trim();
    if (!value) {
      this.coNumber = '';
      return;
    }
    if (/^CO-/i.test(value)) {
      this.coNumber = value.toUpperCase();
    } else {
      this.coNumber = value;
    }
  }

  normalizeCONumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    const raw = trimmed.replace(/^CO-/i, '').trim();
    return raw ? `CO-${raw}` : '';
  }

  canSubmit() {
    return (
      !!this.coNumber.trim() &&
      !!this.changeType &&
      !!this.priority &&
      this.description.length <= 1000
    );
  }

  submitChange() {
    if (!this.canSubmit()) {
      return;
    }

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const changeRequest = {
      coNumber: this.normalizeCONumber(this.coNumber),
      changeType: this.changeType,
      priority: this.priority,
      description: this.description.trim(),
      createdDate: formattedDate,
      status: 'Open',
      requestedBy: 'Admin',
      reviewer: 'Admin_Product',
      workflowStatus: 'Open',
      workflowMaxVisitedIndex: 0,
      affectedItemSkus: [],
      affectedItemUpdates: {}
    };

    this.saveChangeRequest(changeRequest);

    this.router.navigate(['/changes/review'], {
      state: { changeRequest }
    });

    this.coNumber = '';
    this.changeType = 'ECO';
    this.priority = 'High';
    this.description = '';
    this.showCreateForm = false;
  }

  reviewChange(changeRequest: ChangeRequest) {
    this.router.navigate(['/changes/review'], {
      state: { changeRequest }
    });
  }

  private loadChangeRequests(): ChangeRequest[] {
    const saved = localStorage.getItem(this.changeStorageKey);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as ChangeRequest[];
    } catch {
      return [];
    }
  }

  private saveChangeRequest(changeRequest: ChangeRequest) {
    this.changeRequests = [
      changeRequest,
      ...this.changeRequests.filter(change => change.coNumber !== changeRequest.coNumber)
    ];
    localStorage.setItem(this.changeStorageKey, JSON.stringify(this.changeRequests));
  }
}
