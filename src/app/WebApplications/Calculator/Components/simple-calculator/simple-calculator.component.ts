import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BaseCalculatorComponent } from '../base-calculator/base-calculator.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-calculator',
  standalone: true,
  imports: [BaseCalculatorComponent, ReactiveFormsModule],
  templateUrl: './simple-calculator.component.html',
  styleUrls: ['./simple-calculator.component.css', '../base-calculator/base-calculator.component.css']
})
export class SimpleCalculatorComponent {
  @ViewChild(BaseCalculatorComponent) baseCalculator: BaseCalculatorComponent | undefined;

  }
