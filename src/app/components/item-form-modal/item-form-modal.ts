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
            <h2 class="title">{{ editItem ? 'Edit Enterprise Record' : 'Create Item' }}</h2>
            <button class="close-icon-btn flex items-center justify-center" (click)="closeModal()">✕</button>
          </div>
       
        </div>
        
        <div class="modal-body p-6">
           <div *ngIf="userService.isReadOnly()" class="card p-4 bg-danger mb-6" style="background:#fef2f2; border-color:#fca5a5; color:#dc2626;">
              <strong>Security Protocol:</strong> Your active Assessor role restricts core mutation capabilities.
           </div>

           <form [formGroup]="itemForm" class="flex-col gap-y-6" *ngIf="!userService.isReadOnly()">
             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="sku">Item Number *</label>
                  <input id="sku" type="text" class="form-control" formControlName="sku" placeholder="e.g. ASM-990" />
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
                  <label class="form-label" for="partType">Part Type *</label>
                  <select id="partType" class="form-control" formControlName="partType" [disabled]="!isPartSelected()" (change)="onPartTypeChange()">
                    <option value="" disabled>Select type</option>
                    <option value="Type A">Type A</option>
                    <option value="Type B">Type B</option>
                    <option value="Type C">Type C</option>
                    <option value="Type D">Type D</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="partNumberAction">Part Number Action</label>
                  <select id="partNumberAction" class="form-control" formControlName="partNumberAction" [disabled]="!isPartSelected()">
                    <option value="Generate part number">Generate part number</option>
                  </select>
                </div>
             </div>

             <div class="grid-2" *ngIf="isPartSelected()">
                <div class="form-group">
                  <label class="form-label" for="partNumber">Part Number *</label>
                  <select id="partNumber" class="form-control" formControlName="partNumber" [disabled]="!partNumberOptions.length">
                    <option value="" disabled>Select part number</option>
                    <option *ngFor="let option of partNumberOptions" [value]="option">{{ option }}</option>
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
    
    .modal-header { padding: 1.5rem 2rem 1rem; background: var(--bg-surface); }
    .title { font-size: 1.5rem; margin: 0; color: var(--text-primary); font-weight: 600; letter-spacing:-0.03em;}
    .close-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: 1px solid transparent; font-size: 1.1rem; color: var(--text-muted); transition: all var(--transition-fast); }
    .close-icon-btn:hover { background: var(--bg-app); color: var(--text-primary); }
    
    .modal-body { padding: 1.5rem 2rem; background: var(--bg-app); max-height: 60vh; overflow-y: auto; }
    .modal-footer { padding: 1rem 2rem; display: flex; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1rem; }
    .gap-y-6 { row-gap: 0.9rem; }
    .form-group { margin-bottom: 0; }
    .form-label { margin-bottom: 0.3rem; }
    .form-control { padding: 0.65rem 0.85rem; }
    
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
    type: ['Part', Validators.required],
    lifecycle: ['Preliminary', Validators.required],
    revision: ['A.01', Validators.required],
    part: ['', Validators.required],
    partDescription: ['', Validators.maxLength(1000)],
    document: [''],
    partType: [''],
    partNumberAction: ['Generate part number'],
    partNumber: [''],
    classification: [''],
    quantity: [0]
  });

  ngOnInit() {
    if (this.editItem) {
      const normalizedPartType = this.normalizePartType((this.editItem as any)?.partType);
      this.itemForm.patchValue({
        sku: this.editItem.sku,
        name: this.editItem.name,
        type: this.editItem.type,
        lifecycle: this.editItem.lifecycle,
        revision: this.editItem.revision,
        part: (this.editItem as any)?.part || this.editItem.type || '',
        partDescription: (this.editItem as any)?.partDescription || '',
        document: (this.editItem as any)?.document || '',
        partType: normalizedPartType || '',
        classification: (this.editItem as any)?.classification || '',
        quantity: this.editItem.quantity,
        partNumber: this.partNumberOptions[0] || ''
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

  normalizePartType(partType?: string): string {
    if (!partType) {
      return '';
    }

    const mapping: Record<string, string> = {
      Electronic: 'Assembly',
      Mechanical: 'Mechanical Part',
      Electrical: 'Electrical Part',
      Fastener: 'Raw Material',
      Material: 'Packaging Material'
    };

    return mapping[partType] || partType;
  }

  get partNumberOptions(): string[] {
    const partType = this.itemForm.get('partType')?.value;
    if (!partType) {
      return [];
    }

    const prefix = partType.replace('Type ', 'PRT');
    return [`${prefix}-1000`];
  }

  onPartTypeChange() {
    this.itemForm.get('classification')?.reset();
    const partNumberControl = this.itemForm.get('partNumber');
    const options = this.partNumberOptions;
    if (options.length) {
      partNumberControl?.setValue(options[0]);
      partNumberControl?.setValidators([Validators.required]);
    } else {
      partNumberControl?.clearValidators();
      partNumberControl?.reset();
    }
    partNumberControl?.updateValueAndValidity();
  }

  onPartChange() {
    const partTypeControl = this.itemForm.get('partType');
    const classificationControl = this.itemForm.get('classification');
    const partNumberControl = this.itemForm.get('partNumber');
    
    if (this.isPartSelected()) {
      partTypeControl?.setValidators([Validators.required]);
      classificationControl?.setValidators([Validators.required]);
      partNumberControl?.setValidators([Validators.required]);
    } else {
      partTypeControl?.clearValidators();
      classificationControl?.clearValidators();
      partNumberControl?.clearValidators();
      partTypeControl?.reset();
      classificationControl?.reset();
      partNumberControl?.reset();
    }
    
    partTypeControl?.updateValueAndValidity();
    classificationControl?.updateValueAndValidity();
    partNumberControl?.updateValueAndValidity();
  }

  updateDescriptionCount() {
    const value = this.itemForm.get('partDescription')?.value || '';
    this.descriptionCount = Math.min(value.length, 1000);
  }

  onSubmit() {
    if (this.itemForm.valid && !this.userService.isReadOnly()) {
      const formValue = this.itemForm.value;
      if (!formValue.type && formValue.part) {
        formValue.type = formValue.part;
      }
      
      if (this.editItem) {
        this.inventoryService.updateProduct(this.editItem.sku, formValue as Partial<Product>);
      } else {
        this.inventoryService.addProduct(formValue as Partial<Product>);
      }
      
      this.closeModal();
    }
  }
}

