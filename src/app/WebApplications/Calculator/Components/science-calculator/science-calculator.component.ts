import { Component, ViewChild } from '@angular/core';
import { CalculatorPageComponent } from "../calculator-page/calculator-page.component";
import { BaseCalculatorComponent } from '../base-calculator/base-calculator.component';

@Component({
  selector: 'app-science-calculator',
  standalone: true,
  imports: [CalculatorPageComponent, BaseCalculatorComponent],
  templateUrl: './science-calculator.component.html',
  styleUrls: ['./science-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class ScienceCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;
}
