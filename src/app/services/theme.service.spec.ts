import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('nexaplm-dark', 'nexaplm-light');
    TestBed.resetTestingModule();
  });

  it('persists and applies the selected theme', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('light');

    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('nexaplm_theme')).toBe('light');
    expect(document.documentElement.classList.contains('nexaplm-light')).toBe(true);
  });
});
