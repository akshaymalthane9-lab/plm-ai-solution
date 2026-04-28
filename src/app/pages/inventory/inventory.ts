import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, Product } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';
import { PlmItemModal } from '../../components/plm-item-modal/plm-item-modal';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PlmItemModal, ItemFormModal],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Inventory Management</h1>
          <p class="text-muted">Manage your supply chain products and stock levels.</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal = true" *ngIf="!userService.isReadOnly()">
          <span>+</span> Add Product
        </button>
      </div>

      <div class="card p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of inventoryService.inventory()" class="hover-row" (click)="selectedItem = item" style="cursor: pointer;">
              <td class="font-mono text-sm" style="color:var(--accent-primary); font-weight:600;">{{ item.sku }}</td>
              <td class="font-medium">{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.quantity }}</td>
              <td>
                <span class="status-badge" [class]="item.status">
                  {{ item.status.replace('-', ' ') }}
                </span>
              </td>
              
              <td>
                <div class="flex gap-2" *ngIf="!userService.isReadOnly()" (click)="$event.stopPropagation()">
                  <button class="btn btn-secondary btn-sm" (click)="openEdit(item)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteItem(item.sku)">Delete</button>
                </div>
                <div *ngIf="userService.isReadOnly()" class="text-muted text-sm" style="font-size: 0.75rem;">View Only</div>
              </td>
            </tr>
            <tr *ngIf="inventoryService.inventory().length === 0">
              <td colspan="6" class="text-center py-8 text-muted">No products found in inventory.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      <app-plm-item-modal 
        *ngIf="selectedItem" 
        [item]="selectedItem" 
        (close)="selectedItem = null">
      </app-plm-item-modal>

      <!-- Form Modal (Create/Edit) -->
      <app-item-form-modal 
        *ngIf="showFormModal" 
        [editItem]="itemToEdit"
        (close)="closeForm()">
      </app-item-form-modal>

      <app-item-form-modal 
        *ngIf="showCreateModal" 
        (close)="showCreateModal = false">
      </app-item-form-modal>
    </div>
  `,
  styles: `
    .page-container { animation: fadeIn var(--transition-fast); }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .text-muted { color: var(--text-muted); font-size: 0.875rem; }
    
    .p-0 { padding: 0; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .font-medium { font-weight: 500; }
    .text-sm { font-size: 0.875rem; }
    
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { 
      background-color: var(--bg-surface-hover);
      color: var(--text-secondary); 
      font-weight: 600; 
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1rem 1.5rem;
      border-bottom: 2px solid var(--border-color); 
    }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.875rem;}
    .hover-row { transition: background var(--transition-fast); background: var(--bg-surface); }
    .hover-row:hover { background: #fdfdfd; }
    
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
    .btn-danger { background: white; border: 1px solid var(--color-danger); color: var(--color-danger); }
    .btn-danger:hover { background: #fee2e2; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class Inventory {
  inventoryService = inject(InventoryService);
  userService = inject(UserService);
  
  selectedItem: Product | null = null;
  itemToEdit: Product | null = null;
  showFormModal = false;
  showCreateModal = false;

  openEdit(item: Product) {
    this.itemToEdit = item;
    this.showFormModal = true;
  }

  closeForm() {
    this.showFormModal = false;
    this.itemToEdit = null;
  }

  deleteItem(sku: string) {
    if (confirm(`SECURITY PROTOCOL: Are you sure you want to permanently purge SKU ${sku} from the Deloitte AI PLM database?`)) {
      this.inventoryService.deleteProduct(sku);
    }
  }
}
