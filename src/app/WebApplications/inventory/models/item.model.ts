// src/app/models/item.model.ts
export interface Dimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export interface Location {
  warehouseId: string;
  aisle: string;
  bay: string;
  shelf: string;
  bin?: string;
}

export type ItemStatus = 'available' | 'reserved' | 'damaged' | 'backordered';

export interface Item {
  id: string;               // unique id used in routes
  sku: string;              // stock keeping unit
  name: string;
  description?: string;
  quantity: number;
  category: string;
  location: Location;
  imageUrl?: string;
  weightKg?: number;
  dimensions?: Dimensions;
  supplier?: string;
  receivedDate?: string;    // ISO date
  lotNumber?: string;
  status?: ItemStatus;
  minStockLevel?: number;
  reorderPoint?: number;
}
