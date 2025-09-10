// base-calculator.component.ts
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HistoryTabComponent } from '../history-tab/history-tab.component';

export interface Calculation {
  Result: string;
  Equation: string;
}

@Component({
    selector: 'app-base-calculator',
    imports: [ReactiveFormsModule, HistoryTabComponent],
    templateUrl: './base-calculator.component.html',
    styleUrls: ['./base-calculator.component.css']
})
export class BaseCalculatorComponent {
  @ViewChild('expressionInput') expressionInput!: ElementRef<HTMLInputElement>;
  @Input() title: string = '';  // To customize the title
  displayControl = new FormControl('');
  temporaryResult: string = '';
  error: string = '';
  @ViewChild(HistoryTabComponent) historyTabComponent!: HistoryTabComponent; // Reference to HistoryTabComponent

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
    if(input === 'Backspace')
    {
      this.backspace();
    }
    if(!allowedCharacters.test(input))
    {
      event.preventDefault();
    }
  }

  /** Toggles the sign of the current value */
  toggleSign(): void {
    const currentValue = this.displayControl.value || '';
    if (currentValue.startsWith('-')) {
      this.displayControl.setValue(currentValue.slice(1));
    } else {
      this.displayControl.setValue(`-${currentValue}`);
    }

    try {
      this.updateTemporaryResult(this.displayControl.value || '')
    } catch (error) { }
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
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
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
    const inputElement = this.expressionInput.nativeElement;
    if (!inputElement) return;
  
    const currentValue = this.displayControl.value || '';
    const cursorPosition = inputElement.selectionStart || 0;
  
    if (cursorPosition === 0) return; // If cursor is at the start, do nothing
  
    const newValue = currentValue.slice(0, cursorPosition - 1) + currentValue.slice(cursorPosition);
    this.displayControl.setValue(newValue);
    inputElement.focus();
    inputElement.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
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
      this.historyTabComponent.AddCalculation({ Result: calculatedResult, Equation: this.displayControl.value || ''})

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
    const inputElement = this.expressionInput.nativeElement;
    let buttonValue = '';

    if (typeof param === 'string') {
      // If param is a string, directly use it
      buttonValue = param;
    } else if (param instanceof Event) {
      // If param is an Event, extract the button text
      buttonValue = (param.target as HTMLButtonElement).textContent || '';
    }

    const currentValue = this.displayControl.value || '';
    const cursorPosition = inputElement.selectionStart || 0;
  
    // Insert the buttonValue at the cursor position
    const newValue = currentValue.slice(0, cursorPosition) + buttonValue + currentValue.slice(cursorPosition);
    this.displayControl.setValue(newValue);


    // If the inserted value contains '()', move cursor inside parentheses
    if (buttonValue.includes('()')) {
      this.moveCursorToParentheses( this.displayControl.value || '')
    }
    else
    {
      let newCursorPos = cursorPosition + buttonValue.length;

      setTimeout(() => {
        inputElement.focus();
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
      }, 0); // Slight delay to ensure the DOM updates
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
