import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Thumbnail } from "./thumbnail";
import { ButtonModule } from "../buttons";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";


@NgModule({
  declarations: [Thumbnail],
  imports: [
    CommonModule, ButtonModule, MatTooltipModule, MatDividerModule
  ],
  exports: [Thumbnail],
  providers: []  
})
export class ThumbnailModule { }
