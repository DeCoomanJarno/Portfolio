// base-calculator.component.ts
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface Calculation {
  Result: string;
  Equation: string;
}

@Component({
  selector: 'app-base-calculator',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './base-calculator.component.html',
  styleUrls: ['./base-calculator.component.css'],
})
export class BaseCalculatorComponent {
  @ViewChild('expressionInput') expressionInput!: ElementRef<HTMLInputElement>;
  @Input() title: string = '';  // To customize the title
  displayControl = new FormControl('');
  temporaryResult: string = '';
  error: string = '';
  history: Calculation[] = [];

  constructor() {
    // Subscribe to changes in the displayControl value
    this.displayControl.valueChanges.subscribe(value => {
      this.updateTemporaryResult(value || '');
    });
  }
  // Function to handle Enter key
  handleKeyPress(event: KeyboardEvent) {
    const allowedCharacters = /[0-9+\-*/()]/;
    var input = event.key;
    if (input === 'Enter') {
      this.equals(); // Calculate if Enter is pressed
    }
  }

  decimal() {
    const currentValue = this.displayControl.value || '';
    if (!currentValue.includes('.')) {
      this.displayControl.setValue(currentValue + '.');
    }
  }
  
  updateTemporaryResult(value: string) {
    try {
      const calculatedResult = eval(this.replaceConstants(value)).toString();
      this.temporaryResult = calculatedResult !== value ? calculatedResult : '';
      this.error = ''; // Clear error if calculation is successful
    } catch (error) {
    }
  }

  replaceConstants(expression: string): string {
    return expression
    .replace('÷', '/')
    .replace('×', '*')
    .replace(/π/g, 'pi')
    .replace(/\be\b/g, 'e')
    .replace('²', '**2')  // Replace '²' with '**2' for square
    .replace('√', 'Math.sqrt')  // Replace √ with Math.sqrt()
    .replace('sin', 'Math.sin')  // Use Math.sin in eval
    .replace('cos', 'Math.cos')  // Use Math.cos in eval
    .replace('tan', 'Math.tan'); // Use Math.tan in eval
  }

  clear() {
    this.displayControl.setValue('');
    this.temporaryResult = '';
    this.error = '';
  }

  backspace() {
    const currentValue = this.displayControl.value || '';
    this.displayControl.setValue(currentValue.slice(0, -1));
  }

  equals() {
    try {
      // Evaluate the expression
      const formattedExpression = this.replaceConstants(this.displayControl.value || ''); // Format the expression
      const calculatedResult = eval(formattedExpression).toString(); // Final calculation

      // expression is just a number
      if (formattedExpression === calculatedResult)
        return;

      // Save to history
      if (!this.history.find(c => c.Equation == this.displayControl.value && c.Result == calculatedResult))
        this.history.push({ Result: calculatedResult, Equation: this.displayControl.value || ''});

      this.displayControl.setValue(calculatedResult); // Override input with result
      this.error = ''; // Clear any error messages
    } catch (error) {
      this.error = error as string; // Clear any error messages
    }
  }

  loadFromHistory(item: Calculation) {
    this.displayControl.setValue(item.Equation);
    this.temporaryResult = item.Result;
  }

  // Single function implementation that handles both cases
  AddValue(param: Event | string): void {
    let buttonValue = '';

    if (typeof param === 'string') {
      // If param is a string, directly use it
      buttonValue = param;
    } else if (param instanceof Event) {
      // If param is an Event, extract the button text
      buttonValue = (param.target as HTMLButtonElement).textContent || '';
      buttonValue = buttonValue.replace('×', '*').replace('÷', '/'); // Normalize symbols
    }

    const currentValue = this.displayControl.value || '';
    this.displayControl.setValue(currentValue + buttonValue);

    // If the value contains '()', move the cursor between parentheses
    if (buttonValue.includes('()')) {
      this.moveCursorToParentheses(this.displayControl.value || '');
    }
  }

  // Method to move cursor between parentheses
  moveCursorToParentheses(value: string) {
    const inputElement = this.expressionInput.nativeElement;

    // Find the index of the first opening parenthesis
    const cursorPosition = value.indexOf('()') + 1; // Move it between the parentheses

    // Set cursor position
    setTimeout(() => {
      inputElement.focus();
      inputElement.setSelectionRange(cursorPosition, cursorPosition); // Move cursor inside ()
    }, 0); // Slight delay to ensure the DOM updates
  }
}
