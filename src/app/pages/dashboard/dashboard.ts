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
          <h1 class="page-title">Deloitte AI PLM Launchpad</h1>
          <p class="text-muted">Global Search and Organization Management</p>
        </div>
        <button class="btn btn-primary shadow-glow" (click)="showCreateModal = true" style="padding: 0.75rem 1.5rem; border-radius: 40px;">
           <span style="margin-right: 4px;">+</span> Create Product Record
        </button>
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

      <!-- Detailed PLM Search Entry Point -->
      <div class="search-container mt-6">
         <div class="search-box flex items-center gap-4">
           <span class="ext-icon">🔍</span>
           <input 
             type="text" 
             class="global-search-input" 
             placeholder="Search Master Organization Database by SKU, Name, or Hierarchy..." 
             [(ngModel)]="searchQuery"
           />
           <button class="btn btn-primary shadow-glow text-sm" (click)="searchQuery = ''" *ngIf="searchQuery">Clear Search</button>
         </div>

         <!-- Enterprise Results Grid -->
         <div class="results-grid mt-6" *ngIf="getSearchResults().length > 0">
            <div class="result-card card flex-col" *ngFor="let item of getSearchResults()" (click)="openItem(item)">
               <div class="flex justify-between items-start mb-3">
                 <span class="font-mono text-sm tracking-tight sku-label">{{ item.sku }}</span>
                 <span class="rev-badge">{{ item.revision }}</span>
               </div>
               <h3 class="name-limit">{{ item.name }}</h3>
               
               <hr class="card-divider mt-auto" />
               
               <div class="details pt-4 flex justify-between items-center text-xs text-muted">
                 <span class="lifecycle-text">State: <strong class="text-primary">{{ item.lifecycle }}</strong></span>
                 <span class="status-badge" [class]="item.status">{{ item.status.replace('-', ' ') }}</span>
               </div>
            </div>
         </div>
         
         <div class="empty-results card" *ngIf="searchQuery && getSearchResults().length === 0">
            <div class="empty-icon text-4xl mb-4">📭</div>
            <h4 class="text-secondary font-medium">No entities matched your query.</h4>
            <p class="text-muted text-center" style="margin:0;">Try adjusting your search criteria across SKU or descriptions.</p>
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

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `
})
export class Dashboard {
  inventorySvc = inject(InventoryService);
  searchQuery = '';
  selectedItem: Product | null = null;
  showCreateModal = false;

  tiles = [
    { title: 'Pending Engineering Changes', icon: '📝', value: '14', trend: 5 },
    { title: 'New Lifecycle Approvals', icon: '✅', value: '3', trend: -2 },
    { title: 'Bill of Materials Loaded', icon: '📦', value: '1,402', trend: 14 }
  ];

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
