import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="changes-container flex-col gap-8">
      <div class="page-header">
        <h1 class="page-title">Changes Management</h1>
        <p class="text-muted">Create and manage product changes and updates</p>
      </div>

      <div class="options-grid grid">
        <!-- Create Changes Option -->
        <div class="option-card card flex-col gap-6" (click)="navigateToCreateChanges()">
          <div class="icon-container">
            <span class="option-icon">✏️</span>
          </div>
          <div class="content flex-col gap-2">
            <h3 class="option-title">Create Changes</h3>
            <p class="option-description">Create new product changes, updates, or modifications to existing records.</p>
          </div>
          <div class="action-footer">
            <span class="action-text">Start Creating →</span>
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
      cursor: pointer;
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

  navigateToCreateChanges() {
    // Navigate to create changes page (or can be a modal/form)
    this.router.navigate(['/changes/create']);
  }

  navigateToManageChanges() {
    // Navigate to manage changes page
    this.router.navigate(['/changes/manage']);
  }
}
