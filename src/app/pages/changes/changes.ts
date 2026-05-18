import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

        <!-- Manage Changes Option -->
        <div class="option-card card flex-col gap-6" (click)="navigateToManageChanges()">
          <div class="icon-container">
            <span class="option-icon">⚙️</span>
          </div>
          <div class="content flex-col gap-2">
            <h3 class="option-title">Manage Changes</h3>
            <p class="option-description">Review, approve, or modify existing changes and track their lifecycle status.</p>
          </div>
          <div class="action-footer">
            <span class="action-text">Start Managing →</span>
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

          <div class="modal-body p-6">
            <form (ngSubmit)="submitChange()" class="flex-col gap-y-6">
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
                <p class="field-help">Enter the numeric change order number. Submitted value will be normalized to <strong>CO-XXXX</strong>.</p>
              </div>

              <div class="field-group">
                <label class="field-label" for="changeType">Change Type *</label>
                <select id="changeType" class="field-input" name="changeType" [(ngModel)]="changeType" required>
                  <option value="Engineering Change Order">Engineering Change Order</option>
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
                <label class="field-label" for="description">Description *</label>
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
      backdrop-filter: blur(2px);
      animation: fadeIn var(--transition-fast);
    }

    .modal-card {
      width: 700px;
      max-width: 95vw;
      background: var(--bg-surface);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-float);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 2rem 2.5rem 1rem;
      background: var(--bg-surface);
    }

    .title {
      font-size: 1.5rem;
      margin: 0;
      color: var(--text-primary);
      font-weight: 600;
      letter-spacing: -0.03em;
    }

    .close-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: transparent;
      border: 1px solid transparent;
      font-size: 1.1rem;
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }

    .close-icon-btn:hover {
      background: var(--bg-app);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 1.5rem 2rem;
      background: var(--bg-app);
      max-height: 75vh;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 1.25rem 2rem;
      display: flex;
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
      gap: 0.5rem;
    }

    .field-label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .field-input,
    .field-textarea,
    select {
      width: 100%;
      padding: 0.95rem 1rem;
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-app);
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
      min-height: 160px;
      resize: vertical;
    }

    .field-help {
      color: var(--text-muted);
      font-size: 0.9rem;
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
      color: var(--danger);
      font-size: 0.9rem;
    }

    .error-text {
      color: var(--danger);
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

    .flex-col {
      display: flex;
      flex-direction: column;
    }

    .gap-2 { gap: 0.5rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }

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
  showCreateForm = false;
  coNumber = '';
  changeType = 'Engineering Change Order';
  priority = 'High';
  description = '';
  submittedChange: { coNumber: string; changeType: string; priority: string; description: string } | null = null;

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
      !!this.description.trim() &&
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
      createdDate: formattedDate
    };

    this.router.navigate(['/changes/review'], {
      state: { changeRequest }
    });

    this.coNumber = '';
    this.changeType = 'Engineering Change Order';
    this.priority = 'High';
    this.description = '';
    this.showCreateForm = false;
  }

  navigateToManageChanges() {
    this.router.navigate(['/changes/manage']);
  }
}
