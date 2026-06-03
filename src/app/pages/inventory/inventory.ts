import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, Product } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemFormModal],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">My Items</h1>
         
        </div>
        <button class="btn btn-primary" (click)="showCreateModal = true" *ngIf="!userService.isReadOnly()">
          <span>+</span> Create Item
        </button>
      </div>

      <div class="card p-0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Item Number</th>
              <th>Common Name </th>
              <th>Active Revision</th>
              <th>Item Type </th>
              <th>Type</th>
              <th>Classification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of inventoryService.inventory()" class="hover-row" (click)="navigateToItem(item.sku)" style="cursor: pointer;">
              <td class="font-mono text-sm" style="color:var(--accent-primary); font-weight:600;">{{ item.sku }}</td>
              <td class="font-medium">{{ item.name }}</td>
              <td>{{ item.revision }}</td>
              <td>{{ item.part || item.type }}</td>
              <td>{{ item.partType || '—' }}</td>
              <td>{{ item.classification || '—' }}</td>
              
              <td>
                <div class="item-actions" *ngIf="!userService.isReadOnly()" (click)="$event.stopPropagation()">
                  <button class="btn btn-secondary btn-sm" (click)="openEdit(item)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="openDeleteConfirm(item)">Delete</button>
                </div>
                <div *ngIf="userService.isReadOnly()" class="text-muted text-sm" style="font-size: 0.75rem;">View Only</div>
              </td>
            </tr>
            <tr *ngIf="inventoryService.inventory().length === 0">
              <td colspan="7" class="text-center py-8 text-muted">No products found in inventory.</td>
            </tr>
          </tbody>
        </table>
      </div>

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

      <div *ngIf="showDeleteConfirm" class="confirm-modal-overlay">
        <div class="confirm-modal card">
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete <strong>{{ deleteCandidate?.sku }}</strong>?</p>
          <p class="confirm-subtitle">This action cannot be undone.</p>
          <div class="confirm-actions flex gap-2">
            <button class="btn btn-secondary" type="button" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" type="button" (click)="confirmDelete()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-container { animation: fadeIn var(--transition-fast); }
    .page-header { margin-bottom: 1.5rem; margin-top: 1.5rem;}
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

    .item-actions { display: inline-flex; gap: 0.75rem; }
    .item-actions button { min-width: 72px; }
    
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
    .btn-danger { background: white; border: 1px solid var(--color-danger); color: var(--color-danger); }
    .btn-danger:hover { background: #fee2e2; }

    .confirm-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.65);
      padding: 1.5rem;
    }

    .confirm-modal {
      max-width: 420px;
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.75rem;
      text-align: center;
      box-shadow: 0 18px 60px rgba(15, 23, 42, 0.18);
    }

    .confirm-modal h2 {
      margin: 0;
      margin-bottom: 0.75rem;
      font-size: 1.25rem;
    }

    .confirm-modal p {
      margin: 0.5rem 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .confirm-subtitle {
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .confirm-actions {
      justify-content: center;
      margin-top: 1.5rem;
      gap: 1rem;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class Items {
  inventoryService = inject(InventoryService);
  userService = inject(UserService);
  router = inject(Router);
  
  itemToEdit: Product | null = null;
  showFormModal = false;
  showCreateModal = false;
  showDeleteConfirm = false;
  deleteCandidate: Product | null = null;

  navigateToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  openEdit(item: Product) {
    this.itemToEdit = item;
    this.showFormModal = true;
  }

  closeForm() {
    this.showFormModal = false;
    this.itemToEdit = null;
  }

  openDeleteConfirm(item: Product) {
    this.deleteCandidate = item;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteCandidate = null;
  }

  confirmDelete() {
    if (this.deleteCandidate) {
      this.inventoryService.deleteProduct(this.deleteCandidate.sku);
    }
    this.cancelDelete();
  }
}
