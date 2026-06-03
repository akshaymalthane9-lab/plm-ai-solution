import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, InventoryService } from '../../services/inventory.service';
import { UserService } from '../../services/user.service';

type ItemDetailTab = 'Overview' | 'Changes' | 'Relationship' | 'WhereUsed' | 'Attachments' | 'History';
type ChangeDetailTab = 'ChangeOrders' | 'ChangeRequests' | 'Deviation';
type BomTreeNode = {
  product: Product;
  level: number;
  path: string[];
};

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container flex-col gap-6">
      <div class="page-header flex justify-between items-center mt-4" *ngIf="item">
        <div>
          <div class="title-row flex items-center gap-4">
            <h1 class="page-title font-mono">{{ item.sku }}</h1>
            <span class="type-badge">{{ item.lifecycle }}</span>
            <span class="revision-pill">Revision {{ item.revision }}</span>
          </div>
        
        </div>

        <div class="flex items-center gap-4">
          <button class="btn btn-secondary" routerLink="/items">Back to Items</button>
      
        </div>
      </div>

      <div class="tabs flex border-b w-full mb-6">
        <button class="tab-btn" [class.active]="activeTab === 'Overview'" (click)="activeTab = 'Overview'">Item Overview</button>
        <button class="tab-btn" [class.active]="activeTab === 'Changes'" (click)="activeTab = 'Changes'">Changes</button>
        <button class="tab-btn" [class.active]="activeTab === 'Relationship'" (click)="activeTab = 'Relationship'">Relationship</button>
        <button class="tab-btn" [class.active]="activeTab === 'WhereUsed'" (click)="activeTab = 'WhereUsed'">Where Used</button>
        <button class="tab-btn" [class.active]="activeTab === 'Attachments'" (click)="activeTab = 'Attachments'">Attachments</button>
        <button class="tab-btn" [class.active]="activeTab === 'History'" (click)="activeTab = 'History'">History</button>
      </div>

      <div class="tab-content" *ngIf="item">
        <ng-container *ngIf="activeTab === 'Overview'">
          <section class="item-overview-panel">
            <button class="btn overview-edit" type="button" [disabled]="userService.isReadOnly()">Edit</button>

            <div class="overview-details">
              <div class="overview-row">
                <span class="overview-label">Part Number:</span>
                <span class="overview-value text-primary font-mono">{{ item.sku }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Unit of Measure:</span>
                <span class="overview-value">{{ getUnitOfMeasure() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Name:</span>
                <span class="overview-value">{{ item.name }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Classification:</span>
                <span class="overview-value">{{ getPartTypeLabel() }} | {{ getClassificationLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Part Type:</span>
                <span class="overview-value">{{ getPartTypeLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Material:</span>
                <span class="overview-value">{{ getMaterialLabel() }}</span>
              </div>
              <div class="overview-row description-row">
                <span class="overview-label">Part Description:</span>
                <div>
                  <div class="description-box">{{ getPartDescription() }}</div>
                  <div class="character-count">{{ getPartDescription().length }}/1000</div>
                </div>
              </div>
              <div class="overview-row">
                <span class="overview-label">Color/Finish:</span>
                <span class="overview-value">{{ getColorFinishLabel() }}</span>
              </div>
              <div class="overview-row">
                <span class="overview-label">Lifecycle Status:</span>
                <span class="overview-value">{{ item.lifecycle }}</span>
              </div>
            </div>
          </section>

          <div class="overview-divider"></div>

          <section class="bom-overview">
            <h3 class="bom-title">BOM</h3>
            <div class="bom-actions" *ngIf="!userService.isReadOnly()">
              <button class="btn btn-primary bom-btn" type="button" (click)="openBomAdd(item.sku)">Add</button>
              <button class="btn bom-btn" type="button" style="background:#dc2626;color:#fff;border-color:#dc2626" [disabled]="getBomTree().length === 0" (click)="openBomRemove()">Remove</button>
              <button class="btn bom-btn" type="button" style="background:#1479bd;color:#fff;border-color:#1479bd">Compare</button>
            </div>

            <div class="bom-add-panel" *ngIf="isBomAddOpen && !userService.isReadOnly()">
              <div class="bom-add-context">
                Adding under <strong class="font-mono">{{ selectedBomParentSku }}</strong>
              </div>
              <select class="bom-select" [(ngModel)]="selectedBomChildSku" aria-label="Select item to add to BOM">
                <option value="">Select item</option>
                <option *ngFor="let product of getAvailableBomItems()" [value]="product.sku">
                  {{ product.sku }} - {{ product.name }}
                </option>
              </select>
              <button class="btn btn-primary bom-add-confirm" type="button" [disabled]="!selectedBomChildSku" (click)="addBomItem()">Add Item</button>
              <button class="btn bom-btn" type="button" (click)="closeBomAdd()">Cancel</button>
            </div>

            <div class="bom-add-panel" *ngIf="isBomRemoveOpen && !userService.isReadOnly()">
              <div>Remove BOM item</div>
              <select class="bom-select" [(ngModel)]="selectedBomRemovePath" aria-label="Select BOM item to remove">
                <option value="">Select item</option>
                <option *ngFor="let node of getBomTree()" [value]="node.path.join('>')">
                  {{ node.product.sku }} - {{ node.product.name }}
                </option>
              </select>
              <button class="btn bom-btn" type="button" style="background:#dc2626;color:#fff;border-color:#dc2626" [disabled]="!selectedBomRemovePath" (click)="removeSelectedBomItem()">Remove Item</button>
              <button class="btn bom-btn" type="button" (click)="closeBomRemove()">Cancel</button>
            </div>

            <div class="bom-tree border rounded">
              <div class="bom-tree-header">
                <span>Item Number</span>
                <span>Description</span>
                <span>Revision</span>
                <span>Lifecycle Phase</span>
                <span>Qty</span>
                <span>BOM Level</span>
                <span *ngIf="!userService.isReadOnly()">Actions</span>
              </div>

              <div
                *ngFor="let node of getBomTree()"
                class="bom-tree-row hover-row"
                [style.--bom-level]="node.level"
              >
                <button class="bom-item-link font-mono font-medium" type="button" (click)="navigateToItem(node.product.sku)">
                  <span aria-hidden="true">L-</span>{{ node.product.sku }}
                </button>
                <span>{{ getBomDescription(node.product) }}</span>
                <span>{{ node.product.revision }}</span>
                <span>{{ node.product.lifecycle }}</span>
                <span>{{ getBomQuantity(node.level) }}</span>
                <span>{{ node.level }}</span>
                <span *ngIf="!userService.isReadOnly()" style="display:flex;gap:.5rem">
                  <button class="btn btn-primary bom-btn" type="button" (click)="openBomAdd(node.product.sku)">Add child</button>
                  <button class="btn bom-btn" type="button" style="background:#dc2626;color:#fff;border-color:#dc2626" (click)="removeBomItem(node)">Remove</button>
                </span>
              </div>

              <div *ngIf="getBomTree().length === 0" class="bom-empty text-center py-12 text-muted">
                No BOM components attached to this item.
              </div>
            </div>
          </section>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Relationship'">
          <section class="relationship-panel">
            <h2 class="relationship-title">Relationship</h2>

            <div class="relationship-summary flex justify-between items-center">
              <span>Related Objects</span>
              <span class="relationship-count">({{ getRelationshipObjects().length }} {{ getRelationshipObjects().length === 1 ? 'object' : 'objects' }})</span>
            </div>

            <div class="relationship-actions">
              <button class="btn btn-primary" type="button" [disabled]="userService.isReadOnly()" (click)="openRelationshipAdd()">+ Add</button>
              <button class="btn relation-action" type="button" style="background:#dc2626;color:#fff;border-color:#dc2626" [disabled]="userService.isReadOnly() || getRelationshipObjects().length === 0" (click)="openRelationshipRemove()">- Remove</button>
              <button class="btn relation-action" type="button" [disabled]="userService.isReadOnly()">Edit Rule</button>
            </div>

            <div class="bom-add-panel" *ngIf="isRelationshipAddOpen && !userService.isReadOnly()">
              <div>Add relationship</div>
              <select class="bom-select" [(ngModel)]="selectedRelationshipSku" aria-label="Select related item">
                <option value="">Select item</option>
                <option *ngFor="let product of getAvailableRelationshipItems()" [value]="product.sku">
                  {{ product.sku }} - {{ product.name }}
                </option>
              </select>
              <button class="btn btn-primary" type="button" [disabled]="!selectedRelationshipSku" (click)="addRelationshipItem()">Add Item</button>
              <button class="btn relation-action" type="button" (click)="closeRelationshipAdd()">Cancel</button>
            </div>

            <div class="bom-add-panel" *ngIf="isRelationshipRemoveOpen && !userService.isReadOnly()">
              <div>Remove relationship</div>
              <select class="bom-select" [(ngModel)]="selectedRelationshipSku" aria-label="Select relationship to remove">
                <option value="">Select item</option>
                <option *ngFor="let product of getRelationshipObjects()" [value]="product.sku">
                  {{ product.sku }} - {{ product.name }}
                </option>
              </select>
              <button class="btn relation-action" type="button" style="background:#dc2626;color:#fff;border-color:#dc2626" [disabled]="!selectedRelationshipSku" (click)="removeRelationshipItem()">Remove Item</button>
              <button class="btn relation-action" type="button" (click)="closeRelationshipRemove()">Cancel</button>
            </div>

            <div class="change-table-wrap">
              <table class="change-table relationship-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Revision</th>
                    <th>Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let related of getRelationshipObjects()" class="hover-row">
                    <td class="font-mono">{{ related.sku }}</td>
                    <td><button class="relationship-link" type="button" (click)="navigateToItem(related.sku)">{{ related.name }}</button></td>
                    <td>{{ getBomDescription(related) }}</td>
                    <td>{{ related.revision }}</td>
                    <td>
                      <span>Fulfill</span>
                      <button
                        *ngIf="!userService.isReadOnly()"
                        class="btn relation-action"
                        type="button"
                        style="margin-left:.75rem;background:#dc2626;color:#fff;border-color:#dc2626"
                        (click)="removeRelationshipItem(related.sku)"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="getRelationshipObjects().length === 0">
                    <td colspan="5" class="change-empty">No related objects available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </ng-container>

        <ng-container *ngIf="activeTab === 'WhereUsed'">
          <div class="empty-state card p-8 text-center">
            <p>No parent assemblies currently reference this item.</p>
          </div>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Attachments'">
          <section class="attachment-panel">
            <h2 class="relationship-title">Attachments</h2>
            <p class="attachment-subtitle">Files attached to {{ item.sku }}</p>

            <div class="attachment-toolbar">
              <div class="relationship-actions">
                <button class="btn btn-primary" type="button" [disabled]="userService.isReadOnly()">+ Add</button>
                <button class="btn relation-action" type="button" [disabled]="userService.isReadOnly()">- Remove</button>
                <button class="btn relation-action" type="button">Download</button>
                <button class="btn relation-action" type="button" [disabled]="userService.isReadOnly()">Check-In</button>
                <button class="btn relation-action" type="button" [disabled]="userService.isReadOnly()">Check Out</button>
                <button class="btn relation-action" type="button" [disabled]="userService.isReadOnly()">Cancel Check Out</button>
              </div>
              <label class="changes-search attachment-search">
                <input
                  type="search"
                  placeholder="Search in table"
                  [value]="attachmentSearchQuery"
                  (input)="attachmentSearchQuery = $any($event.target).value"
                >
              </label>
            </div>

            <div class="change-table-wrap">
              <table class="change-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Version</th>
                    <th>Size</th>
                    <th>Modified On</th>
                    <th>Modified By</th>
                    <th>Checked Out User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let attachment of getVisibleAttachments(); let i = index">
                    <td class="relationship-link">{{ getAttachmentName(attachment, i) }}</td>
                    <td>{{ getAttachmentType(attachment) }}</td>
                    <td>{{ i === 0 ? 'A.3' : 'B.1' }}</td>
                    <td>{{ i === 0 ? '2.4 MB' : '348 KB' }}</td>
                    <td>{{ getTodayLabel() }}</td>
                    <td>{{ i === 0 ? 'Alex Johnson' : 'Priya Sharma' }}</td>
                    <td>{{ i === 0 ? '-' : 'Rahul Mehta' }}</td>
                  </tr>
                  <tr *ngIf="getVisibleAttachments().length === 0">
                    <td colspan="7" class="change-empty">No attachments available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="attachment-details">
              <strong>Attachment Details</strong>
              <p>{{ getAttachmentDetails() }}</p>
            </div>
          </section>
        </ng-container>

        <ng-container *ngIf="activeTab === 'Changes'">
          <section class="changes-panel">
            <div class="changes-subtabs">
              <button class="changes-subtab" type="button" [class.active]="activeChangeTab === 'ChangeOrders'" (click)="activeChangeTab = 'ChangeOrders'">Change Orders</button>
              <button class="changes-subtab" type="button" [class.active]="activeChangeTab === 'ChangeRequests'" (click)="activeChangeTab = 'ChangeRequests'">Change Requests</button>
              <button class="changes-subtab" type="button" [class.active]="activeChangeTab === 'Deviation'" (click)="activeChangeTab = 'Deviation'">Deviation</button>
            </div>

            <div class="changes-toolbar">
              <span class="changes-count">({{ getActiveChangeCount() }} {{ getActiveChangeLabel() }})</span>
              <label class="changes-search">
                <input
                  type="search"
                  placeholder="Search in table"
                  [value]="changeSearchQuery"
                  (input)="changeSearchQuery = $any($event.target).value"
                >
              </label>
            </div>

            <div class="change-table-wrap">
              <table class="change-table">
                <thead>
                  <tr>
                    <th class="select-col"><span class="table-checkbox" aria-hidden="true"></span></th>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Need Date</th>
                    <th>Context</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let change of getVisibleChanges()">
                    <td class="select-col"><span class="table-checkbox" aria-hidden="true"></span></td>
                    <td class="font-mono text-primary font-medium">{{ change.id }}</td>
                    <td>{{ change.description }}</td>
                    <td>Change Order</td>
                    <td>{{ change.status }}</td>
                    <td>{{ change.date || 'N/A' }}</td>
                    <td>{{ item.sku }}</td>
                  </tr>
                  <tr *ngIf="getVisibleChanges().length === 0">
                    <td colspan="7" class="change-empty">{{ getEmptyChangeMessage() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="changes-selected">({{ getVisibleChanges().length ? '0' : '0' }} objects selected)</div>
          </section>
        </ng-container>

        <ng-container *ngIf="activeTab === 'History'">
          <div *ngIf="item.history.length === 0" class="empty-state card p-8 text-center">
             <p>No history log entries for this product.</p>
          </div>
          <div *ngFor="let entry of item.history" class="history-entry mb-4 border-l-4 pl-4 py-2">
             <div class="font-medium">{{ entry.action }}</div>
             <div class="text-sm text-muted">{{ entry.user }} - {{ entry.date }}</div>
             <p class="text-sm mt-2" *ngIf="entry.details">{{ entry.details }}</p>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: `
    .page-container { max-width: 1200px; margin: 0 auto; width: 100%; color: var(--text-primary); }
    .page-header { padding: 0.25rem 0 0.75rem; }
    .page-title { font-size: 1.7rem; margin: 0; color: var(--text-primary); letter-spacing: 0; }
    .type-badge { background: var(--accent-primary-subtle); color: var(--accent-primary); padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .revision-pill { color: var(--text-secondary); border: 1px solid var(--border-color); padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.75rem; }

    .tabs { border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem; }
    .tab-btn { padding: 1rem 1.5rem; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all var(--transition-fast); text-transform: uppercase; }
    .tab-btn:focus { outline: none; }
    .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }

    .tab-content { min-height: 400px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); padding: 1.5rem; }
    .item-overview-panel { position: relative; padding-top: 0.25rem; }
    .overview-edit { position: absolute; top: 0; right: 0; padding: 0.55rem 1rem; border-radius: var(--border-radius-sm); background: var(--bg-surface); color: var(--text-secondary); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .overview-edit:disabled { opacity: 0.55; cursor: not-allowed; }
    .overview-details { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); column-gap: 4rem; row-gap: 1.35rem; padding: 1.25rem 5rem 0 0; }
    .overview-row { display: grid; grid-template-columns: 145px minmax(0, 1fr); align-items: start; gap: 1.25rem; }
    .overview-row:nth-child(2n) { grid-template-columns: 165px minmax(0, 1fr); }
    .overview-label { font-weight: 700; color: var(--text-secondary); line-height: 1.4; }
    .overview-value { color: var(--text-primary); line-height: 1.4; }
    .description-row { grid-row: span 2; }
    .description-box { min-height: 70px; padding: 0.85rem 1rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-surface-hover); color: var(--text-primary); line-height: 1.45; }
    .character-count { margin-top: 0.35rem; font-size: 0.75rem; color: var(--text-muted); }
    .overview-divider { height: 1px; background: var(--border-color); margin: 1.75rem 0 1.25rem; }
    .bom-title { margin: 0 0 1rem; font-size: 1.35rem; color: var(--text-primary); font-weight: 700; }
    .bom-actions { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .bom-btn { padding: 0.5rem 0.85rem; border-radius: var(--border-radius-sm); background: var(--bg-surface); color: var(--text-secondary); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .bom-add-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); background: var(--bg-surface-hover); }
    .bom-select { min-width: min(100%, 320px); min-height: 38px; border: 1px solid var(--border-color); }
    .bom-tree { overflow-x: auto; }
    .bom-tree-header, .bom-tree-row { display: grid; grid-template-columns: minmax(190px, 1.15fr) minmax(220px, 1.25fr) 110px 160px 80px 110px 180px; min-width: 980px; align-items: center; }
    .bom-tree-header { background: var(--bg-surface-hover); color: var(--text-secondary); font-weight: 700; font-size: 0.82rem; text-transform: uppercase; border-bottom: 2px solid var(--border-color); }
    .bom-tree-header span, .bom-tree-row > span, .bom-item-link { padding: 1rem 1.25rem; }
    .bom-tree-row { border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.875rem; }
    .bom-item-link { display: flex; align-items: center; gap: 0.35rem; border: 0; background: transparent; color: var(--accent-primary); text-align: left; cursor: pointer; padding-left: calc(1.25rem + (var(--bom-level) - 1) * 1.6rem); }

    .hover-row { transition: background var(--transition-fast); }
    .hover-row:hover { background: var(--bg-surface-hover); }

    .relationship-title { margin: 0 0 1.5rem; font-size: 1.45rem; font-weight: 700; letter-spacing: 0; }
    .relationship-summary { margin-bottom: 1.25rem; color: var(--text-secondary); font-size: 1rem; font-weight: 700; }
    .relationship-count { font-weight: 500; }
    .relationship-actions { display: flex; gap: 0.9rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .relation-action { min-width: 118px; background: #e5e7eb; color: var(--text-secondary); border: 1px solid #d1d5db; box-shadow: var(--shadow-sm); }
    .relation-action:disabled { opacity: 0.6; cursor: not-allowed; }
    .relationship-table { min-width: 860px; }
    .relationship-link { color: #1479bd; font-weight: 500; }
    .attachment-subtitle { margin: -0.75rem 0 1rem; color: var(--text-secondary); font-size: 0.9rem; }
    .attachment-toolbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .attachment-search { width: 170px; min-height: 38px; }
    .attachment-details { margin-top: 1.25rem; padding: 1rem; border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-secondary); }
    .attachment-details strong { display: block; margin-bottom: 0.35rem; color: var(--text-primary); }

    .changes-subtabs { display: flex; gap: 2rem; border-bottom: 1px solid var(--border-color); margin: -0.25rem 0 1.25rem; overflow-x: auto; }
    .changes-subtab { padding: 1rem 0.25rem 0.85rem; border: 0; border-bottom: 3px solid transparent; background: transparent; color: var(--text-secondary); font-size: 1rem; font-weight: 600; text-transform: uppercase; white-space: nowrap; }
    .changes-subtab.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
    .changes-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: 0 0 1.25rem; }
    .changes-count { color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; }
    .changes-search { width: min(100%, 340px); min-height: 46px; display: flex; align-items: center; gap: 0.75rem; padding: 0 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: var(--bg-surface); color: var(--text-muted); }
    .changes-search input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-size: 0.95rem; }
    .changes-search input::placeholder { color: var(--text-muted); }
    .change-table-wrap { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-surface); }
    .change-table { width: 100%; min-width: 920px; border-collapse: collapse; text-align: left; }
    .change-table th { padding: 1rem 1.25rem; background: var(--bg-surface-hover); border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.9rem; font-weight: 700; }
    .change-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.875rem; }
    .change-table tbody tr:last-child td { border-bottom: 0; }
    .select-col { width: 52px; }
    .table-checkbox { display: inline-block; width: 18px; height: 18px; border: 2px solid #9ca3af; border-radius: 3px; background: var(--bg-surface); vertical-align: middle; }
    .change-empty { height: 118px; text-align: center; color: var(--text-secondary); font-size: 0.95rem; }
    .changes-selected { margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.9rem; }

    .text-primary { color: var(--accent-primary); }
    .text-muted { color: var(--text-muted); }
    .font-mono { font-family: monospace; }
    .empty-state { text-align: center; color: var(--text-muted); }
    .history-entry { background: var(--bg-surface); color: var(--text-primary); }
    .border { border: 1px solid var(--border-color); }
    .p-8 { padding: 2rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .text-center { text-align: center; }
    .border-l-4 { border-left: 4px solid var(--accent-primary); }
    .pl-4 { padding-left: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

    @media (max-width: 840px) {
      .page-header { align-items: flex-start; flex-direction: column; gap: 1rem; }
      .tab-content { padding: 1rem; }
      .changes-subtabs { gap: 1.25rem; }
      .changes-toolbar { align-items: stretch; flex-direction: column; }
      .changes-search { width: 100%; }
      .attachment-toolbar { flex-direction: column; }
      .attachment-search { width: 100%; }
      .relationship-summary { align-items: flex-start; flex-direction: column; gap: 0.35rem; }
      .overview-details { grid-template-columns: 1fr; padding-right: 0; }
      .overview-row, .overview-row:nth-child(2n) { grid-template-columns: 1fr; gap: 0.3rem; }
      .overview-edit { position: static; margin-left: auto; display: block; width: fit-content; }
    }
  `
})
export class ItemDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  inventoryService = inject(InventoryService);
  userService = inject(UserService);

  item: Product | null = null;
  activeTab: ItemDetailTab = 'Overview';
  activeChangeTab: ChangeDetailTab = 'ChangeOrders';
  changeSearchQuery = '';
  attachmentSearchQuery = '';
  isBomAddOpen = false;
  isBomRemoveOpen = false;
  selectedBomParentSku = '';
  selectedBomChildSku = '';
  selectedBomRemovePath = '';
  isRelationshipAddOpen = false;
  isRelationshipRemoveOpen = false;
  selectedRelationshipSku = '';

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
      if (sku) {
      this.item = this.inventoryService.getData().find(p => p.sku === sku) || null;
      if (!this.item) {
        this.router.navigate(['/items']);
      }
    } else {
      this.router.navigate(['/items']);
    }
  }

  canPromoteLifecycle(): boolean {
    if (!this.item) return false;
    const lifecycleOrder = ['Design', 'Prototype', 'Production', 'Obsolete'];
    const currentIndex = lifecycleOrder.indexOf(this.item.lifecycle);
    return currentIndex < lifecycleOrder.length - 1;
  }

  promoteLifecycle() {
    if (!this.item || this.userService.isReadOnly()) return;

    const lifecycleOrder = ['Design', 'Prototype', 'Production', 'Obsolete'] as const;
    const currentIndex = lifecycleOrder.indexOf(this.item.lifecycle);

    if (currentIndex < lifecycleOrder.length - 1) {
      const newLifecycle = lifecycleOrder[currentIndex + 1];
      this.inventoryService.updateProduct(this.item.sku, { lifecycle: newLifecycle });
      this.item.lifecycle = newLifecycle;
    }
  }

  getResolvedBom(): Product[] {
    if (!this.item?.bom) return [];
    return this.item.bom
      .map(sku => this.inventoryService.getData().find(p => p.sku === sku))
      .filter(Boolean) as Product[];
  }

  getBomTree(): BomTreeNode[] {
    if (!this.item) return [];
    return this.buildBomTree(this.item.sku, 1, [this.item.sku]);
  }

  openBomAdd(parentSku: string) {
    if (this.userService.isReadOnly()) return;
    this.selectedBomParentSku = parentSku;
    this.selectedBomChildSku = '';
    this.isBomAddOpen = true;
    this.closeBomRemove();
  }

  closeBomAdd() {
    this.isBomAddOpen = false;
    this.selectedBomParentSku = '';
    this.selectedBomChildSku = '';
  }

  openBomRemove() {
    if (this.userService.isReadOnly()) return;
    this.selectedBomRemovePath = '';
    this.isBomRemoveOpen = true;
    this.closeBomAdd();
  }

  closeBomRemove() {
    this.isBomRemoveOpen = false;
    this.selectedBomRemovePath = '';
  }

  getAvailableBomItems(): Product[] {
    if (!this.item || !this.selectedBomParentSku) return [];

    const parent = this.inventoryService.getData().find(product => product.sku === this.selectedBomParentSku);
    const existingChildren = new Set(parent?.bom || []);

    return this.inventoryService.getData().filter(product =>
      product.sku !== this.selectedBomParentSku &&
      !existingChildren.has(product.sku) &&
      !this.isAncestorOrSelf(product.sku, this.selectedBomParentSku)
    );
  }

  addBomItem() {
    if (!this.selectedBomParentSku || !this.selectedBomChildSku || this.userService.isReadOnly()) return;

    this.inventoryService.attachBomComponent(this.selectedBomParentSku, this.selectedBomChildSku);
    if (this.item) {
      this.item = this.inventoryService.getData().find(product => product.sku === this.item?.sku) || this.item;
    }
    this.closeBomAdd();
  }

  removeSelectedBomItem() {
    const path = this.selectedBomRemovePath.split('>').filter(Boolean);
    if (path.length < 2) return;
    this.removeBomLink(path[path.length - 2], path[path.length - 1]);
    this.closeBomRemove();
  }

  removeBomItem(node: BomTreeNode) {
    if (node.path.length < 2 || this.userService.isReadOnly()) return;
    this.removeBomLink(node.path[node.path.length - 2], node.product.sku);
  }

  getRelationshipObjects(): Product[] {
    if (!this.item?.relationships) return [];
    return this.item.relationships
      .map(sku => this.inventoryService.getData().find(product => product.sku === sku))
      .filter(Boolean) as Product[];
  }

  openRelationshipAdd() {
    if (this.userService.isReadOnly()) return;
    this.selectedRelationshipSku = '';
    this.isRelationshipAddOpen = true;
    this.closeRelationshipRemove();
  }

  closeRelationshipAdd() {
    this.isRelationshipAddOpen = false;
    this.selectedRelationshipSku = '';
  }

  openRelationshipRemove() {
    if (this.userService.isReadOnly()) return;
    this.selectedRelationshipSku = '';
    this.isRelationshipRemoveOpen = true;
    this.closeRelationshipAdd();
  }

  closeRelationshipRemove() {
    this.isRelationshipRemoveOpen = false;
    this.selectedRelationshipSku = '';
  }

  getAvailableRelationshipItems(): Product[] {
    if (!this.item) return [];
    const existingRelationships = new Set(this.item.relationships || []);

    return this.inventoryService.getData().filter(product =>
      product.sku !== this.item?.sku &&
      !existingRelationships.has(product.sku)
    );
  }

  addRelationshipItem() {
    if (!this.item || !this.selectedRelationshipSku || this.userService.isReadOnly()) return;
    this.inventoryService.attachRelationship(this.item.sku, this.selectedRelationshipSku);
    this.refreshCurrentItem();
    this.closeRelationshipAdd();
  }

  removeRelationshipItem(sku = this.selectedRelationshipSku) {
    if (!this.item || !sku || this.userService.isReadOnly()) return;
    this.inventoryService.detachRelationship(this.item.sku, sku);
    this.refreshCurrentItem();
    this.closeRelationshipRemove();
  }

  navigateToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }

  getPartTypeLabel(): string {
    return this.item?.partType || this.item?.part || this.item?.type || 'Part';
  }

  getUnitOfMeasure(): string {
    return this.item?.type === 'Document' ? 'File' : 'kg';
  }

  getClassificationLabel(): string {
    return this.item?.classification || this.item?.category || 'Unclassified';
  }

  getMaterialLabel(): string {
    return this.item?.category === 'Hardware' ? 'Aluminium 6061-T6' : 'Not applicable';
  }

  getPartDescription(): string {
    return this.item?.partDescription || this.item?.name || '';
  }

  getColorFinishLabel(): string {
    return this.item?.type === 'Document' ? 'Not applicable' : 'Powder Coated';
  }

  getBomDescription(child: Product): string {
    return child.partDescription || child.name;
  }

  getBomQuantity(index: number): number {
    return index === 1 ? 2 : 1;
  }

  private buildBomTree(parentSku: string, level: number, path: string[]): BomTreeNode[] {
    const parent = this.inventoryService.getData().find(product => product.sku === parentSku);
    if (!parent?.bom?.length) return [];

    return parent.bom.flatMap(childSku => {
      if (path.includes(childSku)) return [];

      const child = this.inventoryService.getData().find(product => product.sku === childSku);
      if (!child) return [];

      const childPath = [...path, childSku];
      return [
        { product: child, level, path: childPath },
        ...this.buildBomTree(childSku, level + 1, childPath)
      ];
    });
  }

  private removeBomLink(parentSku: string, childSku: string) {
    this.inventoryService.detachBomComponent(parentSku, childSku);
    this.refreshCurrentItem();
  }

  private refreshCurrentItem() {
    if (this.item) {
      this.item = this.inventoryService.getData().find(product => product.sku === this.item?.sku) || this.item;
    }
  }

  private isAncestorOrSelf(candidateSku: string, parentSku: string): boolean {
    if (candidateSku === parentSku) return true;

    const candidate = this.inventoryService.getData().find(product => product.sku === candidateSku);
    if (!candidate?.bom?.length) return false;
    if (candidate.bom.includes(parentSku)) return true;

    return candidate.bom.some(childSku => this.isAncestorOrSelf(childSku, parentSku));
  }

  getActiveChangeLabel(): string {
    if (this.activeChangeTab === 'ChangeRequests') return 'Change Requests';
    if (this.activeChangeTab === 'Deviation') return 'Deviations';
    return 'Change Orders';
  }

  getActiveChangeCount(): number {
    return this.getVisibleChanges().length;
  }

  getVisibleChanges(): Product['changes'] {
    if (!this.item || this.activeChangeTab !== 'ChangeOrders') return [];

    const query = this.changeSearchQuery.trim().toLowerCase();
    if (!query) return this.item.changes;

    return this.item.changes.filter(change =>
      change.id.toLowerCase().includes(query) ||
      change.description.toLowerCase().includes(query) ||
      change.status.toLowerCase().includes(query) ||
      (change.date || '').toLowerCase().includes(query)
    );
  }

  getEmptyChangeMessage(): string {
    if (this.activeChangeTab === 'ChangeRequests') return 'No change requests available';
    if (this.activeChangeTab === 'Deviation') return 'No deviations available';
    return 'No change orders available';
  }

  getVisibleAttachments(): string[] {
    if (!this.item) return [];
    const query = this.attachmentSearchQuery.trim().toLowerCase();
    if (!query) return this.item.attachments;
    return this.item.attachments.filter(file =>
      file.toLowerCase().includes(query) ||
      this.getAttachmentType(file).toLowerCase().includes(query)
    );
  }

  getAttachmentName(file: string, index: number): string {
    return file || (index === 0 ? 'drawing_main_assembly.dwg' : 'installation_notes.docx');
  }

  getAttachmentType(file: string): string {
    const ext = file.split('.').pop()?.toLowerCase();
    if (ext === 'dwg' || ext === 'step') return 'DWG Drawing';
    if (ext === 'doc' || ext === 'docx') return 'Word Document';
    if (ext === 'pdf') return 'PDF Document';
    return 'Document';
  }

  getAttachmentDetails(): string {
    return this.item?.attachments.length
      ? 'Attached files include engineering documents and supporting product files.'
      : 'No files are currently attached to this item.';
  }

  getTodayLabel(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
