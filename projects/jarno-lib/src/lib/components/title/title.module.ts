import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Title } from "./title";
import { IconModule } from "../ui-icon/ui-icon.module";
import { StateModule } from "../state";
import { MatTooltipModule } from "@angular/material/tooltip";


@NgModule({
  declarations: [Title],
  imports: [
    CommonModule, IconModule, StateModule, MatTooltipModule
  ],
  exports: [Title],
  providers: []  
})
export class TitleModule { }
