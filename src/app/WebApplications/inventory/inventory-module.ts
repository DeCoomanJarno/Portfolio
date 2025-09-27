import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PANEL_REGISTRY, WebpageModule, CardModule, TitleModule, ButtonModule, ThumbnailModule, SidePanelModule, UiTableModule, IconModule, StateModule } from 'JarnoLib';
import { RouterModule, Routes } from '@angular/router';
import { InventoryDetail } from './inventory-detail/inventory-detail';
import { InventoryPage } from './inventory-page/inventory-page';
import { TranslatePipe } from '@ngx-translate/core';
import {MatDividerModule} from '@angular/material/divider';
import { CategoryIconService } from './services/category-icon.service';
import { InventoryCreate } from './inventory-create/inventory-create';
import { InventoryEdit } from './inventory-edit/inventory-edit';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: '', component: InventoryPage }
];

@NgModule({
  declarations: [InventoryPage, InventoryDetail, InventoryCreate, InventoryEdit],
  imports: [
    CommonModule,
    WebpageModule,
    RouterModule.forChild(routes),
    TranslatePipe,
    CardModule,
    TitleModule,
    ButtonModule,
    ThumbnailModule,
    SidePanelModule,
    MatDividerModule,
    UiTableModule,
    IconModule,
    StateModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
],
  providers: [
    {
      provide: PANEL_REGISTRY,
      useValue: {
        'inventory-detail': InventoryDetail,
        'inventory-create': InventoryCreate,
        'inventory-edit': InventoryEdit,
      }
    },
    CategoryIconService,
  ],
  exports: [ InventoryPage]
})
export class InventoryModule { }
