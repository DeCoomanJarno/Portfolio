import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { HistoryTabComponent } from '../history-tab/history-tab';
import { Calculation } from '../base-calculator/base-calculator';

/** Enum representing different programming modes */
export enum EProgrammingMode {
  Binary = 2,
  Octal = 8,
  Dec = 10,
  Hex = 16,
}

/** Interface extending Calculation with mode property */
export interface ProgrammingCalculation extends Calculation {
  mode: EProgrammingMode;
}

/** Class for handling programming mode values */
export class ProgrammingModeValue {
  constructor(
    public mode: EProgrammingMode,
    public value: string = '0',
    public title?: string
  ) { }
}

@Component({
    selector: 'app-programming-calculator',
    imports: [FormsModule, NgClass, ReactiveFormsModule, HistoryTabComponent],
    templateUrl: './programming-calculator.html',
    styleUrls: [
        './programming-calculator.css',
        '../base-calculator/base-calculator.css',
    ]
})
export class ProgrammingCalculatorComponent {
  operators = /([-+×÷()*/])/;
  error: string = '';
  values: ProgrammingModeValue[] = [];
  currentMode: EProgrammingMode = EProgrammingMode.Dec;
  tempResult: string = '';
  currentValue: string = '';

  @ViewChild(HistoryTabComponent) historyTabComponent!: HistoryTabComponent;

  constructor() {
    this.initializeModes();
  }

  /** Initializes values for each programming mode */
  private initializeModes(): void {
    const keys = Object.keys(EProgrammingMode).filter((key) =>
      isNaN(Number(key))
    ) as (keyof typeof EProgrammingMode)[];

    this.values = keys.map((key) => ({
      value: '0',
      mode: EProgrammingMode[key],
      title: key.toString(),
    }));
  }

  /** Handles keypress events */
  handleKeyPress(event: KeyboardEvent): void {
    this.error = '';
    const input = event.key;

    if (input === 'Enter') this.calculate();
    else if (input === 'Backspace') this.backspace();
    else if (!this.getAllowedCharacters().test(input.toUpperCase())) {
      event.preventDefault();
    } else {
      this.addValue(input);
    }
  }


/** Returns the allowed characters for the current mode */
private getAllowedCharacters(): RegExp {
  const operatorsPattern = this.escapeRegex(this.operators.source); // Extracts pattern from RegExp

  switch (this.currentMode) {
    case EProgrammingMode.Binary:
      return new RegExp(`^[01${operatorsPattern}]$`); // Binary: 0,1 + operators
    case EProgrammingMode.Octal:
      return new RegExp(`^[0-7${operatorsPattern}]$`); // Octal: 0-7 + operators
    case EProgrammingMode.Dec:
      return new RegExp(`^[0-9${operatorsPattern}]$`); // Decimal: 0-9 + operators
    case EProgrammingMode.Hex:
      return new RegExp(`^[0-9A-Fa-f${operatorsPattern}]$`); // Hex: 0-9, A-F, a-f + operators
    default:
      return new RegExp(`^[${operatorsPattern}]$`); // Only operators
  }
}


/** Escapes special regex characters to avoid breaking the pattern */
private escapeRegex(value: string): string {
  return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
}


  /** Loads an equation from history */
  loadFromHistory(item: ProgrammingCalculation | Calculation): void {
    this.error = '';
    if (!item) return;

    const programmingItem = item as ProgrammingCalculation;
    this.currentValue = programmingItem.Equation;
    this.currentMode = programmingItem.mode;
    this.updateValues(parseInt(programmingItem.Result, 10));
  }

  /** Toggles the sign of the current value */
  toggleSign(): void {
    if (this.currentValue.startsWith('-')) {
      this.currentValue = this.currentValue.slice(1);
    } else {
      this.currentValue = `-${this.currentValue}`;
    }

    try {
      const number = eval(this.replaceOperators(this.convertExpression(EProgrammingMode.Dec)));
      this.tempResult = number.toString();
      this.updateValues(number);
    } catch (error) { }
  }

  /** Handles backspace key */
  backspace(): void {
    this.currentValue = this.currentValue.slice(0, -1);

    try {
      const number = eval(this.replaceOperators(this.convertExpression(EProgrammingMode.Dec))) ?? 0;
      this.tempResult = number.toString();
      this.updateValues(number);
    } catch (error) { }
  }

  /** Adds a value to the current input */
  addValue(param: Event | string): void {
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
      const number = eval(this.replaceOperators(this.convertExpression(EProgrammingMode.Dec)));
      this.tempResult = number.toString();
      this.updateValues(number);
    } catch (error) { }
  }

  /** Clears the calculator display */
  clearDisplay(): void {
    this.currentValue = '';
    this.tempResult = '';
    this.error = '';
    this.updateValues(0);
  }

  /** Updates the stored values for different bases */
  private updateValues(value: number): void {
    this.values.forEach(
      (valueMode) => (valueMode.value = value.toString(valueMode.mode).toUpperCase())
    );
  }

  /** Switches to a different mode */
  switchMode(base: EProgrammingMode): void {
    try {
      let convertedExpression = this.convertExpression(base);
      this.tempResult = eval(this.replaceOperators(this.convertExpression(EProgrammingMode.Dec))).toString();

      this.currentValue = convertedExpression;
      this.currentMode = base;
    } catch (error) {
      this.currentValue = this.convertExpression(base);
      this.currentMode = base;
    }
  }

  /** Converts an expression to the specified base */
  private convertExpression(base: number): string {
    try {
      return this.currentValue
        .split(this.operators)
        .map((part) =>
          part && part.length !== 0
            ? this.operators.test(part)
              ? part
              : parseInt(part, this.currentMode).toString(base).toUpperCase()
            : ""
        )
        .join('');
    } catch (error) {
      return "";
    }
  }

  /** Replaces special operators with JavaScript-compatible ones */
  private replaceOperators(expression: string): string {
    return expression.replaceAll('×', '*').replaceAll('÷', '/');
  }

  /** Updates temporary result */
  updateTemporary(): void {
    try {
      this.tempResult = eval(this.replaceOperators(this.convertExpression(EProgrammingMode.Dec))).toString();
    } catch (error) { }
  }

  /** Performs calculation and stores result in history */
  calculate(): void {
    try {
      this.error = '';
      const convertHexExpression = this.convertExpression(EProgrammingMode.Dec);
      const calculatedResult = eval(this.replaceOperators(convertHexExpression));

      if (convertHexExpression === calculatedResult.toString()) return;

      this.historyTabComponent.AddCalculation({
        Result: calculatedResult.toString(this.currentMode),
        Equation: this.currentValue || '',
        mode: this.currentMode,
      });

      this.currentValue = calculatedResult.toString(this.currentMode);
      this.updateValues(parseInt(calculatedResult.toString(), 10));
    } catch (error) {
      this.error = 'Invalid expression';
    }
  }
}
