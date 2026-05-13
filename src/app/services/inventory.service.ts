import { Injectable, signal } from '@angular/core';

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
  classification?: string;
  bom: string[]; 
  history: Array<{ date: string; action: string; user: string; details?: string }>;
  changes: Array<{ id: string; description: string; status: string; date?: string }>;
  attachments: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
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
      classification: productDef.classification || '',
      document: productDef.document || '',
      revision: productDef.revision || 'A.00',
      lifecycle: productDef.lifecycle || 'Design',
      partDescription: productDef.partDescription || '',
      bom: productDef.bom || [],
      history: [{date: new Date().toISOString(), action: 'Created item record', user: 'Current User'}],
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
          const historyEntry = { 
            date: new Date().toISOString(), 
            action: `Promoted Lifecycle Stage to ${nextState}`, 
            user: 'Workflow Engine' 
          };
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
        return { ...p, changes };
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
                  return { ...p, bom: [...currentBom, childSku] };
              }
          }
          return p;
      }));
      this.persist();
  }

  private calculateStatus(quantity: number): Product['status'] {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 15) return 'low-stock';
    return 'in-stock';
  }
}
