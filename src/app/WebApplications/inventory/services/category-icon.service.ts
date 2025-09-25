import { Injectable } from '@angular/core';
import { InventoryService } from './inventory.service';
import { firstValueFrom } from 'rxjs';
import { IconService } from 'JarnoLib';

@Injectable({
  providedIn: 'root'
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
    Lifting: 'hoist'
  };

  constructor(
    private inventory: InventoryService,
    private iconService: IconService
  ) {
    this.loadCategoryIcons();
  }

  async loadCategoryIcons(): Promise<void> {
    // Get all items
    const items = await firstValueFrom(this.inventory.getAll());

    // Extract unique categories
    const categories = Array.from(new Set(items.map(i => i.category)));

    // Map categories to icon names (only those we have)
    const iconNames = categories
      .map(c => this.categoryToIconMap[c])
      .filter(Boolean) as string[];

    this.iconService.registerIcons('Resources/Projects/Inventory/Icons', iconNames);
  }

  getIconName(category: string): string | undefined {
    return this.categoryToIconMap[category];
  }
}
