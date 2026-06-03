import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemFormModal } from '../../components/item-form-modal/item-form-modal';
import { InventoryService, Product } from '../../services/inventory.service';

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, ItemFormModal],
  template: `
    <app-item-form-modal
      *ngIf="item"
      [editItem]="item"
      [pageMode]="true"
      (saved)="goToItem($event)"
      (close)="goToItem(item.sku)">
    </app-item-form-modal>
  `
})
export class ItemEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  item: Product | null = null;

  ngOnInit() {
    const sku = this.route.snapshot.paramMap.get('sku');
    this.item = sku ? this.inventoryService.getData().find(product => product.sku === sku) || null : null;

    if (!this.item) {
      this.router.navigate(['/items']);
    }
  }

  goToItem(sku: string) {
    this.router.navigate(['/items', sku]);
  }
}
