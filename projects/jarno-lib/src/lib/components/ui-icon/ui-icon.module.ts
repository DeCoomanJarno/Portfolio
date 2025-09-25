import { NgModule } from "@angular/core";
import { UiIcon } from "./ui-icon";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { IconService } from "./icon.service";


@NgModule({
  declarations: [UiIcon],
  imports: [
    CommonModule, MatIconModule
  ],
  exports: [UiIcon],
  providers: [IconService]  
})
export class IconModule { }
