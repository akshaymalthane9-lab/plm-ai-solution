import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { ThemeService } from '../../services/theme.service';

type PharmaItem = {
  item: string;
  description: string;
  type: string;
  typeTone: 'blue' | 'purple' | 'gray' | 'green';
  lifecycle: string;
  lifecycleTone: 'yellow' | 'green' | 'gray';
  revision: string;
  ecmStatus: string;
  ecmTone: 'green' | 'yellow';
  updated: string;
};

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="items-page" [class.light-theme]="themeService.theme() === 'light'">
      <ng-container *ngIf="!isCreateMode; else createItemView">
        <div class="page-header-row">
          <div class="page-header">
            <h1>Items</h1>
            <p>Drug substances, products, components, and packaging</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" type="button">Browse Released</button>
            <button class="btn btn-primary btn-sm" type="button" (click)="goToCreate()">+ Create Item</button>
          </div>
        </div>

        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input type="text" placeholder="Search items by number, description, or type..." />
          <button class="btn btn-ghost btn-sm" type="button">Advanced Filter</button>
        </div>

        <div class="filter-row">
          <span class="filter-chip active">All (24)</span>
          <span class="filter-chip">Drug Substance (4)</span>
          <span class="filter-chip">Drug Product (6)</span>
          <span class="filter-chip">Raw Material (9)</span>
          <span class="filter-chip">Packaging (5)</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Type</th>
                <th>Lifecycle</th>
                <th>Revision</th>
                <th>ECM Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" (click)="openItem(item.item)">
                <td><span class="item-link">{{ item.item }}</span></td>
                <td>{{ item.description }}</td>
                <td><span class="badge" [ngClass]="'badge-' + item.typeTone">{{ item.type }}</span></td>
                <td><span class="badge" [ngClass]="'badge-' + item.lifecycleTone">{{ item.lifecycle }}</span></td>
                <td>{{ item.revision }}</td>
                <td><span class="badge" [ngClass]="'badge-' + item.ecmTone">{{ item.ecmStatus }}</span></td>
                <td class="muted-cell">{{ item.updated }}</td>
                <td><button class="open-btn" type="button" (click)="openItem(item.item); $event.stopPropagation()">Open →</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-template #createItemView>
        <div class="create-header">
          <h1><span>+</span> Create Item</h1>
          <p>Create a new pharma item with AI-assisted attributes and inline BOM/Formula association.</p>
        </div>

        <div class="create-grid">
          <section>
            <h2>Item Details</h2>
            <form class="create-card" (ngSubmit)="createItem()">
              <label class="field full">
                <span>Item Type *</span>
                <select [(ngModel)]="draft.itemType" name="itemType">
                  <option>Finished Good</option>
                  <option>Drug Substance</option>
                  <option>Raw Material</option>
                  <option>Packaging</option>
                  <option>Semi-Finished Good</option>
                </select>
              </label>

              <label class="field item-number-field">
                <span>Item Number</span>
                <input [(ngModel)]="draft.itemNumber" name="itemNumber" />
                <small>Leave blank to auto generate on save</small>
              </label>
              <button class="generate-btn" type="button" (click)="draft.itemNumber = 'FG-010'">Generate</button>

              <label class="field full">
                <span>Description *</span>
                <input [(ngModel)]="draft.description" name="description" />
              </label>

              <div class="ai-suggestions full">
                <strong>✦ AI Suggested Attributes - click to apply</strong>
                <div>
                  <button type="button" (click)="applySuggestion('dosageForm', 'Film-Coated Tablet')">Dosage Form: Film-Coated Tablet</button>
                  <button type="button" (click)="applySuggestion('route', 'Oral')">Route: Oral</button>
                  <button type="button" (click)="applySuggestion('classification', 'Rx - Schedule H')">Classification: Rx - Schedule H</button>
                  <button type="button" (click)="applySuggestion('gmpGrade', 'ICH Q7')">GMP Grade: ICH Q7</button>
                  <button type="button" (click)="applySuggestion('shelfLife', '24 months')">Shelf Life: 24 months</button>
                  <button type="button">Storage: 2-8C</button>
                </div>
              </div>

              <label class="field">
                <span>Dosage Form</span>
                <select [(ngModel)]="draft.dosageForm" name="dosageForm">
                  <option>Film-Coated Tablet</option>
                  <option>Capsule</option>
                  <option>Oral Solution</option>
                  <option>Injection</option>
                </select>
              </label>
              <label class="field">
                <span>Strength</span>
                <input [(ngModel)]="draft.strength" name="strength" placeholder="e.g. 100 mg" />
              </label>
              <label class="field">
                <span>Route of Administration</span>
                <select [(ngModel)]="draft.route" name="route">
                  <option>Oral</option>
                  <option>Topical</option>
                  <option>Injection</option>
                  <option>Inhalation</option>
                </select>
              </label>
              <label class="field">
                <span>Classification</span>
                <input [(ngModel)]="draft.classification" name="classification" placeholder="e.g. Rx - Schedule H" />
              </label>
              <label class="field">
                <span>GMP Grade</span>
                <select [(ngModel)]="draft.gmpGrade" name="gmpGrade">
                  <option>ICH Q7</option>
                  <option>USP</option>
                  <option>EP</option>
                </select>
              </label>
              <label class="field">
                <span>Shelf Life</span>
                <input [(ngModel)]="draft.shelfLife" name="shelfLife" placeholder="e.g. 24 months" />
              </label>
              <label class="field full">
                <span>Initial Lifecycle</span>
                <select [(ngModel)]="draft.lifecycle" name="lifecycle">
                  <option>Preliminary</option>
                  <option>Design</option>
                  <option>Prototype</option>
                  <option>Production</option>
                </select>
                <small>Items start as Preliminary; promote via ECO workflow</small>
              </label>

              <div class="form-actions full">
                <button class="btn btn-primary btn-lg" type="submit">✓ Create Item & Link to BOM</button>
                <button class="btn btn-secondary btn-lg" type="button">Save as Draft</button>
                <button class="btn btn-ghost btn-lg" type="button" (click)="goToItems()">Cancel</button>
              </div>
            </form>
          </section>

          <section>
            <h2>📦 Inline BOM / Formula Association</h2>
            <div class="create-card bom-card">
              <label class="field full">
                <span>Associate with Formula / BOM</span>
                <select [(ngModel)]="draft.bomLink" name="bomLink">
                  <option>FG-001 - Product-X (BOM Rev B)</option>
                  <option>FG-002 - New Product Formula</option>
                </select>
              </label>
              <label class="field full">
                <span>Parent Assembly / Formula Level</span>
                <select [(ngModel)]="draft.parentLevel" name="parentLevel">
                  <option>Top Level Finished Good (FG)</option>
                  <option>Tablet Core</option>
                  <option>Film Coating</option>
                </select>
              </label>
              <label class="field">
                <span>Quantity</span>
                <input type="number" [(ngModel)]="draft.quantity" name="quantity" />
              </label>
              <label class="field">
                <span>Unit</span>
                <select [(ngModel)]="draft.unit" name="unit">
                  <option>mg</option>
                  <option>g</option>
                  <option>mL</option>
                  <option>unit</option>
                </select>
              </label>
              <label class="field full">
                <span>Reference / Function</span>
                <input [(ngModel)]="draft.reference" name="reference" placeholder="e.g. API, Binder, Disintegrant, Lubricant..." />
              </label>
              <div class="ai-suggestions full bom-suggestion">
                <strong>✦ AI BOM Placement Suggestion</strong>
                <p>Based on item type <b>Finished Good</b>, AI suggests placing at Top Level and auto-linking existing components COMP-001, COMP-003 as sub-items.</p>
                <button type="button">Apply Suggestion</button>
                <button type="button">View Similar Items</button>
              </div>
            </div>

            <h2 class="preview-title">BOM Hierarchy Preview <small>- click rows to select</small></h2>
            <div class="bom-preview">
              <div class="bom-row selected"><span>▼ 📦 Product-X (FG-001)</span><small>FG-001&nbsp;&nbsp; 1 unit</small><b class="badge badge-yellow">Prototype</b></div>
              <div class="bom-row indent-1"><span>🧪 DS-001 - Active Pharmaceutical Ingredient A</span><small>DS-001&nbsp;&nbsp; 50 mg</small><b class="badge badge-green">Production</b></div>
              <div class="bom-row indent-1"><span>◼ COMP-001 - Tablet Core</span><small>COMP-001&nbsp;&nbsp; 200 mg</small><b class="badge badge-green">Production</b></div>
              <div class="bom-row indent-2"><span>🔬 Microcrystalline Cellulose (Binder)</span><small>DS-002&nbsp;&nbsp; 100 mg</small><b class="badge badge-gray">Preliminary</b></div>
              <div class="bom-row indent-2"><span>🔬 Crospovidone (Disintegrant)</span><small>RM-014&nbsp;&nbsp; 30 mg</small><b class="badge badge-green">Production</b></div>
              <div class="bom-row indent-1"><span>🟡 COMP-003 - Modified Release Coat</span><small>COMP-003&nbsp;&nbsp; 15 mg</small><b class="badge badge-yellow">Prototype</b></div>
              <div class="bom-row indent-1"><span>📦 PKG-001 - Blister Pack PVDC Aluminium</span><small>PKG-001&nbsp;&nbsp; 1 unit</small><b class="badge badge-green">Production</b></div>
              <button class="add-bom" type="button">+ Add Component to BOM</button>
            </div>

            <h2 class="preview-title">Item Preview</h2>
            <div class="item-preview">
              <div><span>Auto-generated Item ID</span><strong>{{ draft.itemNumber || 'FG-002' }}</strong></div>
              <div><span>Name</span><strong>{{ draft.description || '-' }}</strong></div>
              <div><span>Type</span><b class="badge badge-gray">{{ draft.itemType }}</b></div>
              <div><span>Lifecycle</span><b class="badge badge-gray">{{ draft.lifecycle }}</b></div>
              <div><span>BOM Link</span><strong>FG-001 - Rev B</strong></div>
            </div>

            <h2 class="preview-title">✦ Similar Existing Items</h2>
            <div class="similar-items">
              <p>AI found similar items - avoid duplicates:</p>
              <div><span><b>FG-001</b> - Product-X Tablet 50mg<br><small>Finished Good - Prototype - Rev B</small></span><button type="button">Use Existing</button></div>
              <div><span><b>DS-001</b> - API Intermediate<br><small>Drug Substance - Production - Rev C</small></span><button type="button">Use Existing</button></div>
            </div>
          </section>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    :host { display: block; min-height: calc(100vh - 52px); }
    * { box-sizing: border-box; }
    button, input, select, textarea { font: inherit; }
    .items-page {
      --bg:#0d1117;--bg2:#161b22;--bg3:#21262d;--bg4:#30363d;
      --border:#30363d;--text:#e6edf3;--text2:#8b949e;--text3:#6e7681;
      --accent:#2f81f7;--green:#3fb950;--yellow:#d29922;--red:#f85149;--purple:#bc8cff;
      min-height: calc(100vh - 52px);
      padding: 34px 36px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .items-page.light-theme {
      --bg:#f5f7fa;--bg2:#ffffff;--bg3:#eef2f7;--bg4:#dfe5ec;
      --border:#d8dee7;--text:#172033;--text2:#59677c;--text3:#7b8798;
      --accent:#1f6feb;--green:#1a7f37;--yellow:#9a6700;--red:#cf222e;--purple:#8250df;
    }
    .page-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:24px; }
    .page-header h1, .create-header h1 { margin:0; color:var(--text); font-size:26px; font-weight:800; letter-spacing:-.03em; }
    .create-header h1 span { color: var(--purple); }
    .page-header p, .create-header p { margin:4px 0 0; color:var(--text2); font-size:15px; }
    .create-header { margin-bottom: 20px; }
    .page-actions { display:flex; gap:10px; margin-top:-2px; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid transparent; border-radius:7px; cursor:pointer; font-weight:700; transition:background .15s,border-color .15s,color .15s; }
    .btn-sm { min-height:30px; padding:5px 13px; font-size:14px; }
    .btn-lg { min-height:34px; padding:7px 14px; font-size:12px; }
    .btn-primary { border-color:var(--accent); background:var(--accent); color:#fff; }
    .btn-secondary { border-color:var(--border); background:var(--bg3); color:var(--text); }
    .btn-ghost { border-color:transparent; background:transparent; color:var(--text2); }
    .search-bar { display:flex; align-items:center; gap:10px; margin-bottom:20px; padding:10px 14px; border:1px solid var(--border); border-radius:9px; background:var(--bg3); }
    .search-icon { color:var(--accent); font-size:21px; line-height:1; }
    .search-bar input { flex:1; min-width:0; border:0; outline:none; background:transparent; color:var(--text); font-size:16px; }
    .search-bar input::placeholder { color:var(--text3); }
    .filter-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
    .filter-chip { display:inline-flex; align-items:center; padding:3px 10px; border:1px solid var(--border); border-radius:999px; background:var(--bg3); color:var(--text2); cursor:pointer; font-size:13px; font-weight:650; line-height:1.2; }
    .filter-chip.active { border-color:rgba(47,129,247,.4); background:rgba(47,129,247,.16); color:var(--accent); }
    .table-wrap { overflow:hidden; border:1px solid var(--border); border-radius:9px; background:var(--bg); }
    table { width:100%; border-collapse:collapse; font-size:15px; }
    thead { background:var(--bg3); }
    th { padding:12px 16px; color:var(--text2); font-size:13px; font-weight:800; letter-spacing:.05em; text-align:left; text-transform:uppercase; }
    td { padding:15px 16px; border-top:1px solid var(--border); color:var(--text); vertical-align:middle; }
    tbody tr { cursor:pointer; transition:background .12s; }
    tbody tr:hover td { background:rgba(255,255,255,.025); }
    .item-link { color:var(--accent); font-weight:800; }
    .muted-cell { color:var(--text2); white-space:nowrap; }
    .badge { display:inline-flex; align-items:center; width:max-content; padding:3px 10px; border:1px solid var(--border); border-radius:999px; background:var(--bg3); font-size:13px; font-weight:800; line-height:1.2; white-space:nowrap; }
    .badge-blue { border-color:rgba(47,129,247,.35); background:rgba(47,129,247,.15); color:var(--accent); }
    .badge-purple { border-color:rgba(188,140,255,.35); background:rgba(188,140,255,.15); color:var(--purple); }
    .badge-gray { border-color:var(--border); background:var(--bg3); color:var(--text2); }
    .badge-green { border-color:rgba(63,185,80,.35); background:rgba(63,185,80,.15); color:var(--green); }
    .badge-yellow { border-color:rgba(210,153,34,.35); background:rgba(210,153,34,.15); color:var(--yellow); }
    .open-btn { border:0; background:transparent; color:var(--text2); cursor:pointer; font-size:14px; font-weight:700; white-space:nowrap; }
    .open-btn:hover { color:var(--accent); }
    .create-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:22px; }
    h2 { margin:0 0 10px; color:var(--text); font-size:13px; font-weight:800; }
    .create-card, .bom-preview, .item-preview, .similar-items { border:1px solid var(--border); border-radius:10px; background:var(--bg2); }
    .create-card { display:grid; grid-template-columns:1fr 1fr; gap:14px; padding:18px; }
    .field { display:flex; min-width:0; flex-direction:column; gap:7px; }
    .field.full, .ai-suggestions.full, .form-actions.full { grid-column:1 / -1; }
    .field span { color:var(--text2); font-size:12px; font-weight:700; }
    .field input, .field select { width:100%; min-height:36px; border:1px solid var(--border); border-radius:6px; outline:none; background:var(--bg3); color:var(--text); padding:8px 11px; font-size:13px; }
    .field small { color:var(--text3); font-size:11px; }
    .item-number-field { grid-column:1 / 2; }
    .generate-btn { align-self:center; justify-self:start; margin-top:19px; min-height:32px; padding:5px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg3); color:var(--text); cursor:pointer; font-size:12px; font-weight:700; }
    .ai-suggestions { padding:12px; border:1px solid rgba(188,140,255,.28); border-radius:8px; background:rgba(188,140,255,.07); }
    .ai-suggestions strong { display:block; margin-bottom:8px; color:var(--purple); font-size:11px; }
    .ai-suggestions button { margin:2px 4px 2px 0; padding:3px 9px; border:1px solid var(--border); border-radius:999px; background:var(--bg3); color:var(--text); cursor:pointer; font-size:11px; font-weight:700; }
    .bom-suggestion p { margin:0 0 8px; color:var(--text2); font-size:12px; line-height:1.45; }
    .form-actions { display:flex; gap:8px; padding-top:10px; border-top:1px solid var(--border); }
    .preview-title { margin-top:18px; }
    .preview-title small { color:var(--text3); font-weight:500; }
    .bom-preview { padding:8px; }
    .bom-row { display:grid; grid-template-columns:1fr auto auto; gap:14px; align-items:center; padding:8px 10px; border-radius:7px; color:var(--text); font-size:12px; }
    .bom-row.selected { background:rgba(47,129,247,.15); border-left:2px solid var(--accent); }
    .bom-row small { color:var(--text3); }
    .indent-1 span { padding-left:22px; }
    .indent-2 span { padding-left:44px; }
    .add-bom { display:block; width:100%; margin-top:6px; padding:9px; border:0; border-top:1px solid var(--border); background:transparent; color:var(--text2); cursor:pointer; font-size:12px; }
    .item-preview { padding:12px; }
    .item-preview div { display:flex; justify-content:space-between; gap:12px; margin-bottom:8px; font-size:12px; }
    .item-preview span { color:var(--text3); }
    .item-preview strong { color:var(--accent); }
    .similar-items { padding:12px; }
    .similar-items p { margin:0 0 10px; color:var(--text2); font-size:12px; }
    .similar-items div { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:7px 0; color:var(--text); font-size:12px; }
    .similar-items small { color:var(--text3); }
    .similar-items button { border:0; background:transparent; color:var(--text2); cursor:pointer; font-weight:700; }
    @media (max-width:1100px) {
      .items-page { padding:24px 20px; }
      .table-wrap { overflow-x:auto; }
      table { min-width:980px; }
      .page-header-row, .form-actions { flex-direction:column; }
      .create-grid { grid-template-columns:1fr; }
    }
  `,
})
export class Items {
  readonly inventoryService = inject(InventoryService);
  readonly themeService = inject(ThemeService);
  readonly router = inject(Router);

  draft = {
    itemType: 'Finished Good',
    itemNumber: 'FG-010',
    description: 'test',
    dosageForm: 'Film-Coated Tablet',
    strength: '',
    route: 'Oral',
    classification: '',
    gmpGrade: 'ICH Q7',
    shelfLife: '',
    lifecycle: 'Preliminary',
    bomLink: 'FG-001 - Product-X (BOM Rev B)',
    parentLevel: 'Top Level Finished Good (FG)',
    quantity: 1,
    unit: 'mg',
    reference: '',
  };

  readonly items: PharmaItem[] = [
    { item: 'FG-001', description: 'Product-X (Finished Drug Product)', type: 'Finished Good', typeTone: 'blue', lifecycle: 'Prototype', lifecycleTone: 'yellow', revision: 'B', ecmStatus: 'Defined', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'DS-001', description: 'Active Pharmaceutical Ingredient A', type: 'Drug Substance', typeTone: 'purple', lifecycle: 'Production', lifecycleTone: 'green', revision: 'C', ecmStatus: 'Completed', ecmTone: 'green', updated: '01 Jun 2026' },
    { item: 'DS-002', description: 'Excipient - Microcrystalline Cellulose', type: 'Drug Substance', typeTone: 'purple', lifecycle: 'Preliminary', lifecycleTone: 'gray', revision: 'A', ecmStatus: 'Pending', ecmTone: 'yellow', updated: '02 Jun 2026' },
    { item: 'COMP-001', description: 'Component A - Tablet Core', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Production', lifecycleTone: 'green', revision: 'B', ecmStatus: 'Completed', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'COMP-002', description: 'Component B - Film Coating', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Production', lifecycleTone: 'green', revision: 'B', ecmStatus: 'Completed', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'COMP-003', description: 'Component C - Modified Release Coat', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Prototype', lifecycleTone: 'yellow', revision: 'A', ecmStatus: 'Pending', ecmTone: 'yellow', updated: '07 Jun 2026' },
    { item: 'PKG-001', description: 'Blister Pack - PVDC Aluminium', type: 'Packaging', typeTone: 'green', lifecycle: 'Production', lifecycleTone: 'green', revision: 'A', ecmStatus: 'Completed', ecmTone: 'green', updated: '04 Jun 2026' },
  ];

  get isCreateMode(): boolean {
    return this.router.url.split('?')[0] === '/items/create';
  }

  goToCreate() {
    this.router.navigate(['/items/create']);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }

  openItem(itemNumber: string) {
    const existingItem = this.inventoryService.inventory().find(product => product.sku === itemNumber);
    this.router.navigate(['/items', existingItem?.sku || itemNumber]);
  }

  applySuggestion(field: 'dosageForm' | 'route' | 'classification' | 'gmpGrade' | 'shelfLife', value: string) {
    this.draft[field] = value;
  }

  createItem() {
    const sku = this.draft.itemNumber.trim() || 'FG-002';
    this.inventoryService.addProduct({
      sku,
      name: this.draft.description || sku,
      partDescription: this.draft.description,
      partType: this.draft.itemType,
      type: 'Part',
      part: 'Part',
      category: this.draft.itemType,
      quantity: Number(this.draft.quantity) || 0,
      revision: 'A.00',
      lifecycle: 'Design',
      dosageForm: this.draft.dosageForm,
      strength: this.draft.strength,
      routeOfAdministration: this.draft.route,
      classification: this.draft.classification,
      unitOfMeasure: this.draft.unit,
    });
    this.router.navigate(['/items', sku]);
  }
}
