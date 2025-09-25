import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Snackbar } from './snackbar';
import { ButtonModule } from '../buttons';
import { ActionBarModule } from '../actionbar';


@NgModule({
  declarations: [Snackbar],
  imports: [
    CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatBadgeModule, ButtonModule, ActionBarModule
  ],
  exports: [Snackbar],
  providers: []  
})
export class SnackbarModule { }
