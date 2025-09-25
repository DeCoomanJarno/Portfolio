// src/app/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Item } from '../models/item.model';
import { IconService } from 'JarnoLib';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // JSON will be served from the compiled app root when "src/Resources" is added to assets
  private jsonPath = '/Resources/Projects/Inventory/Json/items.json';

  // cached observable
  private items$!: Observable<Item[]>;

  constructor(private http: HttpClient) {
  }

  private loadItems(): Observable<Item[]> {
    if (!this.items$) {
      this.items$ = this.http.get<Item[]>(this.jsonPath).pipe(shareReplay(1));
    }
    return this.items$;
  }

  getAll(): Observable<Item[]> {
    return this.loadItems();
  }

  getById(id: string): Observable<Item | undefined> {
    return this.loadItems().pipe(map(items => items.find(i => i.id === id)));
  }
}
