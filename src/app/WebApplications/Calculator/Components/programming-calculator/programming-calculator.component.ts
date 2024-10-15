import { Component, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator.component';

@Component({
  selector: 'app-programming-calculator',
  standalone: true,
  imports: [BaseCalculatorComponent],
  templateUrl: './programming-calculator.component.html',
  styleUrls: ['./programming-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class ProgrammingCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;

  binary() {
    this.baseCalculator?.displayControl.setValue( (parseInt(this.baseCalculator?.displayControl.value || '', 10)).toString(2));
  }

  octal() {
    this.baseCalculator?.displayControl.setValue( (parseInt(this.baseCalculator?.displayControl.value || '', 10)).toString(8));
  }

  hex() {
    this.baseCalculator?.displayControl.setValue( (parseInt(this.baseCalculator?.displayControl.value || '', 10)).toString(16));
  }

  dec() {
    this.baseCalculator?.displayControl.setValue( parseInt(this.baseCalculator?.displayControl.value || '', 10 ).toString(10));
  }
}
