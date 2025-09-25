import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconModule } from "../ui-icon/ui-icon.module";
import { State } from "./state";


@NgModule({
  declarations: [State],
  imports: [
    CommonModule, IconModule
  ],
  exports: [State],
  providers: []  
})
export class StateModule { }
