import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { distinctUntilChanged, switchMap } from 'rxjs';
import { ItemStatus, Item } from '../models/item.model';
import { CategoryIconService } from '../services/category-icon.service';
import { InventoryService } from '../services/inventory.service';
import { SidePanelService } from '@angularlibrary/core-lib';

@Component({
  selector: 'app-inventory-edit',
  standalone: false,
  templateUrl: './inventory-edit.html',
  styleUrl: './inventory-edit.scss'
})
export class InventoryEdit  implements OnInit {
  form!: FormGroup;
  statuses = Object.values(ItemStatus);
  private currentId!: string; // store the current id

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

    // Load the item when the id changes, but only patch the form
    this.sidePanel.param('id').pipe(
      distinctUntilChanged(),
      switchMap(id => {
        this.currentId = id; // store current id
        return this.inventoryService.getById(id);
      })
    ).subscribe(item => {
      if (item) {
        this.form.patchValue(item);} // only update the form
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
    if (this.form.valid && this.currentId) {
      const updatedItem: Item = this.form.value;

      // Directly call edit with the stored id
      this.inventoryService.edit(this.currentId, updatedItem)
        .subscribe(() => this.close());
    }
  }

  close() {
    this.sidePanel.close();
  }
}
