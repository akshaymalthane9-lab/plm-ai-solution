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

  it('opens Part Details only after Part is selected and Next is clicked', () => {
    expect(component.currentStep).toBe(1);

    component.itemForm.patchValue({ part: 'Part' });
    component.goToDetails();

    expect(component.currentStep).toBe(2);
    expect(component.detailsTitle).toBe('Enter Part Details');
    expect(component.itemForm.get('partType')?.value).toBe('Finished Good');
    expect(component.itemForm.get('partNumber')?.value).toBe('FG-001');
  });

  it('uses the selected dashboard theme', () => {
    component.theme = 'light';

    expect(component.activeTheme).toBe('light');
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
