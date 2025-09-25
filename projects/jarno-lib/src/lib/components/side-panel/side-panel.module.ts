import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanel } from './ui-side-panel';
import { SidePanelService } from './side-panel.service';
import { CardModule } from "../card";
import { ThumbnailModule } from '../thumbnail';
import { TitleModule } from '../title';

@NgModule({
  declarations: [SidePanel],
  imports: [
    CommonModule,
    CardModule,
    ThumbnailModule,
    TitleModule
],
  exports: [SidePanel],
  providers: [SidePanelService]  
})
export class SidePanelModule { }
