import { Injectable, signal } from '@angular/core';
import { Product } from './inventory.service';

export interface RecentItem {
  sku: string;
  name: string;
  revision: string;
  partType: string;
  accessedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecentItemsService {
  private readonly storageKey = 'nexaplm_recent_items_v1';
  readonly recentItems = signal<RecentItem[]>(this.load());

  track(item: Product) {
    const recentItem: RecentItem = {
      sku: item.sku,
      name: item.partDescription || item.name,
      revision: item.revision,
      partType: item.partType || item.part || item.type,
      accessedAt: new Date().toISOString()
    };

    const updated = [
      recentItem,
      ...this.recentItems().filter(existing => existing.sku !== item.sku)
    ].slice(0, 5);

    this.recentItems.set(updated);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  private load(): RecentItem[] {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      return [];
    }

    try {
      return (JSON.parse(saved) as RecentItem[]).slice(0, 5);
    } catch {
      return [];
    }
  }
}
