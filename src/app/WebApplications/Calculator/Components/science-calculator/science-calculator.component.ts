import { Component, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator.component';

@Component({
    selector: 'app-science-calculator',
    imports: [BaseCalculatorComponent],
    templateUrl: './science-calculator.component.html',
    styleUrls: ['./science-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class ScienceCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;
}
