import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionBar } from './action-bar';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ActionBar],
  imports: [
    CommonModule, MatButtonModule
  ],
  exports: [ActionBar],
  providers: []  
})
export class ActionBarModule { }
