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
    <div [class.modal-overlay]="!pageMode" [class.edit-page-shell]="pageMode" (click)="!pageMode && closeModal()">
      <div [class.modal-card]="!pageMode" [class.edit-page-card]="pageMode" class="flex-col" (click)="$event.stopPropagation()">

        <div class="modal-header border-b">
          <div class="flex justify-between items-center w-full">
            <h2 class="title">{{ editItem ? 'Edit Enterprise Record' : 'Create Item' }}</h2>
            <button *ngIf="!pageMode" class="close-icon-btn flex items-center justify-center" (click)="closeModal()">✕</button>
          </div>

        </div>

        <div class="modal-body p-6">
           <div *ngIf="userService.isReadOnly()" class="card p-4 bg-danger mb-6" style="background:#fef2f2; border-color:#fca5a5; color:#dc2626;">
              <strong>Security Protocol:</strong> Your active Assessor role restricts core mutation capabilities.
           </div>

           <form [formGroup]="itemForm" class="flex-col gap-y-6" *ngIf="!userService.isReadOnly()">
             <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" for="part">Item Type *</label>
                  <select id="part" class="form-control" formControlName="part" (change)="onPartChange()">
                    <option value="" disabled>Select Item Type</option>
                    <option value="Part">Part</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
                <div class="form-group" *ngIf="isPartSelected()">
                  <label class="form-label" for="partNumberAction">Part Number Action</label>
                  <select id="partNumberAction" class="form-control" formControlName="partNumberAction">
                    <option value="Generate part number">Generate part number</option>
                  </select>
                </div>
             </div>

             <div class="grid-2" *ngIf="isPartSelected()">
                <div class="form-group">
                  <label class="form-label" for="partType">Part Type *</label>
                  <select id="partType" class="form-control" formControlName="partType" [disabled]="!isPartSelected()" (change)="onPartTypeChange()">
                    <option value="" disabled>Select type</option>
                    <option value="Finished Good">Finished Good</option>
                    <option value="Semi-Finished Good">Semi-Finished Good</option>
                    <option value="Component">Component</option>
                    <option value="Sub Assembly">Sub Assembly</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="partNumber">Part Number *</label>
                  <select id="partNumber" class="form-control" formControlName="partNumber" [disabled]="!partNumberOptions.length">
                    <option value="" disabled>Select part number</option>
                    <option *ngFor="let option of partNumberOptions" [value]="option">{{ option }}</option>
                  </select>
                </div>
             </div>

              <div class="form-group" *ngIf="isPartSelected()">
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
               {{ editItem ? 'Update Item' : 'Create Item' }}
             </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); animation: fadeIn var(--transition-fast); }
    .modal-card { width: 700px; max-width: 95vw; background: var(--bg-surface); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-float); overflow: hidden; display: flex; flex-direction: column; }
    .edit-page-shell { width: 100%; margin-top: 1rem; }
    .edit-page-card { width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; }
    
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
  @Input() pageMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();
  
  fb = inject(FormBuilder);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  descriptionCount = 0;

  itemForm = this.fb.group({
    type: ['Part', Validators.required],
    lifecycle: ['Preliminary', Validators.required],
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
        type: this.editItem.type,
        lifecycle: this.editItem.lifecycle,
        part: (this.editItem as any)?.part || this.editItem.type || '',
        partDescription: (this.editItem as any)?.partDescription || '',
        document: (this.editItem as any)?.document || '',
        partType: normalizedPartType || '',
        classification: (this.editItem as any)?.classification || '',
        quantity: this.editItem.quantity,
        partNumber: (this.editItem as any)?.partNumber || this.partNumberOptions[0] || ''
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
      'Type A': 'Finished Good',
      'Type B': 'Semi-Finished Good',
      'Type C': 'Component',
      'Type D': 'Sub Assembly',
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

    const prefix = this.getPartTypePrefix(partType);
    return prefix ? [`${prefix}-001`] : [];
  }

  private getPartTypePrefix(partType: string): string {
    return partType
      .trim()
      .split(/[\s-]+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  onPartTypeChange() {
    const classificationControl = this.itemForm.get('classification');
    const partNumberControl = this.itemForm.get('partNumber');
    const selectedPartType = this.itemForm.get('partType')?.value || '';
    classificationControl?.setValue(selectedPartType);
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
    const documentControl = this.itemForm.get('document');
    const selectedItemType = this.itemForm.get('part')?.value;

    if (selectedItemType === 'Part' || selectedItemType === 'Document') {
      this.itemForm.get('type')?.setValue(selectedItemType);
    }
    
    if (this.isPartSelected()) {
      partTypeControl?.setValidators([Validators.required]);
      partNumberControl?.setValidators([Validators.required]);
    } else {
      partTypeControl?.clearValidators();
      classificationControl?.clearValidators();
      partNumberControl?.clearValidators();
      partTypeControl?.reset();
      classificationControl?.reset();
      partNumberControl?.reset();
      documentControl?.reset();
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
      const formValue = this.itemForm.getRawValue();
      const itemType = formValue.part || formValue.type || 'Part';
      const generatedSku = formValue.partNumber || `${itemType.toUpperCase()}-001`;
      const productUpdates: Partial<Product> = {
        ...formValue,
        type: itemType as Product['type'],
        quantity: formValue.quantity ?? 0
      } as Partial<Product>;
      
      if (this.editItem) {
        this.inventoryService.updateProduct(this.editItem.sku, productUpdates);
      } else {
        this.inventoryService.addProduct({
          ...productUpdates,
          sku: generatedSku,
          name: formValue.partType || itemType
        });
      }
      
      this.saved.emit(this.editItem?.sku || generatedSku);
      this.closeModal();
    }
  }
}

