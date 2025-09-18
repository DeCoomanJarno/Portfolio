import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-simple-calculator',
    imports: [BaseCalculatorComponent, ReactiveFormsModule],
    templateUrl: './simple-calculator.html',
    styleUrls: ['./simple-calculator.css', '../base-calculator/base-calculator.css']
})
export class SimpleCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;

  }
