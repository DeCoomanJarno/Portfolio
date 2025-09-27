import { Injectable } from '@angular/core';
import { InventoryService } from './inventory.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { IconService } from 'JarnoLib';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryIconService {
  private categoryToIconMap: Record<string, string> = {
    Bearings: 'bearing',
    Fasteners: 'bolt',
    Filters: 'filter',
    Pallets: 'pallet',
    Packaging: 'tape',
    Electronics: 'battery',
    Safety: 'gloves',
    Materials: 'chain',
    'Power Transmission': 'sprocket',
    Seals: 'o-ring',
    Lifting: 'hoist',
  };

constructor(
  private inventory: InventoryService,
  private iconService: IconService
) {
  this.inventory.getAll().subscribe(items => {
    const categories = Array.from(new Set(items.map(i => i?.category).filter(Boolean)));
    const iconNames = categories
      .map(c => this.categoryToIconMap[c])
      .filter((name): name is string => !!name);

    if (iconNames.length) {
      this.iconService.registerIcons('Resources/Projects/Inventory/Icons', iconNames);
    }
  });
}

  /**
   * Returns the icon name for a given category
   */
  getIconName(category: string): string | undefined {
    return this.categoryToIconMap[category];
  }

  /**
   * Returns an observable of all unique categories
   */
  getAllCategories(): Observable<string[]> {
    return this.inventory.getAll().pipe(
      map((items: Item[]) => {
        const categories = items.map((item) => item.category).filter(Boolean);
        return Array.from(new Set(categories));
      })
    );
  }
}
