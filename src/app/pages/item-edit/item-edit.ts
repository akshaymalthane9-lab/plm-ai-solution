import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService, Product } from '../../services/inventory.service';
import { ThemeService } from '../../services/theme.service';

type EditDraft = {
  sku: string;
  name: string;
  partDescription: string;
  partType: string;
  classification: string;
  dosageForm: string;
  strength: string;
  routeOfAdministration: string;
  category: string;
  quantity: number;
  status: Product['status'];
  unitOfMeasure: string;
  material: string;
  partDimensions: string;
};

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-page" [class.light-theme]="themeService.theme() === 'light'">
      <main *ngIf="item">
        <button class="back-button" type="button" (click)="goToItem(item.sku)">Back to Item</button>

        <section class="edit-heading">
          <div class="edit-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5L12 3l8 4.5v9L12 21l-8-4.5v-9z"></path>
              <path d="M4.5 7.8L12 12l7.5-4.2"></path>
              <path d="M12 12v9"></path>
            </svg>
          </div>
          <div>
            <h1>Edit {{ item.sku }}</h1>
            <p>Update item attributes and save your changes.</p>
          </div>
        </section>

        <form class="edit-card" (ngSubmit)="saveItem()">
          <div class="edit-card-header">
            <h2>Item Details</h2>
          </div>

          <div class="edit-form-grid">
            <label class="form-group">
              <span>Item Number</span>
              <input class="form-control" [(ngModel)]="draft.sku" name="sku" />
            </label>

            <label class="form-group">
              <span>Item Type</span>
              <input class="form-control disabled-control" [value]="draft.partType" disabled />
            </label>

            <label class="form-group description-field">
              <span>Description</span>
              <textarea class="form-control description-control" [(ngModel)]="draft.partDescription" name="partDescription"></textarea>
            </label>

            <label class="form-group">
              <span>Part Classification</span>
              <input class="form-control" [(ngModel)]="draft.classification" name="classification" />
            </label>

            <label class="form-group">
              <span>Dosage Form</span>
              <input class="form-control" [(ngModel)]="draft.dosageForm" name="dosageForm" />
            </label>

            <label class="form-group">
              <span>Strength</span>
              <input class="form-control" [(ngModel)]="draft.strength" name="strength" />
            </label>

            <label class="form-group">
              <span>Route of Admin</span>
              <input class="form-control" [(ngModel)]="draft.routeOfAdministration" name="routeOfAdministration" />
            </label>

            <label class="form-group">
              <span>Category</span>
              <input class="form-control" [(ngModel)]="draft.category" name="category" />
            </label>

            <label class="form-group">
              <span>Quantity</span>
              <input class="form-control" type="number" min="0" [(ngModel)]="draft.quantity" name="quantity" />
            </label>

            <label class="form-group">
              <span>Unit of Measure (UOM)</span>
              <input class="form-control" [(ngModel)]="draft.unitOfMeasure" name="unitOfMeasure" />
            </label>

            <label class="form-group">
              <span>Material</span>
              <input class="form-control" [(ngModel)]="draft.material" name="material" />
            </label>

            <label class="form-group">
              <span>Part Dimensions</span>
              <input class="form-control" [(ngModel)]="draft.partDimensions" name="partDimensions" />
            </label>

            <label class="form-group">
              <span>Status</span>
              <select class="form-control" [(ngModel)]="draft.status" name="status">
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </label>
          </div>

          <div class="edit-actions">
            <button class="cancel-button" type="button" (click)="goToItem(item.sku)">Cancel</button>
            <button class="save-button" type="submit">Save Changes</button>
          </div>
        </form>
      </main>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100vh; background: #eeeff4; color: #25324b; }
    .edit-page {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      min-height: 100vh;
      padding: 18px 28px 32px;
      background: var(--bg);
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    .edit-page.light-theme {
      --bg: #f5f7fa;
      --surface: #ffffff;
      --border: #d8dee7;
      --text: #172033;
      --muted: #59677c;
    }
    main {
      width: min(1100px, 100%);
      margin: 0;
    }
    .back-button {
      margin-bottom: 14px;
      padding: 9px 16px;
      border: 1px solid #dcebc3;
      border-radius: 999px;
      background: #f3f8e9;
      color: #5f8919;
      font-weight: 700;
      cursor: pointer;
    }
    .edit-heading {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }
    .edit-icon {
      display: grid;
      width: 45px;
      height: 45px;
      place-items: center;
      border-radius: 12px;
      background: #f3f8e9;
      color: #6a951c;
    }
    .edit-icon svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    h1 {
      margin: 0;
      color: var(--text);
      font-size: 1.65rem;
    }
    .edit-heading p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: .86rem;
    }
    .edit-card {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: var(--surface);
      box-shadow: 0 10px 24px rgba(15, 23, 42, .08);
    }
    .edit-card-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
    }
    .edit-card-header h2 {
      margin: 0;
      color: var(--text);
      font-size: 1.35rem;
      font-weight: 800;
    }
    .edit-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      padding: 20px 24px 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }
    .form-group span {
      color: #58709b;
      font-size: .78rem;
      font-weight: 700;
    }
    .description-field {
      grid-column: 1 / -1;
    }
    .form-control {
      width: 100%;
      min-height: 42px;
      box-sizing: border-box;
      border: 1px solid #dce5f2;
      border-radius: 14px;
      background: #f7f9fd;
      color: #0f2b57;
      font: inherit;
      font-size: .98rem;
      padding: 10px 14px;
      outline: none;
    }
    .form-control:focus {
      border-color: #8ab4ff;
      box-shadow: 0 0 0 3px rgba(47, 129, 247, .12);
    }
    .disabled-control {
      cursor: not-allowed;
      color: #6a7890;
      background: #eef2f7;
    }
    .description-control {
      min-height: 78px;
      resize: vertical;
    }
    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 0 24px 22px;
    }
    .cancel-button,
    .save-button {
      border: 1px solid #dce5f2;
      border-radius: 999px;
      padding: 10px 18px;
      font-weight: 800;
      cursor: pointer;
    }
    .cancel-button {
      background: #fff;
      color: #17376a;
    }
    .save-button {
      border-color: #1f6feb;
      background: #1f6feb;
      color: #fff;
    }
    @media (max-width: 900px) {
      .edit-form-grid { grid-template-columns: 1fr; }
      .description-field { grid-column: auto; }
    }
    @media (max-width: 700px) {
      .edit-page { padding: 18px 16px 28px; }
    }
  `,
})
export class ItemEdit implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly inventoryService = inject(InventoryService);
  readonly themeService = inject(ThemeService);

  item: Product | null = null;
  draft: EditDraft = this.createEmptyDraft();

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
    this.item = sku ? this.inventoryService.getData().find(product => product.sku === sku) || null : null;
    if (!this.item) {
      this.router.navigate(['/items']);
      return;
    }
    this.draft = this.createDraft(this.item);
  }

  goToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  saveItem() {
    if (!this.item) {
      return;
    }

    const partDescription = this.draft.partDescription.trim();
    const sku = this.draft.sku.trim() || this.item.sku;
    this.inventoryService.updateProduct(this.item.sku, {
      sku,
      name: partDescription || this.draft.name || this.item.name,
      partDescription,
      classification: this.draft.classification.trim(),
      dosageForm: this.draft.dosageForm.trim(),
      strength: this.draft.strength.trim(),
      routeOfAdministration: this.draft.routeOfAdministration.trim(),
      category: this.draft.category.trim(),
      quantity: Number(this.draft.quantity) || 0,
      status: this.draft.status,
      unitOfMeasure: this.draft.unitOfMeasure.trim(),
      material: this.draft.material.trim(),
      partDimensions: this.draft.partDimensions.trim()
    });
    this.goToItem(sku);
  }

  private createDraft(product: Product): EditDraft {
    const description = product.partDescription || product.name || '';
    return {
      sku: product.sku || '',
      name: product.name || '',
      partDescription: description,
      partType: product.partType || product.part || product.type || '',
      classification: product.classification || '',
      dosageForm: product.dosageForm || 'Film-Coated Tablet',
      strength: product.strength || '50 mg',
      routeOfAdministration: product.routeOfAdministration || 'Oral',
      category: product.category || '',
      quantity: product.quantity || 0,
      status: product.status || 'in-stock',
      unitOfMeasure: product.unitOfMeasure || 'Each',
      material: product.material || '',
      partDimensions: product.partDimensions || ''
    };
  }

  private createEmptyDraft(): EditDraft {
    return {
      sku: '',
      name: '',
      partDescription: '',
      partType: '',
      classification: '',
      dosageForm: '',
      strength: '',
      routeOfAdministration: '',
      category: '',
      quantity: 0,
      status: 'in-stock',
      unitOfMeasure: '',
      material: '',
      partDimensions: ''
    };
  }
}
