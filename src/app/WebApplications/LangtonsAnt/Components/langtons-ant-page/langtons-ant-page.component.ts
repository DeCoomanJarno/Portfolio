import { Component, OnInit } from '@angular/core';
import { Cell } from '../../../../Core/Models/Cell.Model';
import { GameConfig } from '../../../../Core/Models/GameConfig.Model';
import { CommonModule } from '@angular/common';
import { GameConfigComponent } from '../../../../Core/Components/game-config/game-config.component';
import { LoadingComponent } from '../../../../Core/Components/loading/loading.component';

@Component({
  selector: 'app-langtons-ant-page',
  standalone: true,
  imports: [CommonModule, GameConfigComponent, LoadingComponent],
  templateUrl: './langtons-ant-page.component.html',
  styleUrl: './langtons-ant-page.component.css'
})
export class LangtonsAntPageComponent implements OnInit {

  config: GameConfig = { rows: 100, cols: 100, updateTime: 100, cellSize: 10 };
  grid!: Cell[][];
  interval!: NodeJS.Timeout;
  isRunning: boolean = false;
  isLoading: boolean = false;
  antLocation: {x: number, y: number} = {x: 0, y:0};

  ngOnInit(): void {
    this.isLoading = true;
    this.initializeGridAsync()
  }

  initializeGridAsync(): void {
    // Delay execution to prevent blocking the main thread
    setTimeout(() => {
      this.grid = this.CreateGrid();
      this.Randomize();
      this.isLoading = false;
    }, 0);
  }


  CreateGrid(): Cell[][] {
    const newGrid: Cell[][] = new Array(this.config.rows);

    for (let i = 0; i < this.config.rows; i++) {
      const row: Cell[] = new Array(this.config.cols);
      for (let j = 0; j < this.config.cols; j++) {
        row[j] = { state: false, x: i, y: j };
      }
      newGrid[i] = row;
    }

    return newGrid;
  }


  Activate(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.Update();
    }, this.config.updateTime);
  }

  Deactivate(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.interval);
  }

  Clear(): void {
    this.Deactivate();
    this.isLoading = true;
    setTimeout(() => {
      this.grid = this.CreateGrid();
      this.isLoading = false;
    }, 0);
  }


  Update(): void {
  }


  Randomize(): void {
    for (const row of this.grid) {
      for (const cell of row) {
        cell.state = Math.random() > 0.5;
      }
    }
  }


  ToggleCell(row: number, col: number): void {
    this.grid[row][col].state = !this.grid[row][col].state;
  }

  ConfigChange($event: { gameConfig: GameConfig | undefined, propertyChanged?: string | undefined }) {
    if (!$event.gameConfig)
      return;

    if ($event.propertyChanged === 'Rows' || $event.propertyChanged === 'Cols')
      return;

    if (this.isRunning) {
      this.Deactivate()
      this.config = $event.gameConfig;
      this.Activate()
    }
    else {
      this.config = $event.gameConfig;
    }
  }

  RowsChanged(newRowCount: number) {
    this.isLoading = true;

    const currentRowCount = this.grid.length;

    // Adjust the number of rows
    if (newRowCount > currentRowCount) {
      // Add new rows
      for (let i = currentRowCount; i < newRowCount; i++) {
        let arr = new Array(this.config.cols).fill(0).map((_, j) => {
          return { state: false, x: j, y: i };
        });
        this.grid.push(arr);
      }
    } else if (newRowCount < currentRowCount) {
      // Remove extra rows
      this.grid.splice(newRowCount);
    }

    this.config.rows = newRowCount;
    this.isLoading = false;
  }

  ColsChanged(newColCount: number) {
    this.isLoading = true;
    const currentColCount = this.grid[0]?.length || 0;

    // Adjust the number of columns in each row
    if (newColCount > currentColCount) {
      // Add new columns to each row
      for (let i = 0; i < this.grid.length; i++) {
        const row = this.grid[i];
        const newCells = new Array(newColCount - currentColCount).fill(0).map((_, j) => {
          return { state: false, x: currentColCount + j, y: i };
        });
        row.push(...newCells);
      }
    } else if (newColCount < currentColCount) {
      // Remove extra columns from each row
      for (let i = 0; i < this.grid.length; i++) {
        this.grid[i].splice(newColCount);
      }
    }

    this.config.cols = newColCount;
    this.isLoading = false;
  }

}
