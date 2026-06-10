import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { GlobalSearch } from './global-search';

describe('GlobalSearch', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('deloitte_plm_change_requests_v1', JSON.stringify([
      {
        coNumber: 'CO-2500',
        changeType: 'ECO',
        priority: 'High',
        description: 'Update server shielding',
        createdDate: '11/06/2026',
        status: 'Open',
        requestedBy: 'Admin'
      }
    ]));

    await TestBed.configureTestingModule({
      imports: [GlobalSearch],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('suggests matching items and changes', () => {
    const fixture = TestBed.createComponent(GlobalSearch);
    const component = fixture.componentInstance;

    component.query = 'server';

    expect(component.suggestions.map(result => result.title)).toContain('SVR-832');
    expect(component.suggestions.map(result => result.title)).toContain('CO-2500');
  });

  it('opens a selected item', () => {
    const fixture = TestBed.createComponent(GlobalSearch);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.query = 'SVR-832';

    component.search();

    expect(navigateSpy).toHaveBeenCalledWith(['/items', 'SVR-832']);
  });

  it('opens item details when an autosuggest row is selected', () => {
    const fixture = TestBed.createComponent(GlobalSearch);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'SVR-832';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const suggestion = fixture.nativeElement.querySelector('.suggestion') as HTMLButtonElement;
    suggestion.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(navigateSpy).toHaveBeenCalledWith(['/items', 'SVR-832']);
  });

  it('opens a selected change in review', () => {
    const fixture = TestBed.createComponent(GlobalSearch);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.query = 'CO-2500';

    component.search();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/changes/review'],
      { state: { changeRequest: expect.objectContaining({ coNumber: 'CO-2500' }) } }
    );
  });
});
