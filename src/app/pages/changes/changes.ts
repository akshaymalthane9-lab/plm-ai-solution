import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

type ChangeRow = {
  number: string;
  type: 'ECO' | 'Deviation';
  description: string;
  reason: string;
  workflowState: 'Review' | 'Draft' | 'Completed' | 'Approve';
  engineer: string;
  created: string;
};

@Component({
  selector: 'app-changes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="changes-page" [class.light-theme]="themeService.theme() === 'light'">
      <div class="page-header-row">
        <div class="page-header">
          <h1>Changes</h1>
          <p>Engineering change orders, requests, and deviations</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" type="button">Browse Released</button>
          <button class="btn btn-primary btn-sm" type="button" (click)="openCreateDialog()">+ Create Change</button>
        </div>
      </div>

      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Search changes by number, type, description..." />
        <button class="btn btn-ghost btn-sm" type="button">Advanced Filter</button>
      </div>

      <div class="table-wrap">
        <table>
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
            <tr *ngFor="let change of changes" (click)="openChange(change)">
              <td><span class="change-link">{{ change.number }}</span></td>
              <td>
                <span class="badge" [ngClass]="change.type === 'ECO' ? 'badge-blue' : 'badge-red'">
                  {{ change.type }}
                </span>
              </td>
              <td>{{ change.description }}</td>
              <td>{{ change.reason }}</td>
              <td><span class="badge" [ngClass]="workflowClass(change.workflowState)">{{ change.workflowState }}</span></td>
              <td>{{ change.engineer }}</td>
              <td class="muted-cell">{{ change.created }}</td>
              <td>
                <button class="open-btn" type="button" (click)="openChange(change); $event.stopPropagation()">Open →</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="showCreateDialog" (click)="closeCreateDialog()">
        <form class="change-modal" (click)="$event.stopPropagation()" (ngSubmit)="createChange()">
          <div class="modal-header">
            <h2>Create Change Order</h2>
            <button class="modal-close" type="button" (click)="closeCreateDialog()" aria-label="Close">×</button>
          </div>

          <div class="modal-body">
            <label class="form-group">
              <span>Change Type</span>
              <select class="form-control" [(ngModel)]="draft.type" name="type">
                <option value="Engineering Change Order">Engineering Change Order</option>
                <option value="Engineering Change Request">Engineering Change Request</option>
                <option value="Deviation">Deviation</option>
                <option value="Manufacturing Change Order">Manufacturing Change Order</option>
              </select>
            </label>

            <label class="form-group">
              <span>Change Number</span>
              <input class="form-control" [(ngModel)]="draft.number" name="number" />
            </label>

            <label class="form-group">
              <span>Change Description</span>
              <textarea class="form-control description-control" [(ngModel)]="draft.description" name="description" placeholder="Describe the change..."></textarea>
            </label>

            <label class="form-group">
              <span>Reason for Change</span>
              <select class="form-control" [(ngModel)]="draft.reason" name="reason">
                <option value="New Product Introduction">New Product Introduction</option>
                <option value="Quality Improvement">Quality Improvement</option>
                <option value="Cost Reduction">Cost Reduction</option>
                <option value="Regulatory Requirement">Regulatory Requirement</option>
                <option value="Safety">Safety</option>
              </select>
            </label>
          </div>

          <div class="modal-footer">
            <button class="modal-button cancel-button" type="button" (click)="closeCreateDialog()">Cancel</button>
            <button class="modal-button create-button" type="submit">Create Change</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 52px);
    }
    * {
      box-sizing: border-box;
    }
    button,
    input {
      font: inherit;
    }
    .changes-page {
      --bg: #0d1117;
      --bg2: #161b22;
      --bg3: #21262d;
      --bg4: #30363d;
      --border: #30363d;
      --text: #e6edf3;
      --text2: #8b949e;
      --text3: #6e7681;
      --accent: #2f81f7;
      --green: #3fb950;
      --yellow: #d29922;
      --red: #f85149;
      --purple: #bc8cff;
      min-height: calc(100vh - 52px);
      padding: 34px 36px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .changes-page.light-theme {
      --bg: #f5f7fa;
      --bg2: #ffffff;
      --bg3: #eef2f7;
      --bg4: #dfe5ec;
      --border: #d8dee7;
      --text: #172033;
      --text2: #59677c;
      --text3: #7b8798;
      --accent: #1f6feb;
      --green: #1a7f37;
      --yellow: #9a6700;
      --red: #cf222e;
      --purple: #8250df;
    }
    .page-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -.03em;
    }
    .page-header p {
      margin: 4px 0 0;
      color: var(--text2);
      font-size: 15px;
    }
    .page-actions {
      display: flex;
      gap: 10px;
      margin-top: -2px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid transparent;
      border-radius: 7px;
      cursor: pointer;
      font-weight: 700;
      transition: background .15s, border-color .15s, color .15s;
    }
    .btn-sm {
      min-height: 30px;
      padding: 5px 13px;
      font-size: 14px;
    }
    .btn-primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .btn-secondary {
      border-color: var(--border);
      background: var(--bg3);
      color: var(--text);
    }
    .btn-ghost {
      border-color: transparent;
      background: transparent;
      color: var(--text2);
    }
    .btn-ghost:hover {
      background: var(--bg3);
      color: var(--text);
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--bg3);
    }
    .search-icon {
      color: var(--accent);
      font-size: 21px;
      line-height: 1;
    }
    .search-bar input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--text);
      font-size: 16px;
    }
    .search-bar input::placeholder {
      color: var(--text3);
    }
    .table-wrap {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--bg);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }
    thead {
      background: var(--bg3);
    }
    th {
      padding: 12px 16px;
      color: var(--text2);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .05em;
      text-align: left;
      text-transform: uppercase;
      white-space: nowrap;
    }
    td {
      padding: 15px 16px;
      border-top: 1px solid var(--border);
      color: var(--text);
      vertical-align: middle;
    }
    tbody tr {
      cursor: pointer;
      transition: background .12s;
    }
    tbody tr:hover td {
      background: rgba(255,255,255,.025);
    }
    .change-link {
      color: var(--accent);
      font-weight: 800;
      white-space: nowrap;
    }
    .muted-cell {
      color: var(--text2);
      white-space: nowrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      width: max-content;
      padding: 3px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--bg3);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
      white-space: nowrap;
    }
    .badge-blue {
      border-color: rgba(47,129,247,.35);
      background: rgba(47,129,247,.15);
      color: var(--accent);
    }
    .badge-red {
      border-color: rgba(248,81,73,.35);
      background: rgba(248,81,73,.15);
      color: var(--red);
    }
    .badge-yellow {
      border-color: rgba(210,153,34,.35);
      background: rgba(210,153,34,.15);
      color: var(--yellow);
    }
    .badge-gray {
      border-color: var(--border);
      background: var(--bg3);
      color: var(--text2);
    }
    .badge-green {
      border-color: rgba(63,185,80,.35);
      background: rgba(63,185,80,.15);
      color: var(--green);
    }
    .open-btn {
      border: 0;
      background: transparent;
      color: var(--text2);
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }
    .open-btn:hover {
      color: var(--accent);
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(0,0,0,.62);
    }
    .change-modal {
      width: min(600px, 100%);
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--bg2);
      box-shadow: 0 24px 80px rgba(0,0,0,.45);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 26px;
      border-bottom: 1px solid var(--border);
    }
    .modal-header h2 {
      margin: 0;
      color: var(--text);
      font-size: 18px;
      font-weight: 800;
    }
    .modal-close {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: var(--bg3);
      color: var(--text2);
      cursor: pointer;
      font-size: 22px;
      font-weight: 800;
      line-height: 1;
    }
    .modal-close:hover {
      color: var(--text);
    }
    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 26px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group span {
      color: var(--text2);
      font-size: 14px;
      font-weight: 800;
    }
    .form-control {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--border);
      border-radius: 7px;
      outline: none;
      background: var(--bg3);
      color: var(--text);
      font-size: 16px;
      padding: 10px 14px;
    }
    .form-control:focus {
      border-color: rgba(47,129,247,.75);
      box-shadow: 0 0 0 3px rgba(47,129,247,.12);
    }
    .description-control {
      min-height: 82px;
      resize: vertical;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 18px 26px;
      border-top: 1px solid var(--border);
    }
    .modal-button {
      min-width: 90px;
      min-height: 38px;
      border: 1px solid var(--border);
      border-radius: 7px;
      cursor: pointer;
      font-weight: 800;
    }
    .cancel-button {
      background: var(--bg3);
      color: var(--text);
    }
    .create-button {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    @media (max-width: 1100px) {
      .changes-page {
        padding: 24px 20px;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        min-width: 1120px;
      }
      .page-header-row {
        flex-direction: column;
      }
    }
  `,
})
export class Changes {
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  showCreateDialog = false;
  draft = this.createEmptyDraft();

  changes: ChangeRow[] = [
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

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  createChange() {
    const number = this.draft.number.trim() || 'ECO-003';
    const newChange: ChangeRow = {
      number,
      type: this.draft.type === 'Deviation' ? 'Deviation' : 'ECO',
      description: this.draft.description.trim() || 'New change order',
      reason: this.draft.reason,
      workflowState: 'Draft',
      engineer: 'Test User',
      created: new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()).replace(/ /g, ' '),
    };
    this.changes = [newChange, ...this.changes.filter(change => change.number !== number)];
    this.draft = this.createEmptyDraft();
    this.closeCreateDialog();
  }

  openChange(change: ChangeRow) {
    this.router.navigate(['/changes/review'], {
      state: {
        changeRequest: {
          coNumber: change.number,
          changeType: change.type,
          priority: change.workflowState === 'Approve' ? 'High' : 'Medium',
          description: change.description,
          createdDate: change.created,
          status: change.workflowState,
          requestedBy: change.engineer,
          workflowStatus: change.workflowState,
        },
      },
    });
  }

  workflowClass(state: ChangeRow['workflowState']): string {
    if (state === 'Completed') {
      return 'badge-green';
    }
    if (state === 'Draft') {
      return 'badge-gray';
    }
    return 'badge-yellow';
  }

  private createEmptyDraft() {
    return {
      type: 'Engineering Change Order',
      number: 'ECO-003',
      description: '',
      reason: 'New Product Introduction',
    };
  }
}
