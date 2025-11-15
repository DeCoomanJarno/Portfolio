// src/app/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, take, tap } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // JSON will be served from the compiled app root when "src/Resources" is added to assets
  private jsonPath = '/Resources/Projects/Inventory/Json/items.json';

  // cached observable
  private itemsSubject = new BehaviorSubject<Item[] | null>(null);
  private item$ = this.itemsSubject.asObservable().pipe(
    shareReplay(1)
  );

  constructor(private http: HttpClient) {
  }

  private loadItems(): Observable<Item[]> {
    if (!this.itemsSubject.value) {
      this.http.get<Item[]>(this.jsonPath).subscribe(items => {
        this.itemsSubject.next(items);
      });
    }
    return this.item$.pipe(
      // filter out null to always get a real array
      map(items => items ?? [])
    );
  }

  getAll(): Observable<Item[]> {
    return this.loadItems();
  }
  getById(id: string): Observable<Item | undefined> {
    return this.loadItems().pipe(map(items => items.find(i => i.id === id)));
  }

  create(item: Item): Observable<void> {
    const newItem: Item = { ...item, id: this.generateId() };
    return this.loadItems().pipe(
      take(1), // take the current snapshot only
      tap(items => {
        this.itemsSubject.next([...items, newItem]);
      }),
      map(() => void 0) // convert to Observable<void>
    );
  }

  edit(id: any, updatedItem: Item): Observable<void> {
    return this.loadItems().pipe(
      take(1),
      tap(items => {
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
          items[index] = { ...updatedItem, id };
          this.itemsSubject.next([...items]);
        }
      }),
      map(() => void 0)
    );
  }
  // helper function to generate a unique ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10); // simple random id
  }
  delete(id: string): Observable<void> {
    return this.itemsSubject.pipe(
      take(1),
      map(items => {
        if (!items) return;
        const updated = items.filter(item => item.id !== id);
        this.itemsSubject.next(updated);
      })
    );
  }
}
