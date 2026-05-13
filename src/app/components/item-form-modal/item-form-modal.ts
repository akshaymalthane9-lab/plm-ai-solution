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
            <h2 class="title">{{ editItem ? 'Edit Enterprise Record' : 'Create product item' }}</h2>
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
                  <label class="form-label" for="sku">Item Number *</label>
                  <input id="sku" type="text" class="form-control" formControlName="sku" placeholder="e.g. ASM-990" [readOnly]="editItem" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="name">Common Name *</label>
                  <input id="name" type="text" class="form-control" formControlName="name" placeholder="Item Name" />
                </div>
             </div>

             <div class="grid-2">
                <!-- <div class="form-group">
                  <label class="form-label" for="type">Item Type *</label>
                  <select id="type" class="form-control" formControlName="type">
                    <option value="Part">Part (Hardware)</option>
                    <option value="Document">Document (Software/Spec)</option>
                  </select>
                </div> -->
                <div class="form-group">
                  <label class="form-label" for="revision">Active Revision *</label>
                  <input id="revision" type="text" class="form-control" formControlName="revision" placeholder="A.01" />
                </div>
             </div>

             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="part">Item Type *</label>
                  <select id="part" class="form-control" formControlName="part" (change)="onPartChange()">
                    <option value="" disabled>Select Item Type</option>
                    <option value="Part">Part</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="document">Document</label>
                  <input id="document" type="text" class="form-control" formControlName="document" placeholder="Enter document reference" />
                </div>
             </div>

             <div class="grid-2" *ngIf="isPartSelected()">
                <div class="form-group">
                  <label class="form-label" for="partType">Part Types *</label>
                  <select id="partType" class="form-control" formControlName="partType" [disabled]="!isPartSelected()" (change)="onPartTypeChange()">
                    <option value="" disabled>Select part type</option>
                    <option value="Electronic">Assembly</option>
                    <option value="Mechanical">Mechanical Part</option>
                    <option value="Electrical">Electrical Part</option>
                    <option value="Fastener">Raw Material</option>
                    <option value="Material">Packaging Material</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="classification">Classification *</label>
                  <select id="classification" class="form-control" formControlName="classification" [disabled]="!isPartSelected()">
                    <option value="" disabled>Select classification</option>
                    <!-- Assembly options -->
                    <ng-container *ngIf="isAssemblySelected()">
                      <option value="Top Assembly">Top Assembly</option>
                      <option value="Sub Assembly">Sub Assembly</option>
                      <option value="Kit Assembly">Kit Assembly</option>
                    </ng-container>
                    <!-- Mechanical Part options -->
                    <ng-container *ngIf="isMechanicalPartSelected()">
                      <option value="Fasteners">Fasteners</option>
                      <option value="Sheet Metal Parts">Sheet Metal Parts</option>
                      <option value="Machined Components">Machined Components</option>
                      <option value="Castings">Castings</option>
                    </ng-container>
                    <!-- Electrical Part options -->
                    <ng-container *ngIf="isElectricalPartSelected()">
                      <option value="PCB">PCB</option>
                      <option value="Connector">Connector</option>
                      <option value="Cable Assembly">Cable Assembly</option>
                      <option value="Semiconductor">Semiconductor</option>
                      <option value="Resistor">Resistor</option>
                    </ng-container>
                    <!-- Raw Material options -->
                    <ng-container *ngIf="isRawMaterialSelected()">
                      <option value="Steel">Steel</option>
                      <option value="Aluminum">Aluminum</option>
                      <option value="Plastic Resin">Plastic Resin</option>
                      <option value="Rubber">Rubber</option>
                      <option value="Chemical Compound">Chemical Compound</option>
                    </ng-container>
                    <!-- Packaging Material options -->
                    <ng-container *ngIf="isPackagingMaterialSelected()">
                      <option value="Carton Box">Carton Box</option>
                      <option value="Label">Label</option>
                      <option value="Pallet">Pallet</option>
                      <option value="Foam Insert">Foam Insert</option>
                      <option value="User Manual">User Manual</option>
                    </ng-container>
                  </select>
                </div>
             </div>

              <div class="form-group">
               <label class="form-label" for="partDescription">Part description</label>
               <textarea id="partDescription" class="form-control" formControlName="partDescription" placeholder="Describe the part (max 1000 characters)" maxlength="1000" style="min-height: 120px; resize: vertical;" (input)="updateDescriptionCount()"></textarea>
               <div class="flex justify-between items-center mt-2">
                 <span class="text-xs text-muted">{{ descriptionCount }}/1000 characters</span>
                 <span *ngIf="descriptionCount >= 1000" class="text-xs" style="color: var(--color-danger);">Maximum 1000 characters reached.</span>
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
    
    .modal-body { padding: 2.5rem; background: var(--bg-app); max-height: 60vh; overflow-y: auto; }
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

  descriptionCount = 0;

  itemForm = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    category: ['', Validators.required],
    type: ['Part', Validators.required],
    lifecycle: ['Preliminary', Validators.required],
    revision: ['A.01', Validators.required],
    part: ['', Validators.required],
    partDescription: ['', Validators.maxLength(1000)],
    document: [''],
    partType: [''],
    classification: [''],
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
        part: (this.editItem as any)?.part || '',
        partDescription: (this.editItem as any)?.partDescription || '',
        document: (this.editItem as any)?.document || '',
        partType: (this.editItem as any)?.partType || '',
        classification: (this.editItem as any)?.classification || '',
        quantity: this.editItem.quantity
      });
      this.onPartChange();
    }
    this.updateDescriptionCount();
  }

  closeModal() {
    this.close.emit();
  }

  isPartSelected(): boolean {
    return this.itemForm.get('part')?.value === 'Part';
  }

  isAssemblySelected(): boolean {
    return this.itemForm.get('partType')?.value === 'Electronic';
  }

  isMechanicalPartSelected(): boolean {
    return this.itemForm.get('partType')?.value === 'Mechanical';
  }

  isElectricalPartSelected(): boolean {
    return this.itemForm.get('partType')?.value === 'Electrical';
  }

  isRawMaterialSelected(): boolean {
    return this.itemForm.get('partType')?.value === 'Fastener';
  }

  isPackagingMaterialSelected(): boolean {
    return this.itemForm.get('partType')?.value === 'Material';
  }

  onPartTypeChange() {
    // Reset classification when part type changes
    this.itemForm.get('classification')?.reset();
  }

  onPartChange() {
    const partTypeControl = this.itemForm.get('partType');
    const classificationControl = this.itemForm.get('classification');
    
    if (this.isPartSelected()) {
      partTypeControl?.setValidators([Validators.required]);
      classificationControl?.setValidators([Validators.required]);
    } else {
      partTypeControl?.clearValidators();
      classificationControl?.clearValidators();
      partTypeControl?.reset();
      classificationControl?.reset();
    }
    
    partTypeControl?.updateValueAndValidity();
    classificationControl?.updateValueAndValidity();
  }

  updateDescriptionCount() {
    const value = this.itemForm.get('partDescription')?.value || '';
    this.descriptionCount = Math.min(value.length, 1000);
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

