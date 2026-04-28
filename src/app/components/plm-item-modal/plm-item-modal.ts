import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, InventoryService } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-plm-item-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="item" (click)="closeModal()">
      <div class="modal-card flex-col" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="modal-header border-b">
          <div class="flex justify-between items-center w-full">
            <div class="item-id-block flex items-center gap-4">
              <div class="sku-badge font-mono">{{ item.sku }}</div>
              <div class="type-badge">{{ item.type }}</div>
              <h2 class="title">{{ item.name }}</h2>
            </div>
            
            <div class="flex items-center gap-6">
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
               <button class="close-icon-btn flex items-center justify-center" (click)="closeModal()">✕</button>
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="tabs flex mt-8 border-b w-full">
            <button class="tab-btn" [class.active]="activeTab === 'Overview'" (click)="activeTab = 'Overview'">Overview</button>
            <button class="tab-btn" [class.active]="activeTab === 'Details'" (click)="activeTab = 'Details'">Details & Auth</button>
            <button class="tab-btn" [class.active]="activeTab === 'Changes'" (click)="activeTab = 'Changes'">Change Orders</button>
            <button class="tab-btn" [class.active]="activeTab === 'Attachments'" (click)="activeTab = 'Attachments'">Attachments ({{item.attachments.length}})</button>
            <button class="tab-btn" [class.active]="activeTab === 'History'" (click)="activeTab = 'History'">History Log</button>
          </div>
        </div>
        
        <!-- Body Panel -->
        <div class="modal-body">
        
          <ng-container *ngIf="activeTab === 'Overview'">
            <div class="grid-2 attributes-board mb-8">
              <div class="attr-group card p-6 flex-col justify-between">
                <span class="attr-label mb-3 text-secondary">Revision Level</span>
                <span class="attr-val font-mono text-2xl" style="font-size: 1.5rem;">{{ item.revision }}</span>
              </div>
              <div class="attr-group card p-6 flex-col justify-between">
                <span class="attr-label mb-3 text-secondary">Inventory Threshold</span>
                <span class="attr-val flex items-center gap-3" style="font-size: 1.25rem;">
                  <span class="status-badge" [class]="item.status"></span>
                  {{ item.status.replace('-', ' ') }}
                </span>
              </div>
            </div>

            <!-- Visual Toggle & Structure Map -->
            <div class="hierarchy-section card mb-8 p-6">
               <div class="flex justify-between items-center mb-6">
                  <h3 class="section-title">Product Structure Map</h3>
                  <div class="toggle-group select-none">
                     <button class="toggle-btn" [class.active]="bomViewMode === 'Graph'" (click)="bomViewMode = 'Graph'">Graph Map</button>
                     <button class="toggle-btn" [class.active]="bomViewMode === 'Tree'" (click)="bomViewMode = 'Tree'">Hierarchy Tree</button>
                  </div>
               </div>

               <!-- Graph View (SVG) -->
               <div class="graph-container" *ngIf="bomViewMode === 'Graph'">
                  <svg width="100%" height="400" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" class="structure-svg">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#ccc" />
                      </marker>
                    </defs>
                    
                    <!-- Edges (Lines) -->
                    <g *ngFor="let child of getResolvedBom(); let i = index">
                       <line 
                         [attr.x1]="400" [attr.y1]="200" 
                         [attr.x2]="getNodeX(i, getResolvedBom().length)" [attr.y2]="getNodeY(i, getResolvedBom().length)" 
                         stroke="#ddd" stroke-width="2" marker-end="url(#arrowhead)" />
                    </g>
                    
                    <!-- Root Node -->
                    <g class="node root-node">
                       <circle cx="400" cy="200" r="50" fill="var(--accent-primary)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
                       <text x="400" y="205" text-anchor="middle" fill="white" font-weight="700" font-size="12">{{ item.sku }}</text>
                       <text x="400" y="222" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="9">(Main Assembly)</text>
                    </g>

                    <!-- Child Nodes -->
                    <g *ngFor="let child of getResolvedBom(); let i = index" class="node child-node cursor-pointer" (click)="selectChild(child)">
                       <circle [attr.cx]="getNodeX(i, getResolvedBom().length)" [attr.cy]="getNodeY(i, getResolvedBom().length)" r="35" fill="white" stroke="var(--border-color)" stroke-width="2" />
                       <text [attr.x]="getNodeX(i, getResolvedBom().length)" [attr.y]="getNodeY(i, getResolvedBom().length) + 5" text-anchor="middle" fill="var(--text-primary)" font-weight="600" font-size="10">{{ child.sku }}</text>
                       <text [attr.x]="getNodeX(i, getResolvedBom().length)" [attr.y]="getNodeY(i, getResolvedBom().length) + 55" text-anchor="middle" fill="var(--text-secondary)" font-size="10">{{ child.name }}</text>
                    </g>

                    <text *ngIf="getResolvedBom().length === 0" x="400" y="270" text-anchor="middle" fill="#aaa" font-style="italic">No linked components in structure</text>
                  </svg>
               </div>

               <!-- Hierarchy Tree View -->
               <div class="tree-root" *ngIf="bomViewMode === 'Tree'">
                  <div class="tree-item active">
                    <span class="tree-icon">📦</span> {{ item.sku }} (Root)
                    <div class="tree-children ml-6 mt-2 border-l pl-4" *ngIf="item.bom.length > 0">
                       <div *ngFor="let child of getResolvedBom()" class="tree-node hover-row cursor-pointer flex items-center gap-2 py-1" (click)="selectChild(child)">
                          <span class="text-muted">├──</span>
                          <span class="tree-badge" [class]="child.type.toLowerCase()">{{ child.type[0] }}</span>
                          <span class="font-mono text-xs">{{ child.sku }}</span>
                          <span class="text-sm">{{ child.name }}</span>
                       </div>
                    </div>
                    <div *ngIf="item.bom.length === 0" class="text-xs text-muted mt-2 ml-4 italic">Baseline tier - no subcomponents defined.</div>
                  </div>
               </div>
            </div>
            
            <div class="flex justify-between items-end mt-8 mb-4 w-full">
               <h3 class="section-title">Bill of Materials (Flat List)</h3>
               <div class="flex items-center gap-6">
                  <span class="text-xs text-muted">{{ getResolvedBom().length }} assemblies connected</span>
                  
                  <div class="flex gap-2 items-center" *ngIf="!userService.isReadOnly()">
                     <select #bomSelect class="form-control" style="padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.8rem; background: var(--bg-surface);">
                        <option value="" disabled selected>Select SKU to link...</option>
                        <option *ngFor="let opt of getAttachableBoms()" [value]="opt.sku">
                          {{ opt.sku }} ({{ opt.name }})
                        </option>
                     </select>
                     <button class="btn btn-secondary" style="padding: 0.4rem 1rem;" (click)="attachBom(bomSelect.value); bomSelect.value = ''">Link Item</button>
                  </div>
               </div>
            </div>
            
            <div class="table-container border rounded">
               <table class="data-table">
                 <thead>
                   <tr>
                     <th>Component SKU</th>
                     <th>Item Name</th>
                     <th>Category</th>
                     <th>Lifecycle</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr *ngFor="let child of getResolvedBom()" class="hover-row cursor-pointer" (click)="selectChild(child)">
                      <td class="font-mono text-primary font-medium">{{ child.sku }}</td>
                      <td class="font-medium">{{ child.name }}</td>
                      <td>{{ child.category }}</td>
                      <td><span class="sub-badge">{{ child.lifecycle }}</span></td>
                   </tr>
                   <tr *ngIf="getResolvedBom().length === 0">
                      <td colspan="4" class="text-center py-12 text-muted">No BOM components attached to this entity hierarchy.</td>
                   </tr>
                 </tbody>
               </table>
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab === 'Details'">
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

          <ng-container *ngIf="activeTab === 'Changes'">
            <div *ngIf="item.changes.length === 0" class="empty-state card">
               <span class="text-4xl mb-4 block">📝</span>
               No active Engineering Change Notices (ECN) logged against this product.
            </div>
            <div *ngFor="let change of item.changes" class="change-card mb-4 border p-4 rounded flex-col gap-2">
               <div class="flex justify-between items-center">
                 <div class="flex items-center gap-3">
                    <strong class="font-mono text-primary">{{ change.id }}</strong>
                    <span class="status-badge" [class]="change.status.toLowerCase()">{{ change.status }}</span>
                 </div>
                 <button 
                   *ngIf="change.status !== 'Released' && !userService.isReadOnly()" 
                   (click)="promoteChange(change.id)"
                   class="btn btn-promote btn-sm">
                   Advance Change →
                 </button>
               </div>
               <p class="text-secondary tracking-wide text-sm">{{ change.description }}</p>
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab === 'Attachments'">
            <div *ngIf="item.attachments.length === 0" class="empty-state card">
               <span class="text-4xl mb-4 block">📁</span>
               No technical sheets, CAD files, or vendor PDFs attached.
            </div>
            <div class="flex gap-4 flex-wrap">
               <div *ngFor="let att of item.attachments" class="attachment-chip flex items-center gap-3">
                  <span class="file-icon">📄</span>
                  <span class="text-sm font-medium">{{ att }}</span>
               </div>
            </div>
          </ng-container>

          <ng-container *ngIf="activeTab === 'History'">
            <div class="timeline flex-col gap-5 mt-4 ml-2">
               <div *ngFor="let log of item.history" class="timeline-event flex gap-6 w-full">
                  <div class="timeline-dot"></div>
                  <div class="timeline-box card p-5 w-full flex-col justify-center">
                    <div class="text-sm font-semibold text-primary mb-2">{{ log.action }}</div>
                    <div class="text-xs text-muted font-mono">{{ log.date | date:'medium' }} — authenticated as <strong>{{ log.user }}</strong></div>
                  </div>
               </div>
            </div>
          </ng-container>

        </div>
        
        <div class="modal-footer border-t">
          <div class="flex justify-between items-center w-full">
             <span class="text-xs text-muted font-mono">ID: {{ item.id }}</span>
             <button class="btn btn-primary lg-btn" (click)="closeModal()">Done</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay { position: fixed; inset: 0; background: rgba(10, 15, 25, 0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); animation: fadeIn var(--transition-fast); }
    .modal-card { width: 950px; max-width: 95vw; height: 85vh; background: var(--bg-app); border-radius: var(--border-radius-lg); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; display: flex; flex-direction: column; }
    
    .modal-header { padding: 2rem 2.5rem 0; background: var(--bg-surface); }
    .item-id-block { margin-top: 0.5rem; }
    .sku-badge { background: #f1f3f4; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: var(--text-secondary); border: 1px solid var(--border-color); }
    .type-badge { background: var(--accent-primary-subtle); color: var(--accent-primary); border: 1px solid var(--accent-primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .title { font-size: 1.75rem; margin: 0; color: var(--text-primary); font-family: var(--font-heading); font-weight: 600;}
    
    .lifecycle-badge { background: var(--bg-surface); color: var(--text-secondary); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; border: 1px solid var(--border-color); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .lifecycle-badge strong { color: var(--accent-primary); }
    
    .btn-promote { background: var(--accent-primary); color: white; border: none; font-weight: 600; padding: 0.4rem 1rem; border-radius: 6px; transition: all 0.2s; }
    .btn-promote:hover:not(:disabled) { background: #76a521; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(134, 188, 37, 0.3); }
    .btn-promote:disabled { opacity: 0.5; cursor: not-allowed; }

    .close-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-app); border: 1px solid var(--border-color); font-size: 1.1rem; color: var(--text-muted); transition: all var(--transition-fast); }
    .close-icon-btn:hover { background: #fce8e6; color: var(--color-danger); border-color: #fad2ce; }
    
    .tabs { margin-top: 2rem; border-bottom: 1px solid var(--border-color); }
    .tab-btn { background: none; border: none; padding: 1.2rem 2rem; margin-right: 0.5rem; font-size: 0.95rem; font-weight: 500; color: var(--text-muted); cursor: pointer; border-bottom: 3px solid transparent; transition: all var(--transition-fast); position: relative; top: 1px; }
    .tab-btn:hover { color: var(--text-primary); background: var(--bg-app); border-top-left-radius: 8px; border-top-right-radius: 8px;}
    .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
    
    .modal-body { flex: 1; overflow-y: auto; background: var(--bg-app); padding: 3rem; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .gap-y-6 { row-gap: 1.5rem; }
    
    .p-6 { padding: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    
    .attr-group { display: flex; flex-direction: column; justify-content: center; }
    .outline-group { border-left: 3px solid var(--accent-primary-subtle); padding-left: 1rem; }
    .attr-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .attr-val { font-size: 1.1rem; color: var(--text-primary); font-weight: 500; }
    
    .section-title { font-size: 1.1rem; margin: 0; color: var(--text-secondary); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; font-weight: 600;}
    .mt-8 { margin-top: 2rem; }
    
    .toggle-group { display: flex; background: #f1f3f4; padding: 0.25rem; border-radius: 8px; gap: 0.25rem; }
    .toggle-btn { border: none; background: transparent; padding: 0.4rem 1rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .toggle-btn.active { background: white; color: var(--accent-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

    .graph-container { background: #fcfcfd; border: 1px dashed #e2e8f0; border-radius: 12px; margin-top: 1rem; position: relative; overflow: hidden; }
    .structure-svg { display: block; }
    .node circle { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .child-node:hover circle { r: 40; stroke: var(--accent-primary); stroke-width: 3; }
    .child-node:hover text { font-weight: 700; fill: var(--accent-primary); }

    .tree-root { margin-top: 1rem; padding: 1rem; background: #fafafa; border-radius: 8px; border: 1px solid var(--border-color); }
    .tree-badge { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-size: 0.6rem; font-weight: 700; color: white; }
    .tree-badge.part { background: #3b82f6; }
    .tree-badge.document { background: #8b5cf6; }

    .table-container { background: var(--bg-surface); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { background: #fafafa; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
    .hover-row:hover { background: #fcfcfd; }
    .sub-badge { padding: 0.2rem 0.5rem; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); }
    .cursor-pointer { cursor: pointer; }
    
    .change-card { background: var(--bg-surface); box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid var(--accent-primary-subtle); }
    .change-card .status-badge.released { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .tracking-wide { letter-spacing: 0.025em; line-height: 1.6; }
    
    .attachment-chip { padding: 0.75rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-sm); transition: transform 0.2s; cursor: pointer; }
    .attachment-chip:hover { transform: translateY(-2px); border-color: var(--accent-primary-subtle); }
    .file-icon { font-size: 1.2rem; }
    
    .timeline { position: relative; }
    .timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: var(--accent-primary-subtle); }
    .timeline-event { position: relative; z-index: 1; align-items: stretch; }
    .timeline-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--bg-surface); border: 3px solid var(--accent-primary); flex-shrink: 0; margin-top: 1rem; box-shadow: 0 0 0 4px var(--bg-app); }
    .timeline-box { box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); }
    
    .empty-state { padding: 4rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); }
    .block { display: block; }
    
    .modal-footer { padding: 1.5rem 2.5rem; background: var(--bg-surface); display: flex; }
    .lg-btn { padding: 0.6rem 2rem; font-size: 1rem; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class PlmItemModal {
  @Input() item: Product | null = null;
  @Output() close = new EventEmitter<void>();
  
  activeTab: 'Overview' | 'Details' | 'Changes' | 'Attachments' | 'History' = 'Overview';
  bomViewMode: 'Tree' | 'Graph' = 'Graph'; // Default to Graph for "WOW" factor
  
  inventorySvc = inject(InventoryService);
  userService = inject(UserService);

  getResolvedBom(): Product[] {
    if (!this.item) return [];
    return this.inventorySvc.getBomResolved(this.item.sku);
  }

  // Graph Layout Helpers
  getNodeX(index: number, total: number): number {
    if (total === 0) return 400;
    const radius = 180;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return 400 + radius * Math.cos(angle);
  }

  getNodeY(index: number, total: number): number {
    if (total === 0) return 200;
    const radius = 120;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return 200 + radius * Math.sin(angle);
  }

  getAttachableBoms(): Product[] {
    if (!this.item) return [];
    const currentBom = this.item.bom || [];
    return this.inventorySvc.getData().filter(p => p.sku !== this.item!.sku && !currentBom.includes(p.sku));
  }

  attachBom(childSku: string) {
    if (!this.item || !childSku) return;
    this.inventorySvc.attachBomComponent(this.item.sku, childSku);
    this.refreshItem();
  }

  canPromoteLifecycle(): boolean {
    if (!this.item) return false;
    return this.item.lifecycle !== 'Obsolete';
  }

  promoteLifecycle() {
    if (!this.item) return;
    this.inventorySvc.promoteLifecycle(this.item.sku);
    this.refreshItem();
  }

  promoteChange(changeId: string) {
    if (!this.item) return;
    this.inventorySvc.promoteChangeStage(this.item.sku, changeId);
    this.refreshItem();
  }

  private refreshItem() {
    this.item = this.inventorySvc.getData().find(p => p.sku === this.item!.sku) || this.item;
  }

  selectChild(child: Product) {
     this.item = child;
     this.activeTab = 'Overview';
  }

  closeModal() {
    this.close.emit();
  }
}
