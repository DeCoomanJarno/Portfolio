import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButton } from './ui-button/ui-button';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconButton } from './icon-button/icon-button';
import { IconModule } from '../ui-icon/ui-icon.module';


@NgModule({
  declarations: [UiButton, IconButton],
  imports: [
    CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatBadgeModule, IconModule
  ],
  exports: [UiButton, IconButton],
  providers: []  
})
export class ButtonModule { }
