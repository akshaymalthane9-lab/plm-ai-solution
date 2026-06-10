import { TestBed } from '@angular/core/testing';
import { Product } from './inventory.service';
import { RecentItemsService } from './recent-items.service';

describe('RecentItemsService', () => {
  let service: RecentItemsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    service = TestBed.inject(RecentItemsService);
  });

  it('keeps the latest unique item first', () => {
    const item = createItem('FG-001');
    const secondItem = createItem('C-001');

    service.track(item);
    service.track(secondItem);
    service.track(item);

    expect(service.recentItems().map(recent => recent.sku)).toEqual(['FG-001', 'C-001']);
  });

  it('keeps only five recent items', () => {
    for (let index = 1; index <= 6; index += 1) {
      service.track(createItem(`ITEM-${index}`));
    }

    expect(service.recentItems()).toHaveLength(5);
    expect(service.recentItems()[0].sku).toBe('ITEM-6');
  });
});

function createItem(sku: string): Product {
  return {
    id: sku,
    sku,
    name: `${sku} name`,
    quantity: 1,
    category: 'Hardware',
    status: 'in-stock',
    type: 'Part',
    revision: 'A.00',
    lifecycle: 'Design',
    partType: 'Component',
    bom: [],
    history: [],
    changes: [],
    attachments: []
  };
}
