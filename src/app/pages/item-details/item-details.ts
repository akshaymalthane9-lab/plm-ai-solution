import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, InventoryService } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

type ItemDetailTab = 'Overview' | 'Changes' | 'Relationship' | 'WhereUsed' | 'History';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center mt-4" *ngIf="item">
        <div>
          <div class="title-row flex items-center gap-4">
            <h1 class="page-title font-mono">{{ item.sku }}</h1>
            <span class="type-badge">{{ item.lifecycle }}</span>
            <span class="revision-pill">Revision {{ item.revision }}</span>
          </div>
        
        </div>

        <div class="flex items-center gap-4">
          <button class="btn btn-secondary" routerLink="/inventory">Back to Items</button>
      
        </div>
      </div>

      <div class="tabs flex border-b w-full mb-6">
        <button class="tab-btn" [class.active]="activeTab === 'Overview'" (click)="activeTab = 'Overview'">Item Overview</button>
        <button class="tab-btn" [class.active]="activeTab === 'Changes'" (click)="activeTab = 'Changes'">Changes</button>
        <button class="tab-btn" [class.active]="activeTab === 'Relationship'" (click)="activeTab = 'Relationship'">Relationship</button>
        <button class="tab-btn" [class.active]="activeTab === 'WhereUsed'" (click)="activeTab = 'WhereUsed'">Where Used</button>
        <button class="tab-btn" [class.active]="activeTab === 'History'" (click)="activeTab = 'History'">History</button>
      </div>

      <div class="tab-content" *ngIf="item">
        <ng-container *ngIf="activeTab === 'Overview'">
          <section class="item-overview-panel">
            <button class="btn overview-edit" type="button" [disabled]="userService.isReadOnly()">Edit</button>

            <div class="overview-details">
              <div class="overview-row">
                <span class="overview-label">Part Number:</span>
                <span class="overview-value text-primary font-mono">{{ item.sku }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Unit of Measure:</span>
                <span class="overview-value">{{ getUnitOfMeasure() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Name:</span>
                <span class="overview-value">{{ item.name }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Classification:</span>
                <span class="overview-value">{{ getPartTypeLabel() }} | {{ getClassificationLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Type:</span>
                <span class="overview-value">{{ getPartTypeLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Material:</span>
                <span class="overview-value">{{ getMaterialLabel() }}</span>
              </div>
              <div class="overview-row description-row">
                <span class="overview-label">Part Description:</span>
                <div>
                  <div class="description-box">{{ getPartDescription() }}</div>
                  <div class="character-count">{{ getPartDescription().length }}/1000</div>
                </div>
              </div>
              <div class="overview-row">
                <span class="overview-label">Color/Finish:</span>
                <span class="overview-value">{{ getColorFinishLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Lifecycle Status:</span>
                <span class="overview-value">{{ item.lifecycle }}</span>
              </div>
            </div>
          </section>

          <div class="overview-divider"></div>

          <section class="bom-overview">
            <h3 class="bom-title">BOM</h3>
            <div class="bom-actions" *ngIf="!userService.isReadOnly()">
              <button class="btn bom-btn" type="button">Add</button>
              <button class="btn bom-btn" type="button">Remove</button>
              <button class="btn bom-btn" type="button">Compare</button>
            </div>

            <div class="table-container border rounded">
               <table class="data-table bom-table">
                 <thead>
                   <tr>
                     <th>Item Number</th>
                     <th>Description</th>
                     <th>Revision</th>
                     <th>Lifecycle Phase</th>
                     <th>Qty</th>
                     <th>BOM Level</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr *ngFor="let child of getResolvedBom(); let i = index" class="hover-row cursor-pointer" (click)="navigateToItem(child.sku)">
                      <td class="font-mono font-medium"><span [class.bom-child-indent]="i > 0">{{ child.sku }}</span></td>
                      <td>{{ getBomDescription(child) }}</td>
                      <td>{{ child.revision }}</td>
                      <td>{{ child.lifecycle }}</td>
                      <td>{{ getBomQuantity(i) }}</td>
                      <td>{{ getBomLevel(i) }}</td>
                   </tr>
                   <tr *ngIf="getResolvedBom().length === 0">
                      <td colspan="6" class="text-center py-12 text-muted">No BOM components attached to this item.</td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </section>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Relationship'">
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

        <ng-container *ngIf="activeTab === 'WhereUsed'">
          <div class="empty-state card p-8 text-center">
            <p>No parent assemblies currently reference this item.</p>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Changes'">
          <div *ngIf="item.changes.length === 0" class="empty-state card p-8 text-center">
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

        <ng-container *ngIf="activeTab === 'History'">
          <div *ngIf="item.history.length === 0" class="empty-state card p-8 text-center">
             <p>No history log entries for this product.</p>
          </div>
          <div *ngFor="let entry of item.history" class="history-entry mb-4 border-l-4 pl-4 py-2">
             <div class="font-medium">{{ entry.action }}</div>
             <div class="text-sm text-muted">{{ entry.user }} - {{ entry.date }}</div>
             <p class="text-sm mt-2" *ngIf="entry.details">{{ entry.details }}</p>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: `
    .page-container { animation: fadeIn var(--transition-fast); max-width: 1200px; margin: 0 auto; }
    .page-title { font-size: 1.7rem; margin: 0; color: var(--text-primary); }
    .item-subtitle { margin-top: 0.45rem; color: var(--text-secondary); }
    .type-badge { background: var(--accent-primary-subtle); color: var(--accent-primary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .revision-pill { color: var(--text-secondary); border: 1px solid var(--border-color); padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.75rem; }
    .btn-promote { background: var(--accent-primary); color: white; }

    .tabs { border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem; }
    .tab-btn { padding: 1rem 1.5rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all var(--transition-fast); text-transform: uppercase; }
    .tab-btn:hover { color: var(--text-primary); background: transparent; }
    .tab-btn:focus { outline: none; }
    .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }

    .tab-content { min-height: 400px; }
    .item-overview-panel { position: relative; padding-top: 1.5rem; }
    .overview-edit { position: absolute; top: 1.5rem; right: 0; padding: 0.55rem 1rem; border-radius: 4px; background: var(--text-secondary); color: #fff; border: 0; font-size: 0.75rem; text-transform: uppercase; }
    .overview-details { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); column-gap: 4rem; row-gap: 1.35rem; padding: 2rem 5rem 1rem 0; }
    .overview-row { display: grid; grid-template-columns: 145px minmax(0, 1fr); align-items: start; gap: 1.25rem; }
    .overview-row:nth-child(2n) { grid-template-columns: 165px minmax(0, 1fr); }
    .overview-label { font-weight: 700; color: var(--text-secondary); line-height: 1.4; }
    .overview-value { color: var(--text-primary); line-height: 1.4; }
    .description-row { grid-row: span 2; }
    .description-box { min-height: 70px; padding: 0.85rem 1rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-surface); color: var(--text-primary); line-height: 1.45; }
    .character-count { margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted); }
    .overview-divider { height: 2px; background: var(--text-primary); opacity: 0.8; margin: 1.5rem 0 1.25rem; }
    .bom-title { margin: 0 0 1rem; font-size: 1.35rem; color: var(--text-primary); font-weight: 700; }
    .bom-actions { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .bom-btn { padding: 0.5rem 0.85rem; border-radius: 4px; background: var(--text-secondary); color: #fff; border: 0; font-size: 0.75rem; text-transform: uppercase; }

    .table-container { overflow-x: auto; background: var(--bg-surface); box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 4px; }
    .data-table { width: 100%; min-width: 800px; border-collapse: collapse; }
    .data-table th { background: var(--bg-surface-hover); color: var(--text-primary); font-weight: 700; font-size: 0.82rem; padding: 1rem 1.25rem; border-bottom: 2px solid var(--border-color); text-align: left; }
    .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-secondary); }
    .hover-row { transition: background var(--transition-fast); }
    .hover-row:hover { background: var(--bg-surface-hover); }
    .cursor-pointer { cursor: pointer; }
    .bom-child-indent { display: inline-block; padding-left: 1.5rem; position: relative; }
    .bom-child-indent::before { content: 'L-'; position: absolute; left: 0; color: var(--text-muted); }

    .attr-group { background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .attr-label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .attr-val { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }

    .text-primary { color: var(--accent-primary); }
    .text-secondary { color: var(--text-secondary); }
    .text-muted { color: var(--text-muted); }
    .font-mono { font-family: monospace; }
    .font-medium { font-weight: 500; }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.released { background: #dcfce7; color: #166534; }
    .empty-state { text-align: center; color: var(--text-muted); }
    .change-card, .history-entry { background: var(--bg-surface); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .gap-y-6 { row-gap: 1.5rem; }
    .outline-group { border: 1px solid var(--border-color); padding: 1rem; border-radius: 4px; }
    .border { border: 1px solid var(--border-color); }
    .p-4 { padding: 1rem; }
    .p-8 { padding: 2rem; }
    .rounded { border-radius: 4px; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .text-center { text-align: center; }
    .border-l-4 { border-left: 4px solid var(--accent-primary); }
    .pl-4 { padding-left: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

    @media (max-width: 840px) {
      .page-header { align-items: flex-start; flex-direction: column; gap: 1rem; }
      .overview-details { grid-template-columns: 1fr; padding-right: 0; }
      .overview-row, .overview-row:nth-child(2n) { grid-template-columns: 1fr; gap: 0.3rem; }
      .overview-edit { position: static; margin-left: auto; display: block; width: fit-content; }
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class ItemDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  item: Product | null = null;
  activeTab: ItemDetailTab = 'Overview';

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
    if (sku) {
      this.item = this.inventoryService.getData().find(p => p.sku === sku) || null;
      if (!this.item) {
        this.router.navigate(['/inventory']);
      }
    } else {
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
    return this.item.bom
      .map(sku => this.inventoryService.getData().find(p => p.sku === sku))
      .filter(Boolean) as Product[];
  }

  navigateToItem(sku: string) {
    this.router.navigate(['/inventory', sku]);
  }

  getPartTypeLabel(): string {
    return this.item?.partType || this.item?.part || this.item?.type || 'Part';
  }

  getUnitOfMeasure(): string {
    return this.item?.type === 'Document' ? 'File' : 'kg';
  }

  getClassificationLabel(): string {
    return this.item?.classification || this.item?.category || 'Unclassified';
  }

  getMaterialLabel(): string {
    return this.item?.category === 'Hardware' ? 'Aluminium 6061-T6' : 'Not applicable';
  }

  getPartDescription(): string {
    return this.item?.partDescription || this.item?.name || '';
  }

  getColorFinishLabel(): string {
    return this.item?.type === 'Document' ? 'Not applicable' : 'Powder Coated';
  }

  getBomDescription(child: Product): string {
    return child.partDescription || child.name;
  }

  getBomQuantity(index: number): number {
    return index === 0 ? 2 : 1;
  }

  getBomLevel(index: number): number {
    return index + 1;
  }
}
