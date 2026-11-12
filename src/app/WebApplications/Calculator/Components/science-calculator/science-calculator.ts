import { Component, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator';

@Component({
    selector: 'app-science-calculator',
    imports: [BaseCalculatorComponent],
    templateUrl: './science-calculator.html',
    styleUrls: ['../base-calculator/base-calculator.scss']
})
export class ScienceCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;
}
