import { Component } from '@angular/core';
import { SidePanelService, TableElement } from 'JarnoLib';
import { Item, ItemStatus } from '../models/item.model';
import { InventoryService } from '../services/inventory.service';
import { BehaviorSubject, combineLatest, map, Observable, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type FilterState = 'All' | ItemStatus;

@Component({
  selector: 'app-inventory-page',
  standalone: false,
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css'
})
export class InventoryPage {

  // Table columns
  public columns: TableElement<Item>[];

  public statuses: ItemStatus[] = Object.values(ItemStatus);

  private allItem$: Observable<Item[]>;
  public selectedState$ = new BehaviorSubject<FilterState>('All');
  public filteredItem$: Observable<Item[]>;

  constructor(private sidePanel: SidePanelService, private inventoryService: InventoryService, private _translateService: TranslateService) {
    this.allItem$ = this.inventoryService.getAll();

    this.filteredItem$ = combineLatest([
      this.allItem$,
      this.selectedState$
    ]).pipe(
      map(([items, state]) => state === 'All' ? items : items.filter(item => item.status === state))
    );

    this.columns = [
    { field: 'id', header: 'ID', sortable: true, filterable: true, visible: false },
    { field: 'name', header: _translateService.instant('Inventory.item.name'), sortable: true, filterable: true, visible: true },
    { field: 'sku', header: 'SKU', sortable: true, filterable: true },
    { field: 'quantity', header: _translateService.instant('Inventory.item.quantity'), sortable: true, filterable: true },
    { field: 'status', header: _translateService.instant('Inventory.item.status'), sortable: true, filterable: true },
    { field: 'category', header: _translateService.instant('Inventory.item.category') , sortable: true, filterable: true }
  ];
  }

  // Open side panels
  openDetail(id: string) {
    this.sidePanel.open('inventory-detail', { id });
  }

  Create() {
    this.sidePanel.open('inventory-create');
  }

  Edit(id: string) {
    this.sidePanel.open('inventory-edit', { id });
  }

  // Delete item
deleteItem(id: string) {
  this.inventoryService.delete(id).subscribe(() => {
    // Check the current side panel param
    this.sidePanel.param('id').pipe(take(1)).subscribe(currentId => {
      if (currentId === id) {
        this.sidePanel.close();
      }
    });
  });
}


  // Change filter
  filter(state: FilterState) {
    this.selectedState$.next(state);
  }

  // Count items by status
  getAmount(state: FilterState): Observable<number> {
    return this.allItem$.pipe(
      map(items => state === 'All' ? items.length : items.filter(item => item.status === state).length)
    );
  }

  // Map status to color/state
  convertStatusToState(status: ItemStatus): "error"|"success"|"warning"|"info"|"unavailable"|"removed"|"accent"|"primary"|"bodytext"|"idle"|undefined {
    switch(status) {
      case ItemStatus.Available: return 'success';
      case ItemStatus.Backordered: return 'info';
      case ItemStatus.Damaged: return 'error';
      case ItemStatus.Reserved: return 'warning';
    }
  }

}
