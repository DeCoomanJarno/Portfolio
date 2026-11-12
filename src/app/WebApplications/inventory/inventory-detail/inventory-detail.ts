import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';
import { CategoryIconService } from '../services/category-icon.service';
import { SidePanelService } from '@angularlibrary/core-lib';

@Component({
  selector: 'app-inventory-detail',
  standalone: false,
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.scss'
})
export class InventoryDetail implements OnInit {
  item$!: Observable<Item | undefined>;

  constructor(private sidePanel: SidePanelService, private inventoryService: InventoryService, public categoryIconService: CategoryIconService) {}

  ngOnInit(): void {
    this.item$ = this.sidePanel.param('id').pipe(
      switchMap(id => this.inventoryService.getById(id))
    );
  }

  close(): void {
    // simple close: navigate back
    this.sidePanel.close();
  }

  getImageUrl(item: Item): string | null {
    if (item.imageUrl?.trim()) {
      return item.imageUrl;
    }

    const iconName = this.categoryIconService.getIconName(item.category);
    return iconName ? `/Resources/Projects/Inventory/Icons/${iconName}.svg` : null;
  }

GetConvertedItemState(item: Item): ("error"|"success"|"warning"|"info"|"unavailable"|"removed"|"accent"|"primary"|"bodytext"|"idle")|undefined {
  switch(item.status)
  {
    case 'available':
      return 'success';
    case 'reserved':
      return 'warning';
    case 'damaged':
      return 'error';
    case 'backordered':
      return 'info';
    default:
      // Handle any other status not explicitly listed
      return undefined;
  }
}
}
