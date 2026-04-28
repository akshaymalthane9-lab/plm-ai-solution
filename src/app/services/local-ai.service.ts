import { Injectable } from '@angular/core';

export interface AIResponse {
  text: string;
  isActionable?: boolean;
  actionType?: 'delete' | 'draft_po' | 'update';
  actionPayload?: any;
}

@Injectable({ providedIn: 'root' })
export class LocalAIEngine {
  process(query: string, data: any[]): AIResponse {
    const qLower = query.toLowerCase();
    
    // Semantic Intents
    const isDelete = qLower.includes('delete') || qLower.includes('remove') || qLower.includes('drop');
    const isUpdate = qLower.includes('update') || qLower.includes('edit') || qLower.includes('set') || qLower.includes('change');
    const isSum = qLower.includes('sum') || qLower.includes('total') || qLower.includes('how many');
    const isList = qLower.includes('list') || qLower.includes('show') || qLower.includes('what are');
    const isTop = qLower.includes('top') || qLower.includes('highest') || qLower.includes('most');

    // Destructive/Mutation Actions First
    if (isUpdate) {
       const match = data.find(x => qLower.includes((x.sku || '').toLowerCase()) || qLower.includes((x.name || '').toLowerCase()));
       if (match) {
          const numbers = qLower.match(/\d+/g);
          const num = numbers ? numbers[numbers.length - 1] : null;
          if (num !== null) {
              return {
                 text: `I detected a modification request. Do you want to update **${match.name}** (SKU: ${match.sku}) to have **${num}** units?`,
                 isActionable: true,
                 actionType: 'update',
                 actionPayload: { sku: match.sku, qty: parseInt(num) }
              };
          }
       }
    }

    if (isDelete) {
       const match = data.find(x => qLower.includes((x.sku || '').toLowerCase()) || qLower.includes((x.name || '').toLowerCase()));
       if (match) {
          return { 
             text: `WARNING: You requested a destructive operation. Do you want to permanently delete **${match.name}** (SKU: ${match.sku}) from the core database?`,
             isActionable: true,
             actionType: 'delete',
             actionPayload: match.sku
          };
       } else {
          return { text: `You issued a delete command, but I couldn't semantically match an exact SKU or Entity Name in your query to delete.` };
       }
    }

    // Semantic Categories & Property Matching
    let filterCategory = '';
    if (qLower.includes('hardware')) filterCategory = 'Hardware';
    if (qLower.includes('software')) filterCategory = 'Software';

    let filteredData = data;
    if (filterCategory) {
      filteredData = data.filter(d => d.category?.toLowerCase() === filterCategory.toLowerCase());
    }

    if (qLower.includes('low') || qLower.includes('risk')) {
      filteredData = filteredData.filter(d => d.status === 'low-stock' || d.status === 'out-of-stock');
    }

    let targetProperty = 'quantity';

    // Operations Processing
    if (isTop && filteredData.length > 0) {
       const sorted = [...filteredData].sort((a,b) => (b[targetProperty] || 0) - (a[targetProperty] || 0));
       const top = sorted[0];
       return { text: `Based on your database, the highest capacity item is **${top.name}** at ${top[targetProperty]} units.` };
    }

    if (isSum && filteredData.length > 0) {
       const sum = filteredData.reduce((acc, curr) => acc + (Number(curr[targetProperty]) || 0), 0);
       let context = filterCategory ? filterCategory : 'the entire inventory';
       return { text: `I aggregated the data dynamically. The total sum of stock across ${context} is exactly **${sum}** units.` };
    }

    if (qLower.includes('alert') || qLower.includes('risk') || qLower.includes('low')) {
       const riskItems = data.filter(x => x.status === 'low-stock');
       if (riskItems.length > 0) {
         return {
           text: `Local semantic scan complete. I found ${riskItems.length} items running low, including "${riskItems[0].name}". Would you like to draft an emergency PO?`,
           isActionable: true,
           actionType: 'draft_po'
         };
       } else {
         return { text: `Good news. I scanned the localized storage state and found zero items with low-stock alerts right now.` };
       }
    }

    if (isList && filteredData.length > 0) {
       const names = filteredData.map(x => x.name).join(', ');
       return { text: `I parsed your command and extracted ${filteredData.length} records dynamically: ${names}.` };
    }

    // Entity Matching (Exact string find)
    const match = data.find(x => qLower.includes((x.sku || '').toLowerCase()) || qLower.includes((x.name || '').toLowerCase()));
    if (match) {
       return { text: `Entity matched: **${match.name}** (SKU: ${match.sku}) currently has status ${match.status} with ${match.quantity} units logged in the system.` };
    }

    return { text: `My local Semantic Parsing Engine is active. I am tracking ${data.length} dynamic row(s) from local storage. Try saying "how many hardware items total?", "delete SVR-832", or "list low risk alerts".` };
  }
}
