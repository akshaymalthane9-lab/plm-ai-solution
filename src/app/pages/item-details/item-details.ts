import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, InventoryService } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button class="btn btn-secondary" routerLink="/inventory">← Back to Inventory</button>
          <div class="item-id-block flex items-center gap-4">
            <div class="sku-badge font-mono">{{ item?.sku }}</div>
            <div class="type-badge">{{ item?.type }}</div>
            <h1 class="page-title">{{ item?.name }}</h1>
          </div>
        </div>

        <div class="flex items-center gap-6" *ngIf="item">
           <div class="lifecycle-group flex items-center gap-2">
             <div class="lifecycle-badge">Lifecycle: <strong>{{ item.lifecycle }}</strong></div>
             <button
               *ngIf="canPromoteLifecycle()"
               (click)="promoteLifecycle()"
               class="btn btn-promote btn-sm"
               [disabled]="userService.isReadOnly()">
               Advance Stage →
             </button>
           </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs flex border-b w-full mb-6">
        <button class="tab-btn" [class.active]="activeTab === 'Overview'" (click)="activeTab = 'Overview'">Overview</button>
        <button class="tab-btn" [class.active]="activeTab === 'Details'" (click)="activeTab = 'Details'">Details</button>
        <button class="tab-btn" [class.active]="activeTab === 'Changes'" (click)="activeTab = 'Changes'">Changes</button>
        <button class="tab-btn" [class.active]="activeTab === 'Attachments'" (click)="activeTab = 'Attachments'">Attachments ({{item?.attachments?.length || 0}})</button>
        <button class="tab-btn" [class.active]="activeTab === 'History'" (click)="activeTab = 'History'">History Log</button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content" *ngIf="item">

        <ng-container *ngIf="activeTab === 'Overview' && item">
        <div class="grid-2 attributes-board mb-8">
  <div class="attr-group card p-6 flex-col justify-between" style="min-height: 100px;">
    <span class="attr-label mb-3 text-secondary" style="margin-left: 1rem; margin-top: 1rem; display: inline-block;">
      Revision Level
    </span>
    <span class="attr-val font-mono text-2xl" style="margin-left: 1rem; margin-bottom: 1rem; display: inline-block;">
      {{ item.revision }}
    </span>
  </div>

  <div class="attr-group card p-6 flex-col justify-between" style="min-height: 80px;">
    <span class="attr-label mb-3 text-secondary" style="margin-left: 1rem; margin-top: 1rem; display: inline-block;">
      Inventory Status
    </span>
    <span class="attr-val flex items-center gap-3">
      <span class="status-badge" [class]="item.status" style="margin-left: 1rem; margin-bottom: 1rem; display: inline-block;">
        {{ item.status.replace('-', ' ') }}
      </span>
    </span>
  </div>
</div>

          <!-- Bill of Materials -->
          <div class="card mb-8 p-6">
            <div class="flex justify-between items-end mb-4">
               <h3 class="section-title">Bill of Materials</h3>
<span class="text-sm text-muted" style="margin-right: 1rem; margin-top: 1rem; display: inline-block;">
  {{ getResolvedBom().length }} components connected
