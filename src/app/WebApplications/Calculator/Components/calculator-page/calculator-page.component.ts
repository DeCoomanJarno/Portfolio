import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { evaluate, pi, e } from 'mathjs'; // Import the evaluate function from mathjs

export interface Calculation {
  Result: string;
  Equation: string;
}

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calculator-page.component.html',
  styleUrl: './calculator-page.component.css'
})
export class CalculatorPageComponent {
  expression: string = ''; // Store the input expression
  result: string | null = ''; // Store the calculated result
  history: Calculation[] = []; // Store the history of calculations
  temporaryResult: string = ''; // Store the temporary result for display
  error: string = ''; // Store the temporary result for display
  secondMode: boolean = false; // Track advanced operations

  //#region Special Calculations

  // Function to append constants and operators to the expression (without calculating)
  appendValue(value: string) {
    if (value === 'pi') {
      this.expression += 'π'; // Display pi symbol
    } else if (value === 'e') {
      this.expression += 'e'; // Display e symbol
    } else {
      this.expression += value; // Add any other value
    }
    this.updateTemporaryResult(); // Update the temporary result after any change
  }

  // Toggle between basic and advanced operations (²nd button)
  toggleSecond() {
    this.secondMode = !this.secondMode;
  }

  // Append square operation (x²) without calculating
  square() {
    this.expression += '^2'; // Append the square symbol
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append square root operation (√x)
  sqrt() {
    this.expression += 'sqrt('; // Append sqrt symbol (not calculating yet)
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append absolute value (|x|)
  absolute() {
    this.expression += 'abs('; // Append abs function to the expression
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append logarithm base 10 (log)
  log() {
    this.expression += 'log10('; // Append log10 function
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append natural logarithm (ln)
  ln() {
    this.expression += 'log('; // Append natural log function
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append exponential function (10ˣ)
  powerOfTen() {
    this.expression += '10^('; // Append 10^ function
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Toggle positive/negative sign (±)
  toggleSign() {
    if (this.expression.startsWith('-')) {
      this.expression = this.expression.slice(1);
    } else {
      this.expression = '-' + this.expression;
    }
    this.updateTemporaryResult(); // Show the temporary result
  }

  // Append the factorial function (n!)
  factorial() {
    this.expression += 'factorial('; // Append factorial function
    this.updateTemporaryResult(); // Show the temporary result
  }

  //#endregion 

  // Function to evaluate the expression
  calculate() {
    try {
      // Evaluate the expression
      const formattedExpression = this.replaceConstants(this.expression); // Format the expression
      const calculatedResult = evaluate(formattedExpression).toString(); // Final calculation

      // expression is just a number
      if (this.expression === calculatedResult)
        return;

      // Set the final result
      this.result = calculatedResult;

      // Save to history
      if (!this.history.find(c => c.Equation == this.expression && c.Result == calculatedResult))
        this.history.push({ Result: calculatedResult, Equation: this.expression });

      this.expression = calculatedResult; // Override input with result
      this.error = ''; // Clear any error messages
    } catch (error) {
      this.error = error as string; // Clear any error messages
    }
  }

  // Function to update temporary result while typing
  updateTemporaryResult() {
    try {
      const formattedExpression = this.replaceConstants(this.expression);
      // Try to calculate the temporary result but do not save it as the final result
      const calculatedResult = evaluate(formattedExpression).toString(); // Final calculation
      if (this.expression === calculatedResult) {
        this.temporaryResult = ''
        return;
      }
      // Try to calculate the temporary result
      this.temporaryResult = calculatedResult;
      this.error = ''; // Clear error if calculation is successful
    } catch (error) {
      // If invalid, keep the temporary result empty
    }
  }

  // Helper function to replace constants in the expression
  replaceConstants(expression: string): string {
    return expression
      .replace(/π/g, 'pi') // Replace all occurrences of π with pi
      .replace(/\be\b/g, 'e'); // Replace all occurrences of e with e (Euler's number)
  }
  // Clear only the current entry (CE button)
  clearEntry() {
    this.expression = '';
    this.temporaryResult = '';
    this.error = '';
  }

  // Function to handle Enter key
  handleKeyPress(event: KeyboardEvent) {
    const allowedCharacters = /[0-9+\-*/()]/;
    var input = event.key;
    if (input === 'Enter') {
      this.calculate(); // Calculate if Enter is pressed
    }
    // Allow only numbers and some mathematical operators
    if (!allowedCharacters.test(input)) {
      event.preventDefault(); // Prevent invalid character input
    }

  }

  // Function to load a previous calculation
  loadFromHistory(item: Calculation) {
    this.expression = item.Equation; // Set it as the current expression
    this.result = item.Result; // Clear the result display
    this.temporaryResult = item.Result; // Clear the temporary result
  }

  // Function to remove the last character from the expression
  removeLast() {
    if (this.expression.length > 0) {
      this.expression = this.expression.slice(0, -1);
      this.updateTemporaryResult(); // Update the temporary result after removing a character
    }
  }
}

