import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemFormModal } from './item-form-modal';

describe('ItemFormModal', () => {
  let component: ItemFormModal;
  let fixture: ComponentFixture<ItemFormModal>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ItemFormModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFormModal);
    component = fixture.componentInstance;
  });

  it.each([
    ['Finished Good', 'FG-001'],
    ['Semi-Finished Good', 'SFG-001'],
    ['Component', 'C-001'],
    ['Sub Assembly', 'SA-001']
  ])('generates %s part numbers as %s', (partType, expectedPartNumber) => {
    component.itemForm.patchValue({ part: 'Part', partType });

    component.onPartTypeChange();

    expect(component.itemForm.get('partNumber')?.value).toBe(expectedPartNumber);
  });

  it('creates an item using the generated part number as its identifier', () => {
    component.itemForm.patchValue({
      part: 'Part',
      partType: 'Finished Good'
    });
    component.onPartChange();
    component.onPartTypeChange();

    expect(component.itemForm.valid).toBe(true);

    component.onSubmit();

    const createdItem = component.inventoryService.getData().find(item => item.sku === 'FG-001');
    expect(createdItem?.name).toBe('Finished Good');
    expect(createdItem?.revision).toBe('A.00');
  });
});
