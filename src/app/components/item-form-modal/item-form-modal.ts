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
    <div
      [class.modal-overlay]="!pageMode"
      [class.edit-page-shell]="pageMode"
      [class.light-theme]="activeTheme === 'light'"
      [class.dark-theme]="activeTheme === 'dark'"
      (click)="!pageMode && closeModal()"
    >
      <div
        [class.modal-card]="!pageMode"
        [class.edit-page-card]="pageMode"
        class="dialog-card"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h2 class="title">
            {{ editItem ? 'Edit Enterprise Record' : currentStep === 1 ? 'Create Item' : detailsTitle }}
          </h2>
          <button
            *ngIf="!pageMode"
            class="close-icon-btn"
            type="button"
            aria-label="Close"
            (click)="closeModal()"
          >
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div *ngIf="userService.isReadOnly()" class="security-message">
            <strong>Security Protocol:</strong> Your active Assessor role restricts core mutation
            capabilities.
          </div>

          <form [formGroup]="itemForm" *ngIf="!userService.isReadOnly()">
            <div *ngIf="currentStep === 1 && !editItem" class="type-step">
              <div class="form-group">
                <label class="form-label" for="part">Item Type *</label>
                <select
                  id="part"
                  class="form-control"
                  formControlName="part"
                  (change)="onPartChange()"
                >
                  <option value="" disabled>Select Item Type</option>
                  <option value="Part">Part</option>
                  <option value="Document">Document</option>
                </select>
              </div>
            </div>

            <div *ngIf="currentStep === 2 || editItem" class="details-step">
              <ng-container *ngIf="isPartSelected(); else documentDetails">
                <div class="form-group">
                  <label class="form-label" for="partType">Part Type</label>
                  <select
                    id="partType"
                    class="form-control"
                    formControlName="partType"
                    (change)="onPartTypeChange()"
                  >
                    <option value="" disabled>Select type</option>
                    <option value="Finished Good">Finished Good</option>
                    <option value="Semi-Finished Good">Semi-Finished Good</option>
                    <option value="Component">Component</option>
                    <option value="Sub Assembly">Sub Assembly</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="partNumber">Part Number</label>
                  <div class="part-number-row">
                    <input
                      id="partNumber"
                      class="form-control"
                      formControlName="partNumber"
                      placeholder="Generate or enter a part number"
                    />
                    <button
                      class="generate-button"
                      type="button"
                      [disabled]="!itemForm.get('partType')?.value"
                      (click)="generatePartNumber()"
                    >
                      Generate Part Number
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="partDescription">Part Description</label>
                  <textarea
                    id="partDescription"
                    class="form-control description-control"
                    formControlName="partDescription"
                    placeholder="Describe the part"
                    maxlength="1000"
                    (input)="updateDescriptionCount()"
                  ></textarea>
                  <div class="description-limit">Maximum 1000 characters</div>
                </div>
              </ng-container>

              <ng-template #documentDetails>
                <div class="form-group">
                  <label class="form-label" for="document">Document Name *</label>
                  <input
                    id="document"
                    class="form-control"
                    formControlName="document"
                    placeholder="Enter document name"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="documentDescription">Description</label>
                  <textarea
                    id="documentDescription"
                    class="form-control description-control"
                    formControlName="partDescription"
                    maxlength="1000"
                    (input)="updateDescriptionCount()"
                  ></textarea>
                  <div class="description-limit">Maximum 1000 characters</div>
                </div>
              </ng-template>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="cancel-button" (click)="closeModal()">Cancel</button>
          <button
            *ngIf="currentStep === 1 && !editItem"
            type="button"
            class="primary-button"
            (click)="goToDetails()"
            [disabled]="!itemForm.get('part')?.value || userService.isReadOnly()"
          >
            Next
          </button>
          <button
            *ngIf="currentStep === 2 || editItem"
            type="button"
            class="primary-button create-button"
            (click)="onSubmit()"
            [disabled]="!itemForm.valid || userService.isReadOnly()"
          >
            {{ editItem ? 'Update Item' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: contents; }
    * { box-sizing: border-box; }
    button, input, select, textarea { font: inherit; }
    .modal-overlay,
    .edit-page-shell {
      --dialog-bg: #0d1117;
      --dialog-surface: #161b22;
      --dialog-field: #21262d;
      --dialog-border: #30363d;
      --dialog-text: #e6edf3;
      --dialog-label: #a8b4c7;
      --dialog-muted: #7d8aa0;
      --dialog-accent: #2f81f7;
      --dialog-accent-text: #ffffff;
      --dialog-create: #f6d33f;
      --dialog-create-text: #413500;
    }
    .light-theme {
      --dialog-bg: #f5f7fb;
      --dialog-surface: #f8f9fc;
      --dialog-field: #f7f9fd;
      --dialog-border: #dce4f0;
      --dialog-text: #1d407a;
      --dialog-label: #5875a1;
      --dialog-muted: #7790b7;
      --dialog-accent: #31558f;
      --dialog-accent-text: #ffffff;
      --dialog-create: #f8d83f;
      --dialog-create-text: #443900;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(4, 9, 17, 0.62);
      backdrop-filter: blur(3px);
      animation: fadeIn 0.16s ease;
    }
    .dialog-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--dialog-border);
      background: var(--dialog-surface);
      color: var(--dialog-text);
    }
    .modal-card {
      width: min(565px, 96vw);
      border-radius: 16px;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
    }
    .edit-page-shell { width: 100%; margin-top: 1rem; }
    .edit-page-card { width: 100%; border-radius: 20px; }
    .edit-page-shell .modal-body {
      max-height: none;
      overflow: visible;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 76px;
      padding: 20px 26px;
      border-bottom: 1px solid var(--dialog-border);
    }
    .title {
      margin: 0;
      color: var(--dialog-text);
      font-size: 22px;
      font-weight: 750;
      letter-spacing: -0.02em;
    }
    .close-icon-btn {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--dialog-muted);
      font-size: 22px;
    }
    .close-icon-btn:hover { background: var(--dialog-field); color: var(--dialog-text); }
    .modal-body {
      max-height: 66vh;
      overflow-y: auto;
      padding: 28px 26px 22px;
      background: var(--dialog-bg);
    }
    .type-step { min-height: 110px; }
    .details-step { display: grid; gap: 20px; }
    .form-group { display: grid; gap: 9px; }
    .form-label {
      color: var(--dialog-label);
      font-size: 13px;
      font-weight: 700;
    }
    .form-control {
      width: 100%;
      min-height: 50px;
      padding: 0 16px;
      border: 1px solid var(--dialog-border);
      border-radius: 16px;
      outline: none;
      background: var(--dialog-field);
      color: var(--dialog-text);
    }
    .form-control:focus {
      border-color: var(--dialog-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--dialog-accent) 15%, transparent);
    }
    select.form-control { cursor: pointer; }
    .part-number-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
    }
    .generate-button {
      min-height: 46px;
      padding: 0 20px;
      border: 1px solid var(--dialog-border);
      border-radius: 999px;
      background: transparent;
      color: var(--dialog-text);
      font-size: 13px;
      font-weight: 750;
    }
    .generate-button:hover:not(:disabled) { border-color: var(--dialog-accent); }
    .generate-button:disabled { opacity: 0.45; cursor: not-allowed; }
    .description-control {
      min-height: 126px;
      padding: 14px 16px;
      resize: vertical;
    }
    .description-limit {
      color: var(--dialog-muted);
      font-size: 11px;
      text-align: right;
    }
    .security-message {
      padding: 14px;
      border: 1px solid #fca5a5;
      border-radius: 10px;
      background: #fef2f2;
      color: #dc2626;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 26px;
      border-top: 1px solid var(--dialog-border);
      background: var(--dialog-surface);
    }
    .cancel-button,
    .primary-button {
      min-width: 102px;
      min-height: 44px;
      padding: 0 20px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 750;
    }
    .cancel-button {
      border: 1px solid var(--dialog-border);
      background: transparent;
      color: var(--dialog-text);
    }
    .primary-button {
      border: 1px solid var(--dialog-accent);
      background: var(--dialog-accent);
      color: var(--dialog-accent-text);
    }
    .create-button {
      border-color: var(--dialog-create);
      background: var(--dialog-create);
      color: var(--dialog-create-text);
    }
    .primary-button:disabled { opacity: 0.45; cursor: not-allowed; }
    @media (max-width: 560px) {
      .modal-overlay { padding: 10px; }
      .modal-header, .modal-body, .modal-footer { padding-left: 18px; padding-right: 18px; }
      .part-number-row { grid-template-columns: 1fr; }
      .generate-button { width: 100%; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
})
export class ItemFormModal implements OnInit {
  @Input() editItem: Product | null = null;
  @Input() pageMode = false;
  @Input() theme: 'dark' | 'light' | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();
  
