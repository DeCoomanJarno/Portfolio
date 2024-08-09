import { Component, OnInit } from '@angular/core';
import { GameConfig } from '../../../Core/Models/GameConfig.Model';
import { CommonModule } from '@angular/common';
import { GameConfigComponent } from '../../../Core/Components/game-config/game-config.component';
import { LoadingComponent } from "../../../Core/Components/loading/loading.component";
import { Cell } from '../../../Core/Models/Cell.Model';

@Component({
  selector: 'app-game-of-life-page',
  standalone: true,
  imports: [CommonModule, GameConfigComponent, LoadingComponent],
  templateUrl: './game-of-life-page.component.html',
  styleUrls: ['./game-of-life-page.component.css']
})
export class GameOfLifePageComponent implements OnInit {

  grid: Cell[][] = [];
  config: GameConfig = { rows: 100, cols: 100, updateTime: 100, cellSize: 10 };
  interval!: NodeJS.Timeout;
  isRunning: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.grid = this.CreateGrid();
    this.Randomize();
  }

  CreateGrid(): Cell[][] {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < this.config.rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < this.config.cols; j++) {
        newGrid[i][j] = { state: false, x: i, y: j }; // Initialize cells with `true`
      }
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
    this.grid = this.CreateGrid(); // Reinitialize grid with all cells as `true`
  }

  Update(): void {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < this.config.rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < this.config.cols; j++) {
        const aliveNeighbours = this.CountAliveNeighbours(i, j);
        const currentCell = this.grid[i][j];
        newGrid[i][j] = {
          ...currentCell,
          state: (currentCell.state && (aliveNeighbours === 2 || aliveNeighbours === 3)) ||
                 (!currentCell.state && aliveNeighbours === 3)
        };
      }
    }
    this.grid = newGrid;
  }

  CountAliveNeighbours(row: number, col: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const x = row + i;
        const y = col + j;
        if (x >= 0 && x < this.config.rows && y >= 0 && y < this.config.cols && this.grid[x][y].state) {
          count++;
        }
      }
    }
    return count;
  }

  Randomize(): void {
    for (let i = 0; i < this.config.rows; i++) {
      for (let j = 0; j < this.config.cols; j++) {
        this.grid[i][j].state = Math.random() > 0.5;
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
    setTimeout(() => { }, 0);
    // Adjust the number of rows
    if (newRowCount > currentRowCount) {
      // Add new rows
      for (let i = currentRowCount; i < newRowCount; i++) {
        this.grid.push(new Array(this.config.cols).fill(false));
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
    // Process each row asynchronously to avoid blocking the UI
    for (let i = 0; i < this.grid.length; i++) {
      
        const row = this.grid[i];
        if (newColCount > currentColCount) {
          // Add new columns
          row.push(...Array(newColCount - currentColCount).fill(false));
        } else if (newColCount < currentColCount) {
          // Remove extra columns
          row.splice(newColCount);
        }

    }
    this.config.cols = newColCount;
    this.isLoading = false;
  }
}
