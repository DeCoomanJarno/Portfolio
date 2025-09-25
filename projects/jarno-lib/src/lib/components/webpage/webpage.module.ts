import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebPage } from './web-page';
import { SidePanelModule } from '../side-panel';


@NgModule({
  declarations: [WebPage],
  imports: [CommonModule, SidePanelModule],
  exports: [WebPage],
  providers: []   // service provided at module level (modular)
})
export class WebpageModule {}