  fb = inject(FormBuilder);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  descriptionCount = 0;
  currentStep: 1 | 2 = 1;

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

  get activeTheme(): 'dark' | 'light' {
    if (this.theme) {
      return this.theme;
    }
    return localStorage.getItem('nexaplm_theme') === 'light' ? 'light' : 'dark';
  }

  get detailsTitle(): string {
    return this.isPartSelected() ? 'Enter Part Details' : 'Enter Document Details';
  }

  ngOnInit() {
    if (this.editItem) {
      this.currentStep = 2;
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

  goToDetails() {
    if (!this.itemForm.get('part')?.value || this.userService.isReadOnly()) {
      return;
    }

    this.onPartChange();
    if (this.isPartSelected() && !this.itemForm.get('partType')?.value) {
      this.itemForm.get('partType')?.setValue('Finished Good');
      this.onPartTypeChange();
    }
    this.currentStep = 2;
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
    if (selectedPartType) {
      this.generatePartNumber();
      partNumberControl?.setValidators([Validators.required]);
    } else {
      partNumberControl?.clearValidators();
      partNumberControl?.reset();
    }
    partNumberControl?.updateValueAndValidity();
  }

  generatePartNumber() {
    const partType = this.itemForm.get('partType')?.value;
    if (!partType) {
      return;
    }

    const prefix = this.getPartTypePrefix(partType);
    const matchingNumbers = this.inventoryService
      .getData()
      .map(item => item.sku.match(new RegExp(`^${prefix}-(\\d+)$`, 'i')))
      .filter((match): match is RegExpMatchArray => !!match)
      .map(match => Number(match[1]));
    const nextNumber = matchingNumbers.length ? Math.max(...matchingNumbers) + 1 : 1;
    this.itemForm.get('partNumber')?.setValue(`${prefix}-${String(nextNumber).padStart(3, '0')}`);
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
      documentControl?.clearValidators();
      documentControl?.reset();
    } else {
      partTypeControl?.clearValidators();
      classificationControl?.clearValidators();
      partNumberControl?.clearValidators();
      partTypeControl?.reset();
      classificationControl?.reset();
      partNumberControl?.reset();
      documentControl?.setValidators([Validators.required]);
    }
    
    partTypeControl?.updateValueAndValidity();
    classificationControl?.updateValueAndValidity();
    partNumberControl?.updateValueAndValidity();
    documentControl?.updateValueAndValidity();
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

