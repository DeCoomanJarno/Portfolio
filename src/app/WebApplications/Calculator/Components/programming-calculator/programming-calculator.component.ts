import { Component, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator.component';
import { FormsModule } from '@angular/forms';

enum EProgrammingMode
{
  Binary = 2,
  Octal = 8,
  Dec = 10,
  Hex = 16,
}
export class ProgrammingModeValue
{ 
  constructor(public mode: EProgrammingMode, public value: string = '0', public title?: string)
  {

  }
}

@Component({
  selector: 'app-programming-calculator',
  standalone: true,
  imports: [BaseCalculatorComponent, FormsModule],
  templateUrl: './programming-calculator.component.html',
  styleUrls: ['./programming-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class ProgrammingCalculatorComponent { 
  values!: ProgrammingModeValue[];
  currentValue: ProgrammingModeValue = {mode: EProgrammingMode.Dec, value: '0'};

  constructor() {
    this.values = [];

    // Loop through keys in EProgrammingMode enum, excluding numeric values
    const keys = Object.keys(EProgrammingMode).filter(key => isNaN(Number(key)));

    keys.forEach((key) => {
      const mode = EProgrammingMode[key as keyof typeof EProgrammingMode];  // Get the enum value
      this.values.push({ value: '0', mode: mode, title: key.toString() });
    });
  }

  /**
   * When the user presses a key (numbers or operators)
   */
  pressKey(key: string) {
    // Append to the current display value (in the current base)
    if (this.currentValue.value === '0') {
      this.currentValue.value = key;
    } else {
      this.currentValue.value += key;
    }

    // Convert the value to different number systems
    this.updateValues(parseInt(this.currentValue.value, this.currentValue.mode));
  }

  /**
   * Clears the calculator display and resets the values.
   */
  clearDisplay() {
    this.currentValue.value = '0';
    this.updateValues(0); // Reset to 0 in all bases
  }

  /**
   * Updates the hexadecimal, decimal, octal, and binary values based on the current input.
   */
  updateValues(value: number) {
    this.values.forEach(valueMode => {
      valueMode.value = value.toString(valueMode.mode).toUpperCase();
    });

    // Update the display value based on the current base
    this.updateDisplayValue(value);
  }

  /**
   * Switches between number modes (HEX, DEC, OCT, BIN) when the mode is clicked.
   */
  switchMode(base: number) {
    const currentValue = parseInt(this.currentValue.value, this.currentValue.mode);
    this.currentValue.mode = base;
    
    // Update the display based on the selected base
    this.updateDisplayValue(currentValue);
  }

  /**
   * Updates the displayed value based on the selected number system (HEX, DEC, OCT, BIN).
   */
  updateDisplayValue(value: number) {
    this.currentValue.value = value.toString(this.currentValue.mode).toUpperCase();
  }

  /**
   * Perform the calculation based on the current input.
   * You can expand this with actual arithmetic logic as needed.
   */
  calculate() {
    // TODO: Implement calculation logic based on operators
  }
}