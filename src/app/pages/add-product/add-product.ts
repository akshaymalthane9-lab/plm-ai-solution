import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, Product } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">Enterprise Configuration Wizard</h1>
          <p class="text-muted">Register a new structured component to the master database.</p>
        </div>
      </div>

      <div class="card p-0 form-card">
        <div *ngIf="userService.isReadOnly()" class="m-6" style="padding: 1rem; background: #fdf2f2; border: 1px solid var(--color-danger); color: var(--color-danger); border-radius: 4px; font-size: 0.875rem;">
           <strong>Access Denied:</strong> Your current role (Read-Only Assessor) is not authorized to create or modify inventory objects in the enterprise database. This form has been locked.
        </div>

        <div class="wizard-header flex items-center p-6 border-b">
           <div class="step-indicator" [class.active]="step === 1" [class.completed]="step > 1">
             <div class="step-circle">1</div>
             <span>Core Definition</span>
           </div>
           <div class="step-line"></div>
           <div class="step-indicator" [class.active]="step === 2" [class.completed]="step > 2">
             <div class="step-circle">2</div>
             <span>Lifecycle & Rev</span>
           </div>
           <div class="step-line"></div>
           <div class="step-indicator" [class.active]="step === 3" [class.completed]="step > 3">
             <div class="step-circle">3</div>
             <span>BOM Routing</span>
           </div>
        </div>

        <form [formGroup]="productForm" class="flex-col gap-4 p-6" *ngIf="!userService.isReadOnly()">
          
          <!-- STEP 1 -->
          <div *ngIf="step === 1" class="wizard-body slide-in">
            <h3 class="mb-4 text-primary">Step 1: Core Item Definition</h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label" for="sku">SKU (Stock Keeping Unit) *</label>
                <input id="sku" type="text" class="form-control" formControlName="sku" placeholder="e.g. ASM-990" />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="name">Component Name *</label>
                <input id="name" type="text" class="form-control" formControlName="name" placeholder="Enter formal name" />
              </div>
            </div>

            <div class="grid-2 mt-4">
              <div class="form-group">
                <label class="form-label" for="category">Functional Category *</label>
                <select id="category" class="form-control" formControlName="category">
                  <option value="" disabled>Select category</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Hardware">Hardware Subcomponent</option>
                  <option value="Software">Software Manifest</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="quantity">Initial Sourced Qty</label>
                <input id="quantity" type="number" class="form-control" formControlName="quantity" min="0" />
              </div>
            </div>
          </div>

          <!-- STEP 2 -->
          <div *ngIf="step === 2" class="wizard-body slide-in">
            <h3 class="mb-4 text-primary">Step 2: Lifecycle Governance</h3>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label" for="revision">Initial Revision Code *</label>
                <input id="revision" type="text" class="form-control" formControlName="revision" placeholder="e.g. A.01" />
              </div>
              <div class="form-group">
                <label class="form-label" for="lifecycle">Target State *</label>
                <select id="lifecycle" class="form-control" formControlName="lifecycle">
                  <option value="Design">Design (WIP)</option>
                  <option value="Prototype">Prototype</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>
          </div>

          <!-- STEP 3 -->
          <div *ngIf="step === 3" class="wizard-body slide-in">
            <h3 class="mb-4 text-primary">Step 3: Bill of Materials Mapping</h3>
            <p class="text-sm text-muted mb-4">Select existing SKUs to nest beneath this parent assembly.</p>
            
            <div class="bom-list-container border rounded">
              <div *ngFor="let cand of getAvailableComponents()" class="bom-item flex justify-between items-center p-3 border-b">
                <div>
                  <div class="font-mono text-sm">{{ cand.sku }}</div>
                  <div class="text-xs text-muted">{{ cand.name }}</div>
                </div>
                <button type="button" class="btn btn-sm" 
                  [class.btn-primary]="!isBomSelected(cand.sku)"
                  [class.btn-secondary]="isBomSelected(cand.sku)"
                  (click)="toggleBom(cand.sku)">
                  {{ isBomSelected(cand.sku) ? 'Remove' : 'Add to BOM' }}
                </button>
              </div>
              <div *ngIf="getAvailableComponents().length === 0" class="p-4 text-center text-muted">No eligible components found.</div>
            </div>

            <div class="mt-4 p-3 bg-surface border rounded">
              <strong>Attached Components: </strong> {{ selectedBom.length }} connected
            </div>
          </div>

          <hr class="divider mt-6" />
          
          <div class="flex justify-between items-center mt-4">
            <button type="button" class="btn btn-secondary" routerLink="/dashboard">Cancel Wizard</button>
            
            <div class="flex gap-2">
               <button type="button" class="btn btn-secondary" *ngIf="step > 1" (click)="step = step - 1">Back</button>
               <button type="button" class="btn btn-primary" *ngIf="step < 3" (click)="nextStep()" [disabled]="!isStepValid()">Next Stage</button>
               <button type="button" class="btn btn-primary" *ngIf="step === 3" (click)="onSubmit()">Execute Configuration</button>
            </div>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: `
    .page-container { animation: fadeIn var(--transition-fast); max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .text-muted { color: var(--text-muted); font-size: 0.875rem; }
    
    .p-0 { padding: 0; }
    .p-6 { padding: 1.5rem; }
    .m-6 { margin: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .form-card { background: var(--bg-surface); }
    .text-primary { color: var(--accent-primary); font-size: 1.1rem; }
    
    .wizard-header { background: var(--bg-surface-hover); border-top-left-radius: 8px; border-top-right-radius: 8px; justify-content: center; gap: 1rem; }
    .step-indicator { display: flex; align-items: center; gap: 0.5rem; opacity: 0.5; transition: all var(--transition-fast); font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }
    .step-indicator.active { opacity: 1; color: var(--text-primary); }
    .step-indicator.completed { opacity: 1; color: var(--accent-primary); }
    .step-circle { width: 24px; height: 24px; border-radius: 50%; background: var(--border-color); color: var(--text-primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
    .step-indicator.active .step-circle { background: var(--accent-primary); color: white; }
    .step-indicator.completed .step-circle { background: var(--accent-primary); color: white; }
    .step-line { width: 40px; height: 2px; background: var(--border-color); }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 640px) {
      .grid-2 { grid-template-columns: 1fr; gap: 0; }
    }
    
    .divider { border: 0; height: 1px; background: var(--border-color); }
    .border-b { border-bottom: 1px solid var(--border-color); }
    
    .bom-list-container { max-height: 250px; overflow-y: auto; background: var(--bg-app); border: 1px solid var(--border-color); }
    .bom-item:last-child { border-bottom: none; }
    
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .slide-in { animation: slideIn var(--transition-fast) ease-out; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  `
})
export class AddProduct {
  fb = inject(FormBuilder);
  inventoryService = inject(InventoryService);
  router = inject(Router);
  userService = inject(UserService);

