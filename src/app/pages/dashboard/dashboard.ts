import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, Product } from '../../services/inventory.service';
import { PlmItemModal } from '../../components/plm-item-modal/plm-item-modal';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PlmItemModal, ItemFormModal],
  template: `
    <div class="dashboard flex-col gap-6">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Deloitte PLM - My Dashboard</h1>
     
        </div>
        <div class="header-actions flex items-center gap-3">
          <button class="btn btn-primary shadow-glow" type="button" (click)="generateReport()">Generate Report</button>
         
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="infotiles grid">
        <div class="infotile card" *ngFor="let tile of tiles">
          <div class="flex justify-between items-start mb-4">
            <h3 class="tile-title">{{ tile.title }}</h3>
            <span class="icon">{{ tile.icon }}</span>
          </div>
          <div class="tile-value">{{ tile.value }}</div>
          <div class="tile-footer flex items-center gap-2" [class.positive]="tile.trend > 0" [class.negative]="tile.trend < 0">
            <span class="trend">{{ tile.trend > 0 ? '↑' : '↓' }} {{ tile.trend }}%</span>
            <span class="text-muted text-xs">vs last month</span>
          </div>
        </div>
      </div>

      <div class="chart-grid grid">
        <div class="chart-card card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">Items Created in Last 1 Month</h3>
            </div>
          </div>
          <div class="chart-pie">
            <div class="pie-plot" aria-label="Items created by category">
              <div class="pie-chart"></div>
              <span class="pie-label electronics">Electronics 36%</span>
              <span class="pie-label automotive">Automotive 24%</span>
              <span class="pie-label consumer">Consumer Goods 19%</span>
              <span class="pie-label industrial">Industrial 13%</span>
              <span class="pie-label healthcare">Healthcare 8%</span>
            </div>
            <div class="pie-legend" aria-hidden="true">
              <div *ngFor="let item of itemCategoryBreakdown">
                <span class="legend-square" [style.background]="item.color"></span>{{ item.name }}
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">Changes Created in Last 1 Month</h3>
            </div>
          </div>
          <div class="bar-chart" aria-label="Changes created by week">
            <div class="bar-y-axis">
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>
            <div class="bar-plot">
              <div class="bar-column" *ngFor="let week of weeklyChanges">
                <div class="bar-fill" [style.height.%]="week.height"></div>
                <span class="bar-label">{{ week.label }}</span>
              </div>
            </div>
            <div class="bar-legend"><span class="legend-square"></span>changes</div>
          </div>
        </div>
      </div>

      <div class="report-summary card" *ngIf="reportVisible">
        <div class="report-header flex justify-between items-center">
          <div>
            <h3 class="report-title">Report Summary</h3>
            <p class="text-muted text-sm">Pending approvals, completed change orders, and owned parts.</p>
          </div>
        </div>
        <div class="report-grid grid">
          <div class="report-card">
            <span class="report-label">Pending approvals for me</span>
            <span class="report-number">{{ reportSummary.pendingApprovals }}</span>
          </div>
          <div class="report-card">
            <span class="report-label">Completed change orders (owner)</span>
            <span class="report-number">{{ reportSummary.completedChanges }}</span>
          </div>
          <div class="report-card">
            <span class="report-label">Parts created by me</span>
            <span class="report-number">{{ reportSummary.partsCreatedByMe }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- The PLM Modals Inject -->
    <app-plm-item-modal 
      *ngIf="selectedItem" 
      [item]="selectedItem" 
      (close)="selectedItem = null">
    </app-plm-item-modal>
    
    <app-item-form-modal *ngIf="showCreateModal" (close)="showCreateModal = false"></app-item-form-modal>
  `,
  styles: `
    .dashboard { animation: fadeIn var(--transition-fast); max-width: 1200px; margin: 0 auto; width: 100%;}
    .page-title { font-size: 1.8rem; margin-bottom: 0.35rem; color: var(--text-primary); font-weight: 700; letter-spacing: -0.03em;}
    .text-muted { color: var(--text-muted); font-size: 0.95rem; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .infotile { padding: 1.75rem; border-radius: var(--border-radius-md); transition: transform var(--transition-fast); border: 1px solid var(--border-color); }
    .infotile:hover { transform: translateY(-4px); box-shadow: var(--shadow-float); border-color: var(--border-color); }
    .tile-title { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; padding: 0;}
    .icon { background: var(--bg-app); padding: 0.5rem; border-radius: 8px;}
    .tile-value { font-size: 2.2rem; font-weight: 700; margin-bottom: 0.75rem; font-family: var(--font-heading); color: var(--text-primary); letter-spacing: -0.03em;}
    .tile-footer { font-size: 0.8rem; }

    .header-actions { align-items: center; }
    .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .chart-card { padding: 1.5rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); min-height: 320px; }
    .chart-card-header { margin-bottom: 1.25rem; }
    .chart-title { margin: 0; font-size: 1rem; color: var(--text-secondary); font-weight: 700; }
    .chart-pie { display: grid; gap: 0.75rem; align-items: center; justify-items: center; }
    .pie-plot { position: relative; width: min(100%, 430px); min-height: 225px; }
    .pie-chart {
      position: absolute;
      left: 50%;
      top: 42%;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      background:
        conic-gradient(
          #65b82f 0 36%,
          #2f95d8 36% 60%,
          #e5a629 60% 79%,
          #7a55c7 79% 92%,
          #cf3d91 92% 100%
        );
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
    }
    .pie-label { position: absolute; font-size: 0.9rem; font-weight: 600; white-space: nowrap; }
    .pie-label.electronics { color: #65b82f; left: 58%; top: 4%; }
    .pie-label.automotive { color: #2f95d8; right: 74%; top: 43%; }
    .pie-label.consumer { color: #c9942b; right: 62%; top: 84%; }
    .pie-label.industrial { color: #7a55c7; left: 66%; top: 78%; }
    .pie-label.healthcare { color: #cf3d91; left: 77%; top: 61%; }
    .pie-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.45rem 0.9rem; width: 100%; color: var(--text-secondary); font-size: 0.9rem; }
    .pie-legend div, .bar-legend { display: inline-flex; align-items: center; gap: 0.35rem; }
    .legend-square { display: inline-block; width: 11px; height: 11px; background: #65b82f; border-radius: 2px; flex: 0 0 auto; }
    .bar-chart { display: grid; grid-template-columns: 42px 1fr; grid-template-rows: 230px auto; align-items: end; width: min(100%, 470px); margin: 0 auto; }
    .bar-y-axis { height: 230px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; padding-right: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }
    .bar-plot { position: relative; height: 230px; display: grid; grid-template-columns: repeat(4, minmax(58px, 1fr)); gap: 1.25rem; align-items: end; border-left: 2px solid #9ca3af; border-bottom: 2px solid #9ca3af; padding: 0 0.5rem; }
    .bar-column { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 0.45rem; min-width: 0; }
    .bar-fill { width: 100%; max-width: 82px; border-radius: 7px 7px 0 0; background: #65b82f; box-shadow: inset -8px 0 0 rgba(87, 158, 42, 0.18), 0 1px 3px rgba(15, 23, 42, 0.14); }
    .bar-label { color: var(--text-secondary); font-size: 0.9rem; white-space: nowrap; }
    .bar-legend { grid-column: 2; justify-content: center; margin-top: 0.7rem; color: #65b82f; font-size: 0.9rem; }
    .report-summary { padding: 1.5rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); }
    .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .report-card { padding: 1rem; border-radius: var(--border-radius-lg); background: var(--bg-app); display: flex; flex-direction: column; gap: 0.35rem; }
    .report-label { font-size: 0.95rem; color: var(--text-secondary); font-weight: 600; }
    .report-number { font-size: 1.85rem; font-weight: 700; color: var(--text-primary); }
    
    .mt-6 { margin-top: 2.5rem; }
    .search-box { background: var(--bg-surface); padding: 1.25rem 2rem; border-radius: 100px; box-shadow: 0 10px 35px -10px rgba(0,0,0,0.1); border: 1px solid var(--border-color); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .search-box:focus-within { box-shadow: 0 15px 45px -15px rgba(134, 188, 37, 0.4); border-color: var(--accent-primary); transform: translateY(-2px); }
    .ext-icon { font-size: 1.6rem; opacity: 0.5; }
    .global-search-input { flex: 1; border: none; background: transparent; font-size: 1.3rem; font-family: var(--font-body); font-weight: 400; outline: none; color: var(--text-primary); }
    .global-search-input::placeholder { color: #a1a1aa; font-weight: 400; }
    
    .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .result-card { padding: 1.5rem; cursor: pointer; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); transition: all var(--transition-fast); border: 1px solid var(--border-color-light); }
    .result-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-float); border-color: var(--border-color); }
    
    .tracking-tight { letter-spacing: -0.01em; }
    .sku-label { color: var(--accent-primary); font-weight: 600; padding: 0.2rem 0.6rem; background: var(--accent-primary-subtle); border-radius: 4px; border: 1px solid rgba(134, 188, 37, 0.25);}
    .rev-badge { background: var(--bg-app); border: 1px solid var(--border-color); padding: 0.2rem 0.6rem; border-radius: 4rem; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
    .name-limit { font-size: 1.25rem; font-weight: 600; line-height: 1.3; margin: 0 0 0.5rem 0; color: var(--text-primary); }
    
    .card-divider { border: 0; background: var(--border-color-light); height: 1px; margin-top: 1.5rem; margin-bottom: 0; width: 100%;}
    
    .empty-results { padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-surface); border: 1px dashed var(--border-color); box-shadow: none; }
    
    .font-mono { font-family: var(--font-heading); }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.8rem; }
    .pt-4 { padding-top: 1.25rem; }
    .mt-auto { margin-top: auto; }
    .shadow-glow { box-shadow: var(--shadow-glow); }
    .btn { transition: all var(--transition-fast); font-weight: 600; border: none; cursor: pointer; }
    .btn-primary { background: var(--accent-primary); color: white; }
    .btn-primary:hover { background: var(--accent-primary-dark, #76ba1b); transform: translateY(-2px); }

    @media (max-width: 640px) {
      .pie-plot { width: 100%; min-height: 260px; }
      .pie-chart { width: 140px; height: 140px; top: 45%; }
      .pie-label { font-size: 0.78rem; }
      .pie-label.electronics { left: 52%; top: 6%; }
      .pie-label.automotive { right: 62%; top: 38%; }
      .pie-label.consumer { right: 45%; top: 82%; }
      .pie-label.industrial { left: 58%; top: 78%; }
      .pie-label.healthcare { left: 63%; top: 55%; }
      .bar-chart { grid-template-columns: 34px 1fr; grid-template-rows: 210px auto; }
      .bar-y-axis, .bar-plot { height: 210px; }
      .bar-plot { gap: 0.6rem; grid-template-columns: repeat(4, minmax(42px, 1fr)); }
      .bar-label { font-size: 0.78rem; }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `
})
export class Dashboard {
  inventorySvc = inject(InventoryService);
  searchQuery = '';
  selectedItem: Product | null = null;
  showCreateModal = false;
  reportVisible = false;
  reportSummary = { pendingApprovals: 0, completedChanges: 0, partsCreatedByMe: 0 };
  itemCategoryBreakdown = [
    { name: 'Electronics', color: '#65b82f' },
    { name: 'Automotive', color: '#2f95d8' },
    { name: 'Consumer Goods', color: '#e5a629' },
    { name: 'Industrial', color: '#7a55c7' },
    { name: 'Healthcare', color: '#cf3d91' }
  ];
  weeklyChanges = [
    { label: 'Week 1', height: 70 },
    { label: 'Week 2', height: 85 },
    { label: 'Week 3', height: 100 },
    { label: 'Week 4', height: 94 }
  ];

