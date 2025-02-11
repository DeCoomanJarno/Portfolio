import { Component, EventEmitter, Output } from '@angular/core';
import { Calculation } from '../base-calculator/base-calculator.component';
import { ProgrammingCalculation } from '../programming-calculator/programming-calculator.component';

@Component({
  selector: 'app-history-tab',
  standalone: true,
  imports: [],
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.css'] // Fixed the property name from styleUrl to styleUrls
})
export class HistoryTabComponent {
  history: (Calculation|ProgrammingCalculation)[] = [];
  @Output() OnLoadFromHistory = new EventEmitter<Calculation | ProgrammingCalculation>();

  // Check if the calculation already exists in history
  HasCalculation(calculation: Calculation | ProgrammingCalculation): boolean {
    return this.history.some(existingCalculation => 
      this.areEqual(existingCalculation, calculation)
    );
  }

  // Compare two Calculation objects for equality
  private areEqual(calc1: Calculation | ProgrammingCalculation, calc2: Calculation | ProgrammingCalculation): boolean {
    // Check if both are ProgrammingCalculation
    if (this.isProgrammingCalculation(calc1) && this.isProgrammingCalculation(calc2)) {
      return calc1.Result === calc2.Result &&
             calc1.Equation === calc2.Equation &&
             calc1.mode === calc2.mode; // Include mode in comparison
    }

    // If both are standard Calculation
    return calc1.Result === calc2.Result && calc1.Equation === calc2.Equation;
  }
  // Type guard to check if an object is a ProgrammingCalculation
 isProgrammingCalculation(calculation: Calculation | ProgrammingCalculation): calculation is ProgrammingCalculation {
    return (calculation as ProgrammingCalculation).mode !== undefined;
  }


  AddCalculation(calculation: Calculation | ProgrammingCalculation) {
    if (!this.HasCalculation(calculation)) {
      this.history.push(calculation);
    }
  }

  LoadFromHistory(calculation: Calculation | ProgrammingCalculation) {
    this.OnLoadFromHistory.emit(calculation);
  }
}