import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService, Product } from '../../services/inventory.service';

interface StoredChange {
  coNumber: string;
  changeType: string;
  priority: string;
  description: string;
  createdDate: string;
  status: string;
  requestedBy: string;
  workflowStatus?: string;
}

interface SearchSuggestion {
  type: 'Item' | 'Change';
  title: string;
  subtitle: string;
  keywords: string;
  item?: Product;
  change?: StoredChange;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-search" (focusout)="closeAfterFocusLeaves()">
      <input
        type="search"
        [value]="query"
        placeholder="Search Items/Changes..."
        aria-label="Search Items or Changes"
        aria-autocomplete="list"
        [attr.aria-expanded]="showSuggestions"
        [attr.aria-activedescendant]="activeIndex >= 0 ? 'search-result-' + activeIndex : null"
        (input)="updateQuery($event)"
        (focus)="openSuggestions()"
        (keydown)="handleKeydown($event)">
      <button type="button" aria-label="Search" (click)="search()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M20 20L16.65 16.65"></path>
        </svg>
      </button>

      <div class="suggestions" role="listbox" *ngIf="showSuggestions">
        <button
          *ngFor="let suggestion of suggestions; let index = index"
          type="button"
          role="option"
          class="suggestion"
          [id]="'search-result-' + index"
          [class.active]="index === activeIndex"
          [attr.aria-selected]="index === activeIndex"
          (pointerdown)="selectSuggestion(suggestion, $event)">
          <span class="result-icon" [class.change]="suggestion.type === 'Change'" aria-hidden="true">
            {{ suggestion.type === 'Item' ? 'I' : 'C' }}
          </span>
          <span class="result-copy">
            <strong>{{ suggestion.title }}</strong>
            <small>{{ suggestion.subtitle }}</small>
          </span>
          <span class="result-type">{{ suggestion.type }}</span>
        </button>

        <div class="no-results" *ngIf="!suggestions.length">
          No matching items or changes
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; width: min(398px, 100%); }
    * { box-sizing: border-box; }
    .global-search { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 48px; gap: 10px; width: 100%; }
    input, .global-search > button {
      height: 44px;
      border: 1px solid #dbe0e8;
      border-radius: 18px;
      background: rgba(255,255,255,.84);
      color: #223964;
      box-shadow: 0 2px 8px rgba(31,50,88,.04), 0 12px 20px rgba(31,50,88,.03);
    }
    input { min-width: 0; padding: 0 14px; outline: none; font-size: .88rem; }
    input::placeholder { color: #8191ae; }
    input:focus { border-color: #b8d782; box-shadow: 0 0 0 3px rgba(134,188,37,.12); }
    .global-search > button { display: inline-grid; width: 48px; place-items: center; color: #28406f; }
    svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .suggestions {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 100;
      width: calc(100% - 58px);
      min-width: 310px;
      overflow: hidden;
      border: 1px solid #dfe4ed;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 16px 34px rgba(31,50,88,.16);
    }
    .suggestion {
      display: grid;
      width: 100%;
      grid-template-columns: 36px minmax(0,1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 11px 12px;
      border: 0;
      border-bottom: 1px solid #edf0f4;
      background: #fff;
      color: #223964;
      text-align: left;
    }
    .suggestion:last-child { border-bottom: 0; }
    .suggestion:hover, .suggestion.active { background: #f3f8e9; }
    .result-icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; background: #e9f3d8; color: #5f8919; font-size: .78rem; font-weight: 900; }
    .result-icon.change { background: #eef3ff; color: #244d99; }
    .result-copy { min-width: 0; }
    .result-copy strong, .result-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .result-copy strong { font-size: .83rem; }
    .result-copy small { margin-top: 3px; color: #8191ae; font-size: .72rem; }
    .result-type { padding: 4px 8px; border-radius: 999px; background: #f4f5f8; color: #8191ae; font-size: .65rem; font-weight: 800; text-transform: uppercase; }
    .no-results { padding: 22px 14px; color: #98a4ba; font-size: .8rem; text-align: center; }
    @media (max-width: 700px) {
      :host { width: 100%; }
      .suggestions { width: 100%; min-width: 0; }
    }
  `
})
export class GlobalSearch {
  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly changeStorageKey = 'deloitte_plm_change_requests_v1';

  query = '';
  showSuggestions = false;
  activeIndex = -1;

  get suggestions(): SearchSuggestion[] {
    const term = this.query.trim().toLowerCase();
    if (!term) {
      return [];
    }

    const itemResults = this.inventoryService.getData().map(item => ({
      type: 'Item' as const,
      title: item.sku,
      subtitle: item.partDescription || item.name,
      keywords: [item.sku, item.name, item.partDescription, item.partType, item.category].filter(Boolean).join(' ').toLowerCase(),
      item
    }));

    const changeResults = this.loadChanges().map(change => ({
      type: 'Change' as const,
      title: change.coNumber,
      subtitle: change.description || `${change.changeType} · ${change.status}`,
      keywords: [change.coNumber, change.changeType, change.description, change.status, change.workflowStatus, change.requestedBy]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      change
    }));

    return [...itemResults, ...changeResults]
      .filter(result => result.keywords.includes(term))
      .sort((a, b) => this.resultRank(a, term) - this.resultRank(b, term))
      .slice(0, 6);
  }

  updateQuery(event: Event) {
    this.query = (event.target as HTMLInputElement).value;
    this.activeIndex = this.suggestions.length ? 0 : -1;
    this.showSuggestions = !!this.query.trim();
  }

  openSuggestions() {
    this.showSuggestions = !!this.query.trim();
  }

  closeAfterFocusLeaves() {
    window.setTimeout(() => {
      this.showSuggestions = false;
      this.activeIndex = -1;
    });
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.activeIndex = -1;
      return;
    }

    if (!this.suggestions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.showSuggestions = true;
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.showSuggestions = true;
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.selectSuggestion(this.suggestions[Math.max(this.activeIndex, 0)]);
    }
  }

  search() {
    const firstResult = this.suggestions[0];
    if (firstResult) {
      this.selectSuggestion(firstResult);
    }
  }

  selectSuggestion(suggestion: SearchSuggestion, event?: Event) {
    event?.preventDefault();
    this.query = suggestion.title;
    this.showSuggestions = false;
    this.activeIndex = -1;

    if (suggestion.item) {
      void this.router.navigate(['/items', suggestion.item.sku]);
      return;
    }

    if (suggestion.change) {
      void this.router.navigate(['/changes/review'], {
        state: { changeRequest: suggestion.change }
      });
    }
  }

  private loadChanges(): StoredChange[] {
    const saved = localStorage.getItem(this.changeStorageKey);
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as StoredChange[];
    } catch {
      return [];
    }
  }

  private resultRank(result: SearchSuggestion, term: string): number {
    const title = result.title.toLowerCase();
    if (title === term) return 0;
    if (title.startsWith(term)) return 1;
    return 2;
  }
}
