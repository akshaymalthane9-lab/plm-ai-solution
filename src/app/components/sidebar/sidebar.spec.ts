import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';
import { RecentItemsService } from '../../services/recent-items.service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('always renders the recently accessed section', () => {
    const heading = fixture.nativeElement.querySelector('#recently-accessed-title');
    expect(heading.textContent).toContain('Recently Accessed');
  });

  it('renders recently accessed items', () => {
    const recentItems = TestBed.inject(RecentItemsService);
    recentItems.recentItems.set([{
      sku: 'FG-001',
      name: 'Test Product',
      revision: '2.0',
      partType: 'Finished Good',
      accessedAt: new Date().toISOString()
    }]);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.recent-item').textContent).toContain('FG-001');
  });
});
