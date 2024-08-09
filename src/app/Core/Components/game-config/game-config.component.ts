import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameConfig } from '../../Models/GameConfig.Model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-config',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-config.component.html',
  styleUrl: './game-config.component.css'
})
export class GameConfigComponent implements OnInit {
  @Input() config?: GameConfig = {rows: 20, cols: 20, cellSize: 20, updateTime: 100} // Default values -> can be override by the parent

  @Output() ColsChanged = new EventEmitter<number>();
  @Output() RowsChanged = new EventEmitter<number>();
  @Output() CellSizeChanged = new EventEmitter<number>();
  @Output() UpdateTimeChanged = new EventEmitter<number>();
  @Output() ConfigChanged = new EventEmitter<GameConfig>();

  ngOnInit(): void {
    // Merge default values with provided config
    this.config = { 
      rows: 20, 
      cols: 20, 
      cellSize: 20, 
      updateTime: 100, 
      ...this.config 
    };
    
    this.RowsChanged.subscribe(() => {this.ConfigChanged.emit(this.config);}) ;
    this.ColsChanged.subscribe(() => {this.ConfigChanged.emit(this.config);}) ;
    this.CellSizeChanged.subscribe(() => {this.ConfigChanged.emit(this.config);}) ;
    this.UpdateTimeChanged.subscribe(() => {this.ConfigChanged.emit(this.config);}) ;
  }

  UpdateCol($event: Event) {
    if(!this.config)
      return;

    const inputElement = $event.target as HTMLInputElement;
    this.config.cols = Number(inputElement.value);
    this.ColsChanged.emit(this.config.cols);
  }
  
  UpdateRow($event: Event) {
    if(!this.config)
      return;

    const inputElement = $event.target as HTMLInputElement;
    this.config.rows = Number(inputElement.value);
    this.RowsChanged.emit(this.config.rows);
  }
  
  UpdateCellSize($event: Event) {
    if(!this.config)
      return;
    
    const inputElement = $event.target as HTMLInputElement;
    this.config.cellSize = Number(inputElement.value);
    this.CellSizeChanged.emit(this.config.cellSize);
  }

  UpdateTime($event: Event): void {
    if(!this.config)
      return;
    
    const inputElement = $event.target as HTMLInputElement;
    this.config.updateTime = Number(inputElement.value);
    this.UpdateTimeChanged.emit(this.config.updateTime);
  }

}
