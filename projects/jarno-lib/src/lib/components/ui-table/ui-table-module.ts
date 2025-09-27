import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

import { UiTable } from './ui-table/ui-table';
import { UiHotpick } from './ui-hotpick/ui-hotpick';
import { UiActionsDirective } from './ui-actions.directive';
import { UiOverrideColumnDirective } from './ui-override-column.directive';
import { MatInputModule } from '@angular/material/input';
import { UiFilter } from './ui-filter/ui-filter';
import { OverlayRegisterService } from './services/overlay-register.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HighlightDirectiveModule } from './ui-highlight.directive';
import { IconModule } from '../ui-icon';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    UiTable,
    UiHotpick,
    UiOverrideColumnDirective,
    UiActionsDirective,
    UiFilter
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    HighlightDirectiveModule,
    IconModule,
    MatMenuModule,
    FormsModule,
    MatCardModule
  ],
  exports: [
    UiTable,
    UiHotpick,
    UiOverrideColumnDirective,
    UiActionsDirective,
    UiFilter,
    
  ],
  providers: [
    OverlayRegisterService
  ]
})
export class UiTableModule { }
