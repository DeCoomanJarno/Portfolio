import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ItemStatus, Item } from '../models/item.model';
import { CategoryIconService } from '../services/category-icon.service';
import { InventoryService } from '../services/inventory.service';
import { SidePanelService } from '@angularlibrary/core-lib';

@Component({
  selector: 'app-inventory-create',
  standalone: false,
  templateUrl: './inventory-create.html',
  styleUrl: './inventory-create.scss'
})
export class InventoryCreate implements OnInit {
  form!: FormGroup;
  statuses = Object.values(ItemStatus);

  constructor(
    private fb: FormBuilder,
    private sidePanel: SidePanelService,
    private inventoryService: InventoryService,
    public categoryIconService: CategoryIconService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sku: ['', Validators.required],
      quantity: [0, Validators.required],
      category: ['', Validators.required],
      location: this.fb.group({
        warehouseId: ['', Validators.required],
        aisle: [''],
        bay: [''],
        shelf: [''],
        bin: ['']
      }),
      status: [ItemStatus.Available, Validators.required],
      weightKg: [''],
      dimensions: this.fb.group({
        lengthMm: [''],
        widthMm: [''],
        heightMm: ['']
      }),
      supplier: [''],
      receivedDate: [''],
      lotNumber: ['']
    });
  }

get warehouseId(): FormControl<string> {
    return this.form.get('location.warehouseId') as FormControl<string>;
  }
  get aisle(): FormControl<string> {
    return this.form.get('location.aisle') as FormControl<string>;
  }
  get bay(): FormControl<string> {
    return this.form.get('location.bay') as FormControl<string>;
  }
  get shelf(): FormControl<string> {
    return this.form.get('location.shelf') as FormControl<string>;
  }
  get bin(): FormControl<string | null> {
    return this.form.get('location.bin') as FormControl<string | null>;
  }

  get lengthMm(): FormControl<number | null> {
    return this.form.get('dimensions.lengthMm') as FormControl<number | null>;
  }
  get widthMm(): FormControl<number | null> {
    return this.form.get('dimensions.widthMm') as FormControl<number | null>;
  }
  get heightMm(): FormControl<number | null> {
    return this.form.get('dimensions.heightMm') as FormControl<number | null>;
  }
  
  save() {
    if (this.form.valid) {
      const newItem: Item = this.form.value;
      this.inventoryService.create(newItem).subscribe(() => {
        this.close();
      });
    }
  }

  close() {
    this.sidePanel.close();
  }

}