  get tiles() {
    return [
      { title: 'Items Created', icon: '📝', value: this.itemsCreatedByMe.length, trend: 5 },
      { title: 'Changes Created', icon: '✅', value: this.changesCreatedThisMonth, trend: -2 },
      { title: 'Pending Approvals', icon: '⏳', value: this.pendingApprovalsForMe, trend: 14 }
    ];
  }

  get currentUserName() {
    return this.inventorySvc.getData().length ? 'Current User' : 'Current User';
  }

  get itemsCreatedByMe(): Product[] {
    const user = 'Current User';
    return this.inventorySvc.getData().filter(product =>
      product.history.some(entry => entry.user === user)
    );
  }

  get changesCreatedThisMonth(): number {
    return this.inventorySvc.getData().flatMap(product => product.changes).length;
  }

  get pendingApprovalsForMe(): number {
    return this.inventorySvc.getData()
      .flatMap(product => product.changes)
      .filter(change => change.status !== 'Released').length;
  }

  generateReport() {
    this.reportSummary = {
      pendingApprovals: this.pendingApprovalsForMe,
      completedChanges: this.inventorySvc.getData().flatMap(product => product.changes).filter(change => change.status === 'Released').length,
      partsCreatedByMe: this.itemsCreatedByMe.length
    };
    this.reportVisible = true;
  }

  getSearchResults(): Product[] {
    if (!this.searchQuery.trim()) return [];
    
    const q = this.searchQuery.toLowerCase();
    return this.inventorySvc.getData().filter(p => 
       p.name.toLowerCase().includes(q) || 
       p.sku.toLowerCase().includes(q) || 
       p.category.toLowerCase().includes(q)
    );
  }

  openItem(item: Product) {
    this.selectedItem = item;
  }
}
