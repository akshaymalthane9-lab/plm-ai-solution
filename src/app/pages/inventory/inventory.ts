import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService, Product } from '../../services/inventory.service';
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
  imports: [CommonModule],
  template: `
    <div class="items-page" [class.light-theme]="themeService.theme() === 'light'">
      <div class="page-header-row">
        <div class="page-header">
          <h1>Items</h1>
          <p>Drug substances, products, components, and packaging</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" type="button">Browse Released</button>
          <button class="btn btn-primary btn-sm" type="button">+ Create Item</button>
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
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: calc(100vh - 52px);
    }
    * {
      box-sizing: border-box;
    }
    button,
    input {
      font: inherit;
    }
    .items-page {
      --bg: #0d1117;
      --bg2: #161b22;
      --bg3: #21262d;
      --bg4: #30363d;
      --border: #30363d;
      --text: #e6edf3;
      --text2: #8b949e;
      --text3: #6e7681;
      --accent: #2f81f7;
      --green: #3fb950;
      --yellow: #d29922;
      --red: #f85149;
      --purple: #bc8cff;
      --teal: #39d353;
      min-height: calc(100vh - 52px);
      padding: 34px 36px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .items-page.light-theme {
      --bg: #f5f7fa;
      --bg2: #ffffff;
      --bg3: #eef2f7;
      --bg4: #dfe5ec;
      --border: #d8dee7;
      --text: #172033;
      --text2: #59677c;
      --text3: #7b8798;
      --accent: #1f6feb;
      --green: #1a7f37;
      --yellow: #9a6700;
      --red: #cf222e;
      --purple: #8250df;
      --teal: #087f8c;
    }
    .page-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -.03em;
    }
    .page-header p {
      margin: 4px 0 0;
      color: var(--text2);
      font-size: 15px;
    }
    .page-actions {
      display: flex;
      gap: 10px;
      margin-top: -2px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid transparent;
      border-radius: 7px;
      cursor: pointer;
      font-weight: 700;
      transition: background .15s, border-color .15s, color .15s;
    }
    .btn-sm {
      min-height: 30px;
      padding: 5px 13px;
      font-size: 14px;
    }
    .btn-primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .btn-secondary {
      border-color: var(--border);
      background: var(--bg3);
      color: var(--text);
    }
    .btn-ghost {
      border-color: transparent;
      background: transparent;
      color: var(--text2);
    }
    .btn-ghost:hover {
      background: var(--bg3);
      color: var(--text);
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--bg3);
    }
    .search-icon {
      color: var(--accent);
      font-size: 21px;
      line-height: 1;
    }
    .search-bar input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--text);
      font-size: 16px;
    }
    .search-bar input::placeholder {
      color: var(--text3);
    }
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 18px;
    }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--bg3);
      color: var(--text2);
      cursor: pointer;
      font-size: 13px;
      font-weight: 650;
      line-height: 1.2;
    }
    .filter-chip.active {
      border-color: rgba(47,129,247,.4);
      background: rgba(47,129,247,.16);
      color: var(--accent);
    }
    .table-wrap {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--bg);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
    }
    thead {
      background: var(--bg3);
    }
    th {
      padding: 12px 16px;
      color: var(--text2);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .05em;
      text-align: left;
      text-transform: uppercase;
    }
    td {
      padding: 15px 16px;
      border-top: 1px solid var(--border);
      color: var(--text);
      vertical-align: middle;
    }
    tbody tr {
      cursor: pointer;
      transition: background .12s;
    }
    tbody tr:hover td {
      background: rgba(255,255,255,.025);
    }
    .item-link {
      color: var(--accent);
      font-weight: 800;
    }
    .muted-cell {
      color: var(--text2);
      white-space: nowrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      width: max-content;
      padding: 3px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--bg3);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
      white-space: nowrap;
    }
    .badge-blue {
      border-color: rgba(47,129,247,.35);
      background: rgba(47,129,247,.15);
      color: var(--accent);
    }
    .badge-purple {
      border-color: rgba(188,140,255,.35);
      background: rgba(188,140,255,.15);
      color: var(--purple);
    }
    .badge-gray {
      border-color: var(--border);
      background: var(--bg3);
      color: var(--text2);
    }
    .badge-green {
      border-color: rgba(63,185,80,.35);
      background: rgba(63,185,80,.15);
      color: var(--green);
    }
    .badge-yellow {
      border-color: rgba(210,153,34,.35);
      background: rgba(210,153,34,.15);
      color: var(--yellow);
    }
    .open-btn {
      border: 0;
      background: transparent;
      color: var(--text2);
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }
    .open-btn:hover {
      color: var(--accent);
    }
    @media (max-width: 980px) {
      .items-page {
        padding: 24px 20px;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        min-width: 980px;
      }
      .page-header-row {
        flex-direction: column;
      }
    }
  `,
})
export class Items {
  readonly inventoryService = inject(InventoryService);
  readonly themeService = inject(ThemeService);
  readonly router = inject(Router);

  readonly items: PharmaItem[] = [
    { item: 'FG-001', description: 'Product-X (Finished Drug Product)', type: 'Finished Good', typeTone: 'blue', lifecycle: 'Prototype', lifecycleTone: 'yellow', revision: 'B', ecmStatus: 'Defined', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'DS-001', description: 'Active Pharmaceutical Ingredient A', type: 'Drug Substance', typeTone: 'purple', lifecycle: 'Production', lifecycleTone: 'green', revision: 'C', ecmStatus: 'Completed', ecmTone: 'green', updated: '01 Jun 2026' },
    { item: 'DS-002', description: 'Excipient — Microcrystalline Cellulose', type: 'Drug Substance', typeTone: 'purple', lifecycle: 'Preliminary', lifecycleTone: 'gray', revision: 'A', ecmStatus: 'Pending', ecmTone: 'yellow', updated: '02 Jun 2026' },
    { item: 'COMP-001', description: 'Component A — Tablet Core', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Production', lifecycleTone: 'green', revision: 'B', ecmStatus: 'Completed', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'COMP-002', description: 'Component B — Film Coating', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Production', lifecycleTone: 'green', revision: 'B', ecmStatus: 'Completed', ecmTone: 'green', updated: '05 Jun 2026' },
    { item: 'COMP-003', description: 'Component C — Modified Release Coat', type: 'Semi-Finished', typeTone: 'gray', lifecycle: 'Prototype', lifecycleTone: 'yellow', revision: 'A', ecmStatus: 'Pending', ecmTone: 'yellow', updated: '07 Jun 2026' },
    { item: 'PKG-001', description: 'Blister Pack — PVDC Aluminium', type: 'Packaging', typeTone: 'green', lifecycle: 'Production', lifecycleTone: 'green', revision: 'A', ecmStatus: 'Completed', ecmTone: 'green', updated: '04 Jun 2026' },
  ];

  openItem(itemNumber: string) {
    const existingItem = this.inventoryService.inventory().find(product => product.sku === itemNumber);
    this.router.navigate(['/items', existingItem?.sku || itemNumber]);
  }
}
