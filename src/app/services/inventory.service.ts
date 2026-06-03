import { Injectable, inject, signal } from '@angular/core';
import { UserService } from './user.service';

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedOn: string;
  modifiedBy: string;
  dataUrl?: string;
}

export type ProductAttachment = string | AttachmentFile;

export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  category: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  
  type: 'Part' | 'Document';
  revision: string;
  lifecycle: 'Design' | 'Prototype' | 'Production' | 'Obsolete';
  part?: string;
  partDescription?: string;
  document?: string;
  partType?: string;
  partNumber?: string;
  classification?: string;
  bom: string[]; 
  relationships?: string[];
  history: Array<{ date: string; action: string; user: string; details?: string }>;
  changes: Array<{ id: string; description: string; status: string; date?: string }>;
  attachments: ProductAttachment[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private userService = inject(UserService);
  private storageKey = 'deloitte_plm_db_v1';
  
  private initialProducts: Product[] = [
    { 
      id: '1', sku: 'SVR-832', name: 'Enterprise Server Blade', quantity: 45, category: 'Hardware', status: 'in-stock',
      type: 'Part',
      revision: 'A.01', lifecycle: 'Production', bom: ['MEM-32G', 'PRC-XON'], 
      history: [{date: new Date().toISOString(), action: 'Released to Production', user: 'System Admin'}],
      changes: [{id: 'ECN-101', description: 'Upgraded chassis shielding', status: 'Released'}],
      attachments: ['spec-sheet.pdf', 'cad-assembly.step']
    },
    { 
      id: '2', sku: 'MEM-32G', name: '32GB DDR4 ECC RAM', quantity: 120, category: 'Hardware', status: 'in-stock',
      type: 'Part',
      revision: 'B.00', lifecycle: 'Production', bom: [], 
      history: [{date: new Date().toISOString(), action: 'Vendor sourced component imported', user: 'System Admin'}],
      changes: [], attachments: ['jedec-cert.pdf']
    },
    { 
      id: '3', sku: 'PRC-XON', name: 'Xeon Scalable Processor', quantity: 12, category: 'Hardware', status: 'low-stock',
      type: 'Part',
      revision: 'A.04', lifecycle: 'Production', bom: [], 
      history: [{date: new Date().toISOString(), action: 'Created during import', user: 'System Admin'}],
      changes: [], attachments: []
    },
    { 
      id: '4', sku: 'DB-ENT-L', name: 'Deloitte AI Core License', quantity: 0, category: 'Software', status: 'out-of-stock',
      type: 'Document',
      revision: '19.c', lifecycle: 'Production', bom: [], 
      history: [], changes: [], attachments: ['eula.pdf']
    },
  ];

  inventory = signal<Product[]>([]);

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      let data: Product[] = JSON.parse(saved);
      // Migration: Ensure all legacy records have normalized item metadata
      data = data.map(p => ({
        ...p,
        type: p.type || (p.category === 'Software' ? 'Document' : 'Part'),
        part: p.part || p.type || (p.category === 'Software' ? 'Document' : 'Part'),
        partType: p.partType ? this.normalizePartType(p.partType) : p.partType,
        partNumber: p.partNumber || '',
        relationships: p.relationships || [],
        history: p.history || [],
        status: p.status || this.calculateStatus(p.quantity || 0)
      })) as Product[];
      this.inventory.set(data);
      this.persist(); // Save migrated data back
    } else {
      this.inventory.set(this.initialProducts);
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.inventory()));
  }

  private normalizePartType(partType?: string): string | undefined {
    if (!partType) {
      return partType;
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

  addProduct(productDef: Partial<Product>) {
    const normalizedPartType = this.normalizePartType(productDef.partType);
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      sku: productDef.sku || 'N/A',
      name: productDef.name || 'Undefined',
      quantity: productDef.quantity || 0,
      category: productDef.category || 'Uncategorized',
      status: this.calculateStatus(productDef.quantity || 0),
      type: productDef.type || (productDef.category === 'Software' ? 'Document' : 'Part'),
      part: productDef.part || productDef.type || (productDef.category === 'Software' ? 'Document' : 'Part'),
      partType: normalizedPartType,
      partNumber: productDef.partNumber || '',
      classification: productDef.classification || '',
      document: productDef.document || '',
      revision: productDef.revision || 'A.00',
      lifecycle: productDef.lifecycle || 'Design',
      partDescription: productDef.partDescription || '',
      bom: productDef.bom || [],
      relationships: productDef.relationships || [],
      history: [this.createHistoryEntry('Created item record', 'Item was created.')],
      changes: [],
      attachments: productDef.attachments || []
    };
    
    this.inventory.update(current => [newProduct, ...current]);
    this.persist();
  }

  deleteProduct(sku: string) {
    this.inventory.update(current => current.filter(p => p.sku !== sku));
    this.persist();
  }

  updateProductQty(sku: string, qty: number) {
    this.updateProduct(sku, { quantity: qty });
  }

  updateProduct(sku: string, updates: Partial<Product>) {
    this.inventory.update(current => current.map(p => {
      if (p.sku === sku) {
        const updated = { ...p, ...updates };
        if (updates.quantity !== undefined) {
           updated.status = this.calculateStatus(updates.quantity);
        }
        const details = this.describeProductUpdates(p, updated, updates);
        if (details) {
          updated.history = [
            this.createHistoryEntry('Updated item record', details),
            ...(p.history || [])
          ];
        }
        return updated;
      }
      return p;
    }));
    this.persist();
  }

  getData(): Product[] {
    return this.inventory();
  }

  getBomResolved(sku: string): Product[] {
      const parent = this.inventory().find(x => x.sku === sku);
      if (!parent || !parent.bom) return [];
      return this.inventory().filter(x => parent.bom.includes(x.sku));
  }

  promoteLifecycle(sku: string) {
    const states: Product['lifecycle'][] = ['Design', 'Prototype', 'Production', 'Obsolete'];
    this.inventory.update(current => current.map(p => {
      if (p.sku === sku) {
        const currentIndex = states.indexOf(p.lifecycle);
        if (currentIndex < states.length - 1) {
          const nextState = states[currentIndex + 1];
          const historyEntry = this.createHistoryEntry(
            `Promoted Lifecycle Stage to ${nextState}`,
            `Lifecycle changed from ${p.lifecycle} to ${nextState}.`
          );
          return { ...p, lifecycle: nextState, history: [historyEntry, ...p.history] };
        }
      }
      return p;
    }));
    this.persist();
  }

  promoteChangeStage(sku: string, changeId: string) {
    const stages = ['Draft', 'Review', 'Approved', 'Released'];
    this.inventory.update(current => current.map(p => {
      if (p.sku === sku) {
        const changes = p.changes.map(c => {
          if (c.id === changeId) {
            const currentIndex = stages.indexOf(c.status);
            if (currentIndex < stages.length - 1) {
              return { ...c, status: stages[currentIndex + 1] };
            }
          }
          return c;
        });
        const updatedChange = changes.find(change => change.id === changeId);
        return {
          ...p,
          changes,
          history: updatedChange
            ? [
                this.createHistoryEntry('Updated change status', `${changeId} moved to ${updatedChange.status}.`),
                ...(p.history || [])
              ]
            : p.history
        };
      }
      return p;
    }));
    this.persist();
  }

  attachBomComponent(parentSku: string, childSku: string) {
      if (parentSku === childSku) return; // Cannot attach to self
      this.inventory.update(current => current.map(p => {
          if (p.sku === parentSku) {
              const currentBom = p.bom || [];
              if (!currentBom.includes(childSku)) {
                  return {
                      ...p,
                      bom: [...currentBom, childSku],
                      history: [
                          this.createHistoryEntry('Added BOM component', `${childSku} was added to the BOM.`),
                          ...(p.history || [])
                      ]
                  };
              }
          }
          return p;
      }));
      this.persist();
  }

  detachBomComponent(parentSku: string, childSku: string) {
      this.inventory.update(current => current.map(p => {
          if (p.sku === parentSku) {
              return {
                  ...p,
                  bom: (p.bom || []).filter(sku => sku !== childSku),
                  history: [
                      this.createHistoryEntry('Removed BOM component', `${childSku} was removed from the BOM.`),
                      ...(p.history || [])
                  ]
              };
          }
          return p;
      }));
      this.persist();
  }

  attachRelationship(parentSku: string, relatedSku: string) {
      if (parentSku === relatedSku) return;
      this.inventory.update(current => current.map(p => {
          if (p.sku === parentSku) {
              const currentRelationships = p.relationships || [];
              if (!currentRelationships.includes(relatedSku)) {
                  return {
                      ...p,
                      relationships: [...currentRelationships, relatedSku],
                      history: [
                          this.createHistoryEntry('Added relationship', `${relatedSku} was added as a related object.`),
                          ...(p.history || [])
                      ]
                  };
              }
          }
          return p;
      }));
      this.persist();
  }

  detachRelationship(parentSku: string, relatedSku: string) {
      this.inventory.update(current => current.map(p => {
          if (p.sku === parentSku) {
              return {
                  ...p,
                  relationships: (p.relationships || []).filter(sku => sku !== relatedSku),
                  history: [
                      this.createHistoryEntry('Removed relationship', `${relatedSku} was removed from related objects.`),
                      ...(p.history || [])
                  ]
              };
          }
          return p;
      }));
      this.persist();
  }

  addAttachment(sku: string, attachment: AttachmentFile) {
      this.inventory.update(current => current.map(p => {
          if (p.sku === sku) {
              return {
                  ...p,
                  attachments: [attachment, ...(p.attachments || [])],
                  history: [
                      this.createHistoryEntry('Uploaded attachment', `${attachment.name} was uploaded.`),
                      ...(p.history || [])
                  ]
              };
          }
          return p;
      }));
      this.persist();
  }

  updateAttachmentData(sku: string, attachmentId: string, dataUrl: string) {
      this.inventory.update(current => current.map(p => {
          if (p.sku === sku) {
              return {
                  ...p,
                  attachments: (p.attachments || []).map(attachment =>
                      typeof attachment !== 'string' && attachment.id === attachmentId
                          ? { ...attachment, dataUrl }
                          : attachment
                  )
              };
          }
          return p;
      }));
      this.persist();
  }

  removeAttachment(sku: string, attachmentId: string) {
      this.inventory.update(current => current.map(p => {
          if (p.sku === sku) {
              const attachment = (p.attachments || []).find((currentAttachment, index) => this.getAttachmentId(currentAttachment, index) === attachmentId);
              const attachmentName = typeof attachment === 'string' ? attachment : attachment?.name || 'Attachment';
              return {
                  ...p,
                  attachments: (p.attachments || []).filter((attachment, index) => this.getAttachmentId(attachment, index) !== attachmentId),
                  history: [
                      this.createHistoryEntry('Removed attachment', `${attachmentName} was removed.`),
                      ...(p.history || [])
                  ]
              };
          }
          return p;
      }));
      this.persist();
  }

  private getAttachmentId(attachment: ProductAttachment, index: number): string {
      return typeof attachment === 'string' ? `${attachment}-${index}` : attachment.id;
  }

  private createHistoryEntry(action: string, details?: string): Product['history'][number] {
    return {
      date: new Date().toISOString(),
      action,
      user: this.userService.currentUser() || 'Current User',
      details
    };
  }

  private describeProductUpdates(previous: Product, updated: Product, updates: Partial<Product>): string {
    const labels: Partial<Record<keyof Product, string>> = {
      sku: 'Item Number',
      name: 'Common Name',
      quantity: 'Quantity',
      category: 'Category',
      status: 'Status',
      type: 'Type',
      revision: 'Revision',
      lifecycle: 'Lifecycle Status',
      part: 'Item Type',
      partDescription: 'Part Description',
      document: 'Document',
      partType: 'Part Type',
      partNumber: 'Part Number',
      classification: 'Classification'
    };

    return (Object.keys(labels) as Array<keyof Product>)
      .filter(key => Object.prototype.hasOwnProperty.call(updates, key))
      .filter(key => previous[key] !== updated[key])
      .map(key => `${labels[key]} changed from "${this.formatHistoryValue(previous[key])}" to "${this.formatHistoryValue(updated[key])}"`)
      .join('; ');
  }

  private formatHistoryValue(value: unknown): string {
    if (value === undefined || value === null || value === '') {
      return 'blank';
    }
    return String(value);
  }

  private calculateStatus(quantity: number): Product['status'] {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 15) return 'low-stock';
    return 'in-stock';
  }
}
