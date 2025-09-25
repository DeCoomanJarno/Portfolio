import { Component } from '@angular/core';
import { SidePanelService, TableElement } from 'JarnoLib';
import { Item } from '../models/item.model';
import { InventoryService } from '../services/inventory.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inventory-page',
  standalone: false,
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css'
})
export class InventoryPage {
filterArchived() {
throw new Error('Method not implemented.');
}
createItem() {
throw new Error('Method not implemented.');
}
filterActive() {
throw new Error('Method not implemented.');
}
  item$: Observable<Item[]>;

  // Table columns configuration
  public columns: TableElement<Item>[] = [
    { field: 'id', header: 'ID', sortable: true, filterable: true, visible: true },
    { field: 'name', header: 'Name', sortable: true, filterable: true, visible: true },
  ];

  constructor(private sidePanel: SidePanelService, private inventoryService: InventoryService) {
    this.item$ = inventoryService.getAll();
}

  openDetail(id: string) {
    this.sidePanel.open('inventory-detail', { id });
  }


  deleteItem(id: number) {
    // TODO: implement delete logic
  }
}
