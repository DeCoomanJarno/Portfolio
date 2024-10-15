import { Component } from '@angular/core';
import { SimpleCalculatorComponent } from "../simple-calculator/simple-calculator.component";
import { ScienceCalculatorComponent } from "../science-calculator/science-calculator.component";
import { ProgrammingCalculatorComponent } from "../programming-calculator/programming-calculator.component"; // Import the evaluate function from mathjs

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [SimpleCalculatorComponent, ScienceCalculatorComponent, ProgrammingCalculatorComponent],
  templateUrl: './calculator-page.component.html',
  styleUrl: './calculator-page.component.css'
})
export class CalculatorPageComponent {

  selectedCalculator: 'simple' | 'science' | 'programming' = 'simple'; // Default to Simple Calculator

  switchCalculator(calculator: 'simple' | 'science' | 'programming') {
    this.selectedCalculator = calculator;
  }
}

