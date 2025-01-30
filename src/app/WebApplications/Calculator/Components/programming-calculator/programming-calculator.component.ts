import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HistoryTabComponent } from '../history-tab/history-tab.component';
import { Calculation } from '../base-calculator/base-calculator.component';

export interface ProgrammingCalculation extends Calculation {
  mode: EProgrammingMode;
}
enum EProgrammingMode {
  Binary = 2,
  Octal = 8,
  Dec = 10,
  Hex = 16,
}
export class ProgrammingModeValue {
  constructor(public mode: EProgrammingMode, public value: string = '0', public title?: string) {

  }
}

@Component({
  selector: 'app-programming-calculator',
  standalone: true,
  imports: [FormsModule, NgClass, ReactiveFormsModule, HistoryTabComponent],
  templateUrl: './programming-calculator.component.html',
  styleUrls: ['./programming-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class ProgrammingCalculatorComponent {
  values!: ProgrammingModeValue[];
  currentMode: EProgrammingMode = EProgrammingMode.Dec;
  tempResult: string = "";
  currentValue: string = "";
  @ViewChild(HistoryTabComponent) historyTabComponent!: HistoryTabComponent; // Reference to HistoryTabComponent

  constructor() {
    this.values = [];

    // Loop through keys in EProgrammingMode enum, excluding numeric values
    const keys = Object.keys(EProgrammingMode).filter(key => isNaN(Number(key)));

    keys.forEach((key) => {
      const mode = EProgrammingMode[key as keyof typeof EProgrammingMode];  // Get the enum value
      this.values.push({ value: '0', mode: mode, title: key.toString() });
    });
  }

  // Function to handle Enter key
  handleKeyPress(event: KeyboardEvent) {
    var input = event.key;
    if (input === 'Enter') {
      this.calculate(); // Calculate if Enter is pressed
    }
    if (input === 'Backspace') {
      this.backspace();
    }
    if (!this.GetAllowedCharacters().test(input.toUpperCase())) {
      event.preventDefault();
    }
    else {
      this.AddValue(input);
    }
  }

  GetAllowedCharacters(): RegExp {
    switch (this.currentMode) {
      case EProgrammingMode.Binary:
        return /[0-1+\-*/()]/;
      case EProgrammingMode.Octal:
        return /[0-7+\-*/()]/;
      case EProgrammingMode.Dec:
        return /[0-9+\-*/()]/;
      case EProgrammingMode.Hex:
        return /[0-9A-Fa-f+\-*/()]/;

    }
  }

  loadFromHistory(item: ProgrammingCalculation | Calculation) {
    const programmingItem = item as ProgrammingCalculation;
    if(!programmingItem)
      return;
    this.currentValue = programmingItem.Equation
    this.currentMode = programmingItem.mode;
    this.updateValues(Number.parseInt(programmingItem.Result))
  }

  ToggleSign() {
    const operators = /[-+×÷]/;

    if (this.currentValue.startsWith("(") && this.currentValue.endsWith(")")) {
      // If the expression is wrapped in "(...)", toggle it to "-(...)"
      if (this.currentValue.startsWith("-(") && this.currentValue.endsWith(")")) {
        // If it's already wrapped with "-(...)", remove the "-(...)"
        this.currentValue = this.currentValue.slice(2, -1);
      } else {
        // Otherwise, add the "-(...)"
        this.currentValue = `-(${this.currentValue})`;
      }
    } else if (operators.test(this.currentValue.slice(1))) {
      // For complex expressions containing operators
      if (this.currentValue.startsWith("-(") && this.currentValue.endsWith(")")) {
        const innerExpression = this.currentValue.slice(2, -1);

        // Check if doubly negated, e.g., -(-(equation))
        if (innerExpression.startsWith("-(") && innerExpression.endsWith(")") && this.isBalanced(innerExpression)) {
          // Remove outer negation to simplify to -(equation)
          this.currentValue = innerExpression;
        } else if (this.isBalanced(innerExpression)) {
          // If fully wrapped in "-(...)", remove the outer "-(...)"
          this.currentValue = innerExpression;
        } else {
          // Wrap the expression in "-(...)"
          this.currentValue = `-(${this.currentValue})`;
        }
      } else {
        // If expression has operators but is not wrapped, wrap it in "-(...)"
        this.currentValue = `-(${this.currentValue})`;
      }
    } else {
      // Simple case: single part, toggle leading minus sign
      this.currentValue = this.currentValue.startsWith("-")
        ? this.currentValue.slice(1)
        : `-${this.currentValue}`;
    }
    try {
      let number = eval(this.ReplaceOperators(this.ConvertExpression(EProgrammingMode.Dec)));
      this.tempResult = number.toString();
      this.updateValues(number);
    }
    catch (error) {

    }
  }

  // Helper function to check if parentheses are balanced in the expression
  isBalanced(expression: string) {
    let stack = [];
    for (let char of expression) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    return stack.length === 0;
  }



  backspace() {
    const currentValue = this.currentValue || '';
    this.currentValue = currentValue.slice(0, -1);
    try {
      let number = eval(this.ReplaceOperators(this.ConvertExpression(EProgrammingMode.Dec))) ?? 0;
      this.tempResult = number;
      this.updateValues(number);
    }
    catch (error) {
    }
  }

  AddValue(param: Event | string): void {
    let buttonValue = '';

    if (typeof param === 'string') {
      // If param is a string, directly use it
      buttonValue = param;
    } else if (param instanceof Event) {
      // If param is an Event, extract the button text
      buttonValue = (param.target as HTMLButtonElement).textContent || '';
    }

    this.currentValue += buttonValue;

    try {

      let number = eval(this.ReplaceOperators(this.ConvertExpression(EProgrammingMode.Dec)));
      this.tempResult = number;
      this.updateValues(number);
    }
    catch (error) {

    }
  }
  /**
   * Clears the calculator display and resets the values.
   */
  clearDisplay() {
    this.currentValue = "";
    this.tempResult = "";
    this.updateValues(0);
  }

  /**
   * Updates the hexadecimal, decimal, octal, and binary values based on the current input.
   */
  updateValues(value: number) {
    this.values.forEach(valueMode => {
      valueMode.value = value.toString(valueMode.mode).toUpperCase();
    });
  }

  /**
   * Switches between number modes (HEX, DEC, OCT, BIN) when the mode is clicked.
   */
  switchMode(base: number) {
    try {
      if (this.currentValue !== "") {
        var convertedExpression = this.ConvertExpression(base);

        if (base !== EProgrammingMode.Dec) // not yet converted to base 10 -> convert yourself
        {
          var convertHexExpression = this.ConvertExpression(EProgrammingMode.Dec);
          this.tempResult = eval(this.ReplaceOperators(convertHexExpression));
        }
        else {
          this.tempResult = eval(this.ReplaceOperators(convertedExpression));
        }

        // change value
        this.currentValue = convertedExpression;
      }
      // change currentmode
      this.currentMode = base;
    }
    catch (error) {
      // change value
      var convertedExpression = this.ConvertExpression(base);
      this.currentValue = convertedExpression;
      // change currentmode
      this.currentMode = base;
    }
  }

  ConvertExpression(base: number): string {
    try
    {
      
    const operators = /([-+×÷()])/;
    const parts = this.currentValue.split(operators);

    let evalExpression = '';

    parts?.forEach(part => {
      if (part && part.length !== 0) {
        if (operators.test(part)) {
          evalExpression += part;  // Directly concatenate the operator
        } else {
          evalExpression += parseInt(part, this.currentMode).toString(base).toUpperCase();  // Directly concatenate the number part as a string
        }
      }
    });
    return evalExpression;
  } catch (error) {
    return "";
  }
  }

  ReplaceOperators(expression: string): string {
    return expression.replaceAll("×", "*").replaceAll("÷", "/")
  }

  UpdateTemperary() {
    var convertHexExpression = this.ConvertExpression(EProgrammingMode.Dec);
    this.tempResult = eval(this.ReplaceOperators(convertHexExpression));
  }

  /**
   * Perform the calculation based on the current input.
   * You can expand this with actual arithmetic logic as needed.
   */
  calculate() {
    try {
      // Evaluate the expression
      var convertHexExpression = this.ConvertExpression(EProgrammingMode.Dec);
      const calculatedResult = eval(this.ReplaceOperators(convertHexExpression));

      // expression is just a number
      if (convertHexExpression === calculatedResult)
        return;

      // Save to history
      this.historyTabComponent.AddCalculation({ Result: calculatedResult.toString(this.currentMode), Equation: this.currentValue || '', mode: this.currentMode})
      
      this.currentValue = calculatedResult.toString(this.currentMode); // Override input with result
      this.updateValues(Number.parseInt(calculatedResult))
    } catch (error) {
    }
  }
}