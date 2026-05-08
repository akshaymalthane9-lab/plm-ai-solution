import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, Product } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-item-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-card flex-col" (click)="$event.stopPropagation()">
        
        <div class="modal-header border-b">
          <div class="flex justify-between items-center w-full">
            <h2 class="title">{{ editItem ? 'Edit Enterprise Record' : 'Create Enterprise Record' }}</h2>
            <button class="close-icon-btn flex items-center justify-center" (click)="closeModal()">✕</button>
          </div>
          <p class="text-muted mt-2">
            {{ editItem ? 'Modify existing baseline attributes for ' + editItem.sku : 'Initialize a new master product entity into the PLM network.' }}
          </p>
        </div>
        
        <div class="modal-body p-6">
           <div *ngIf="userService.isReadOnly()" class="card p-4 bg-danger mb-6" style="background:#fef2f2; border-color:#fca5a5; color:#dc2626;">
              <strong>Security Protocol:</strong> Your active Assessor role restricts core mutation capabilities.
           </div>

           <form [formGroup]="itemForm" class="flex-col gap-y-6" *ngIf="!userService.isReadOnly()">
             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="sku">Primary SKU (Identifier) *</label>
                  <input id="sku" type="text" class="form-control" formControlName="sku" placeholder="e.g. ASM-990" [readOnly]="editItem" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="name">Common Name *</label>
                  <input id="name" type="text" class="form-control" formControlName="name" placeholder="Item Name" />
                </div>
             </div>

             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="category">Functional Category *</label>
                  <select id="category" class="form-control" formControlName="category">
                    <option value="" disabled>Select categorical domain</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Hardware Subcomponent">Hardware Subcomponent</option>
                    <option value="Software Manifest">Software Manifest</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="lifecycle">Target State *</label>
                  <select id="lifecycle" class="form-control" formControlName="lifecycle">
                    <option value="Design">Design (WIP)</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Production">Production</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                </div>
             </div>
             
             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="type">Engineering Type *</label>
                  <select id="type" class="form-control" formControlName="type">
                    <option value="Part">Part (Hardware)</option>
                    <option value="Document">Document (Software/Spec)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="revision">Active Revision *</label>
                  <input id="revision" type="text" class="form-control" formControlName="revision" placeholder="A.01" />
                </div>
             </div>
             
             <div class="grid-2" *ngIf="editItem">
                <div class="form-group">
                  <label class="form-label" for="quantity">Inventory Quantity</label>
                  <input id="quantity" type="number" class="form-control" formControlName="quantity" />
                </div>
             </div>
           </form>
        </div>
        
        <div class="modal-footer border-t bg-surface">
          <div class="flex justify-end items-center w-full gap-4">
             <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
             <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="!itemForm.valid || userService.isReadOnly()">
               {{ editItem ? 'Update Record' : 'Add Record' }}
             </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); animation: fadeIn var(--transition-fast); }
    .modal-card { width: 700px; max-width: 95vw; background: var(--bg-surface); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-float); overflow: hidden; display: flex; flex-direction: column; }
    
    .modal-header { padding: 2rem 2.5rem 1rem; background: var(--bg-surface); }
    .title { font-size: 1.5rem; margin: 0; color: var(--text-primary); font-weight: 600; letter-spacing:-0.03em;}
    .close-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: 1px solid transparent; font-size: 1.1rem; color: var(--text-muted); transition: all var(--transition-fast); }
    .close-icon-btn:hover { background: var(--bg-app); color: var(--text-primary); }
    
    .modal-body { padding: 2.5rem; background: var(--bg-app); }
    .modal-footer { padding: 1.5rem 2.5rem; display: flex; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .gap-y-6 { row-gap: 1.5rem; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class ItemFormModal implements OnInit {
  @Input() editItem: Product | null = null;
  @Output() close = new EventEmitter<void>();
  
  fb = inject(FormBuilder);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  itemForm = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    category: ['', Validators.required],
    type: ['Part', Validators.required],
    lifecycle: ['Design', Validators.required],
    revision: ['A.01', Validators.required],
    quantity: [0]
  });

  ngOnInit() {
    if (this.editItem) {
      this.itemForm.patchValue({
        sku: this.editItem.sku,
        name: this.editItem.name,
        category: this.editItem.category,
        type: this.editItem.type,
        lifecycle: this.editItem.lifecycle,
        revision: this.editItem.revision,
        quantity: this.editItem.quantity
      });
    }
  }

  closeModal() {
    this.close.emit();
  }

  onSubmit() {
    if (this.itemForm.valid && !this.userService.isReadOnly()) {
      const formValue = this.itemForm.value;
      
      if (this.editItem) {
        this.inventoryService.updateProduct(this.editItem.sku, formValue as Partial<Product>);
      } else {
        this.inventoryService.addProduct(formValue as Partial<Product>);
      }
      
      this.closeModal();
    }
  }
}

