import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to the items page after creating an item', () => {
    const navigateSpy = vi.spyOn(component.router, 'navigate').mockResolvedValue(true);
    component.showCreateModal = true;

    component.handleItemCreated();

    expect(component.showCreateModal).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/items']);
  });

  it('opens the Items tab when requested in the URL', () => {
    component.setActiveViewFromUrl('/dashboard?tab=items');

    expect(component.activeView).toBe('items');
  });

  it('opens the Changes tab when requested in the URL', () => {
    component.setActiveViewFromUrl('/dashboard?tab=changes');

    expect(component.activeView).toBe('changes');
  });

  it('opens the create change workflow', () => {
    const navigateSpy = vi.spyOn(component.router, 'navigate').mockResolvedValue(true);

    component.openChangeCreate();

    expect(navigateSpy).toHaveBeenCalledWith(['/changes/create']);
  });

  it('opens released changes with the released filter', () => {
    const navigateSpy = vi.spyOn(component.router, 'navigate').mockResolvedValue(true);

    component.browseReleasedChanges();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/changes/manage'],
      { queryParams: { status: 'released' } }
    );
  });
});
