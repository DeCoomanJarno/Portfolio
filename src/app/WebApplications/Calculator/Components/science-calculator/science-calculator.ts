import { Component, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator';

@Component({
    selector: 'app-science-calculator',
    imports: [BaseCalculatorComponent],
    templateUrl: './science-calculator.html',
    styleUrls: ['./science-calculator.css', '../base-calculator/base-calculator.css']
})
export class ScienceCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;
}
