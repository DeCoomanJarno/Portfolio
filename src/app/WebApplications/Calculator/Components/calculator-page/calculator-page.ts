import { Component } from '@angular/core';
import { SimpleCalculatorComponent } from "../simple-calculator/simple-calculator";
import { ScienceCalculatorComponent } from "../science-calculator/science-calculator";
import { ProgrammingCalculatorComponent } from "../programming-calculator/programming-calculator"; // Import the evaluate function from mathjs

enum ECalculatorType
{
  Simple,Science,Programming
}

@Component({
    selector: 'app-calculator-page',
    imports: [SimpleCalculatorComponent, ScienceCalculatorComponent, ProgrammingCalculatorComponent],
    templateUrl: './calculator-page.html',
    styleUrl: './calculator-page.scss'
})
export class CalculatorPageComponent {
  ECalculatorType = ECalculatorType;

  selectedCalculator: ECalculatorType = ECalculatorType.Simple; // Default to Simple Calculator

  switchCalculator(calculator: ECalculatorType) {
    this.selectedCalculator = calculator;
  }
}

