import { Component } from '@angular/core';
import { SimpleCalculatorComponent } from "../simple-calculator/simple-calculator.component";
import { ScienceCalculatorComponent } from "../science-calculator/science-calculator.component";
import { ProgrammingCalculatorComponent } from "../programming-calculator/programming-calculator.component"; // Import the evaluate function from mathjs

enum ECalculatorType
{
  Simple,Science,Programming
}

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [SimpleCalculatorComponent, ScienceCalculatorComponent, ProgrammingCalculatorComponent],
  templateUrl: './calculator-page.component.html',
  styleUrl: './calculator-page.component.css'
})
export class CalculatorPageComponent {
  ECalculatorType = ECalculatorType;

  selectedCalculator: ECalculatorType = ECalculatorType.Simple; // Default to Simple Calculator

  switchCalculator(calculator: ECalculatorType) {
    this.selectedCalculator = calculator;
  }
}

