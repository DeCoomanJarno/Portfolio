import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardHeader } from './card-header/card-header';
import { CardFooter } from './card-footer/card-footer';
import { Card } from "./card/card";


@NgModule({
  declarations: [Card, CardHeader, CardFooter],
  imports: [
    CommonModule
  ],
  exports: [Card, CardHeader, CardFooter],
  providers: []  
})
export class CardModule { }