</span>
            </div>

            <div class="table-container border rounded">
               <table class="data-table">
                 <thead>
                   <tr>
                     <th>Component SKU</th>
                     <th>Item Name</th>
                     <th>Revision</th>
                     <th>Item Type</th>
                     <th>Part Types</th>
                     <th>Classification</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr *ngFor="let child of getResolvedBom()" class="hover-row cursor-pointer" (click)="navigateToItem(child.sku)">
                      <td class="font-mono text-primary font-medium">{{ child.sku }}</td>
                      <td class="font-medium">{{ child.name }}</td>
                      <td>{{ child.revision }}</td>
                      <td>{{ child.part || child.type }}</td>
                      <td>{{ child.partType || '—' }}</td>
                      <td>{{ child.classification || '—' }}</td>
                   </tr>
                   <tr *ngIf="getResolvedBom().length === 0">
                      <td colspan="6" class="text-center py-12 text-muted">No BOM components attached to this entity.</td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Details' && item">
           <div class="grid-2 gap-y-6">
              <div class="attr-group outline-group">
                <span class="attr-label">Primary Category</span>
                <span class="attr-val">{{ item.category }}</span>
              </div>
              <div class="attr-group outline-group">
                <span class="attr-label">System Record UUID</span>
                <span class="attr-val font-mono text-sm">{{ item.id }}</span>
              </div>
              <div class="attr-group outline-group">
                <span class="attr-label">Owned Stock Quantity</span>
                <span class="attr-val">{{ item.quantity }}</span>
              </div>
              <div class="attr-group outline-group">
                <span class="attr-label">Engineering Type</span>
                <span class="attr-val">{{ item.type }}</span>
              </div>
           </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Changes' && item">
          <div *ngIf="item.changes.length === 0" class="empty-state card p-8 text-center">
             <span class="text-4xl mb-4 block">📝</span>
             <p>No active Engineering Change Notices (ECN) logged against this product.</p>
          </div>
          <div *ngFor="let change of item.changes" class="change-card mb-4 border p-4 rounded flex-col gap-2">
             <div class="flex justify-between items-center">
               <div class="flex items-center gap-3">
                  <strong class="font-mono text-primary">{{ change.id }}</strong>
                  <span class="status-badge" [class]="change.status.toLowerCase()">{{ change.status }}</span>
               </div>
               <span class="text-sm text-muted">{{ change.date || 'N/A' }}</span>
             </div>
             <p class="text-sm">{{ change.description }}</p>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Attachments' && item">
          <div *ngIf="item.attachments.length === 0" class="empty-state card p-8 text-center">
             <span class="text-4xl mb-4 block">📎</span>
             <p>No attachments associated with this product.</p>
          </div>
          <div *ngFor="let attachment of item.attachments" class="attachment-card mb-4 border p-4 rounded flex items-center gap-4">
             <span class="text-2xl">{{ getFileIcon(attachment) }}</span>
             <div class="flex-1">
               <div class="font-medium">{{ attachment }}</div>
               <div class="text-sm text-muted">File attachment</div>
             </div>
             <button class="btn btn-secondary btn-sm">Download</button>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'History' && item">
          <div *ngIf="item.history.length === 0" class="empty-state card p-8 text-center">
             <span class="text-4xl mb-4 block">📚</span>
             <p>No history log entries for this product.</p>
          </div>
          <div *ngFor="let entry of item.history" class="history-entry mb-4 border-l-4 pl-4 py-2" style="border-left-color: var(--accent-primary);">
             <div class="flex justify-between items-start">
               <div>
                 <div class="font-medium">{{ entry.action }}</div>
                 <div class="text-sm text-muted">{{ entry.user }} • {{ entry.date }}</div>
               </div>
             </div>
             <p class="text-sm mt-2" *ngIf="entry.details">{{ entry.details }}</p>
          </div>
        </ng-container>

      </div>
    </div>
  `,
  styles: `
    .page-container { animation: fadeIn var(--transition-fast); max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }

    .item-id-block { align-items: center; }
    .sku-badge { background: var(--accent-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; }
    .type-badge { background: var(--bg-surface-hover); color: var(--text-secondary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }

    .lifecycle-badge { font-size: 0.875rem; color: var(--text-secondary); }
    .btn-promote { background: var(--accent-primary); color: white; }

    .tabs { border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem; }
    .tab-btn { padding: 1rem 1.5rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: all var(--transition-fast); }
    .tab-btn:hover { color: var(--text-primary); background: transparent; }
    .tab-btn:focus { outline: none; }
    .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }

    .tab-content { min-height: 400px; }

    .attributes-board { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .attr-group { background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .attr-label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .attr-val { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }

    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; margin-left: 1rem;
    margin-top: 1rem; }

    .table-container { overflow-x: auto; background: var(--bg-surface); box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px; }
    .data-table { width: 100%; min-width: 800px; border-collapse: collapse; }
    .data-table th { background: var(--bg-surface-hover); color: var(--text-secondary); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem 1.25rem; border-bottom: 2px solid var(--border-color); text-align: left; }
    .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); font-size: 0.875rem; }
    .hover-row { transition: background var(--transition-fast); }
    .hover-row:hover { background: var(--bg-surface-hover); }
    .cursor-pointer { cursor: pointer; }

    .text-primary { color: var(--accent-primary); }
    .text-secondary { color: var(--text-secondary); }
    .text-muted { color: var(--text-muted); }
    .text-2xl { font-size: 1.5rem; }
    .font-mono { font-family: monospace; }
    .font-medium { font-weight: 500; }

    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.in-stock { background: #dcfce7; color: #166534; }
    .status-badge.low-stock { background: #fef3c7; color: #92400e; }
    .status-badge.out-of-stock { background: #fee2e2; color: #dc2626; }

    .sub-badge { background: var(--bg-surface-hover); color: var(--text-secondary); padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 0.75rem; }

    .empty-state { text-align: center; color: var(--text-muted); }
    .change-card { background: var(--bg-surface); }
    .attachment-card { background: var(--bg-surface); }
    .history-entry { background: var(--bg-surface); }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .gap-y-6 { row-gap: 1.5rem; }
    .outline-group { border: 1px solid var(--border-color); padding: 1rem; border-radius: 4px; }

    /* Additional utility classes */
    .border { border: 1px solid var(--border-color); }
    .p-4 { padding: 1rem; }
    .rounded { border-radius: 4px; }
    .flex-1 { flex: 1; }
    .mb-8 { margin-bottom: 2rem; }
    .mt-6 { margin-top: 1.5rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .text-center { text-align: center; }
    .text-4xl { font-size: 2.25rem; }
    .block { display: block; }
    .border-l-4 { border-left: 4px solid; }
    .pl-4 { padding-left: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .text-xs { font-size: 0.75rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class ItemDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  item: Product | null = null;
  activeTab = 'Overview';

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
    if (sku) {
      this.item = this.inventoryService.getData().find(p => p.sku === sku) || null;
      if (!this.item) {
        // Item not found, redirect to inventory
        this.router.navigate(['/inventory']);
      }
    } else {
      // No SKU provided, redirect to inventory
      this.router.navigate(['/inventory']);
    }
  }

  canPromoteLifecycle(): boolean {
    if (!this.item) return false;
    const lifecycleOrder = ['Design', 'Prototype', 'Production', 'Obsolete'];
    const currentIndex = lifecycleOrder.indexOf(this.item.lifecycle);
    return currentIndex < lifecycleOrder.length - 1;
  }

  promoteLifecycle() {
    if (!this.item || this.userService.isReadOnly()) return;

    const lifecycleOrder = ['Design', 'Prototype', 'Production', 'Obsolete'] as const;
    const currentIndex = lifecycleOrder.indexOf(this.item.lifecycle);

    if (currentIndex < lifecycleOrder.length - 1) {
      const newLifecycle = lifecycleOrder[currentIndex + 1];
      this.inventoryService.updateProduct(this.item.sku, { lifecycle: newLifecycle });
      this.item.lifecycle = newLifecycle;
    }
  }

  getResolvedBom(): Product[] {
    if (!this.item?.bom) return [];
    return this.item.bom.map(sku => this.inventoryService.getData().find(p => p.sku === sku)).filter(Boolean) as Product[];
  }

  navigateToItem(sku: string) {
    this.router.navigate(['/inventory', sku]);
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'zip': '📦',
      'rar': '📦',
      'default': '📎'
    };
    return icons[extension] || icons['default'];
  }
}