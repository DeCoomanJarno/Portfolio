import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

import {
  SimulationConfig,
  ConfigOption,
  SimulationConfigChange
} from '../../Models/simulation-config.model';

@Component({
  selector: 'app-game-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './game-config.html',
  styleUrl: './game-config.scss'
})
export class GameConfigComponent implements OnChanges {

  @Input({ required: true })
  config!: SimulationConfig;

  @Input()
  options: ConfigOption[] = [];

  @Output()
  configChanged = new EventEmitter<SimulationConfigChange>();

  form!: FormGroup;

  private lastEmitted!: SimulationConfig;

  constructor(private fb: FormBuilder) {}

  // ----------------------------
  // INPUT SYNC
  // ----------------------------

  ngOnChanges(): void {
    if (!this.config) return;

    if (!this.form) {
      this.buildForm();
      this.bindValueChanges();
    } else {
      this.patchForm();
    }
  }

  // ----------------------------
  // FORM SETUP
  // ----------------------------

  private buildForm(): void {
    this.form = this.fb.group({
      rows: [this.config.rows],
      cols: [this.config.cols],
      updateTime: [this.config.updateTime],
      cellSize: [this.config.cellSize]
    });

    this.lastEmitted = { ...this.config };
  }

  private patchForm(): void {
    this.form.patchValue(
      {
        rows: this.config.rows,
        cols: this.config.cols,
        updateTime: this.config.updateTime,
        cellSize: this.config.cellSize
      },
      { emitEvent: false } // IMPORTANT: prevents loops
    );
  }

  // ----------------------------
  // REACTIVE STREAM
  // ----------------------------

  private bindValueChanges(): void {
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        debounceTime(0), // yield to browser (prevents startup blocking)
        distinctUntilChanged((a, b) => this.shallowEqual(a, b))
      )
      .subscribe(value => {

        const newConfig: SimulationConfig = {
          rows: Number(value.rows),
          cols: Number(value.cols),
          updateTime: Number(value.updateTime),
          cellSize: Number(value.cellSize)
        };

        // avoid unnecessary emits
        if (this.isSameConfig(newConfig)) return;

        this.lastEmitted = newConfig;

        this.configChanged.emit({
          config: newConfig,
          options: this.options
        });
      });
  }

  // ----------------------------
  // OPTION HANDLING (lightweight)
  // ----------------------------

  updateOption(option: ConfigOption, value: any): void {
    option.value = value;

    this.configChanged.emit({
      config: this.lastEmitted,
      options: this.options
    });
  }

  // ----------------------------
  // HELPERS
  // ----------------------------

  private isSameConfig(next: SimulationConfig): boolean {
    return (
      this.lastEmitted.rows === next.rows &&
      this.lastEmitted.cols === next.cols &&
      this.lastEmitted.updateTime === next.updateTime &&
      this.lastEmitted.cellSize === next.cellSize
    );
  }

  private shallowEqual(a: any, b: any): boolean {
    return (
      a.rows === b.rows &&
      a.cols === b.cols &&
      a.updateTime === b.updateTime &&
      a.cellSize === b.cellSize
    );
  }
}