import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PANEL_REGISTRY, WebpageModule, CardModule, TitleModule, ButtonModule, ThumbnailModule, SidePanelModule, UiTableModule, IconModule } from 'JarnoLib';
import { RouterModule, Routes } from '@angular/router';
import { InventoryDetail } from './inventory-detail/inventory-detail';
import { InventoryPage } from './inventory-page/inventory-page';
import { TranslatePipe } from '@ngx-translate/core';
import {MatDividerModule} from '@angular/material/divider';
import { CategoryIconService } from './services/category-icon.service';

const routes: Routes = [
  { path: '', component: InventoryPage }
];

@NgModule({
  declarations: [InventoryPage, InventoryDetail],
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
],
  providers: [
    {
      provide: PANEL_REGISTRY,
      useValue: {
        'inventory-detail': InventoryDetail,
      }
    },
    CategoryIconService,
  ],
  exports: [ InventoryPage]
})
export class InventoryModule { }