  step = 1;
  selectedBom: string[] = [];

  productForm = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    category: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    revision: ['A.01', Validators.required],
    lifecycle: ['Design', Validators.required]
  });

  constructor() {
    if (this.userService.isReadOnly()) {
      this.productForm.disable();
    }
  }

  isStepValid(): boolean {
     if (this.step === 1) {
       return this.productForm.get('sku')?.valid && this.productForm.get('name')?.valid && this.productForm.get('category')?.valid ? true : false;
     }
     if (this.step === 2) {
       return this.productForm.get('revision')?.valid && this.productForm.get('lifecycle')?.valid ? true : false;
     }
     return true;
  }

  nextStep() {
    if (this.isStepValid()) {
      this.step++;
    }
  }

  getAvailableComponents(): Product[] {
     return this.inventoryService.getData().filter(p => p.sku !== this.productForm.get('sku')?.value);
  }

  isBomSelected(sku: string): boolean {
     return this.selectedBom.includes(sku);
  }

  toggleBom(sku: string) {
     if (this.isBomSelected(sku)) {
        this.selectedBom = this.selectedBom.filter(x => x !== sku);
     } else {
        this.selectedBom.push(sku);
     }
  }

  onSubmit() {
    if (this.productForm.valid && !this.userService.isReadOnly()) {
      const payload: Partial<Product> = {
         ...this.productForm.value,
         bom: this.selectedBom
      } as Partial<Product>;
      
      this.inventoryService.addProduct(payload);
      this.router.navigate(['/dashboard']);
    }
  }
}
