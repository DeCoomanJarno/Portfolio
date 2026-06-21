import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigOption, SimulationConfig, SimulationConfigChange } from '../../../../Core/Models/simulation-config.model';
import { GameConfigComponent } from '../../../../Core/Components/game-config/game-config';
import { LoadingComponent } from '../../../../Core/Components/loading/loading';

@Component({
  selector: 'app-langtons-ant-page',
  standalone: true,
  imports: [CommonModule, GameConfigComponent, LoadingComponent],
  templateUrl: './langtons-ant-page.html',
  styleUrls: ['./langtons-ant-page.scss']
})
export class LangtonsAntPageComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  config: SimulationConfig = {
    rows: 100,
    cols: 100,
    updateTime: 100,
    cellSize: 6
  };

  antOptions: ConfigOption[] = [
  {
    key: 'pattern',
    label: 'simulation.start_grid',
    type: 'select',
    value: 'empty',
    options: [
      {
        value: 'empty',
        label: 'simulation.pattern_empty'
      },
      {
        value: 'random',
        label: 'simulation.pattern_random'
      },
      {
        value: 'cross',
        label: 'simulation.pattern_cross'
      }
    ]
  },
  {
    key: 'startDirection',
    label: 'simulation.start_direction',
    type: 'select',
    value: 'up',
    options: [
      {
        value: 'up',
        label: 'simulation.up'
      },
      {
        value: 'right',
        label: 'simulation.right'
      },
      {
        value: 'down',
        label: 'simulation.down'
      },
      {
        value: 'left',
        label: 'simulation.left'
      }
    ]
  }
];

  public grid!: Uint8Array;

  ant = {
    x: 0,
    y: 0,
    dir: 0 // 0=up,1=right,2=down,3=left
  };

  isRunning = false;
  isLoading = false;

  private animationId: number | null = null;
  private lastUpdate = 0;

  ngOnInit(): void {
    this.isLoading = true;
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    this.resizeCanvas();
    this.initGrid();

    this.resetAnt();

    this.draw();

    this.isLoading = false;
  }

  // --------------------------------
  // GRID
  // --------------------------------

  private initGrid(): void {
    this.grid = new Uint8Array(
      this.config.rows * this.config.cols
    );
  }

  private index(row: number, col: number): number {
    return row * this.config.cols + col;
  }

  private resetAnt(): void {
    this.ant.x = Math.floor(this.config.rows / 2);
    this.ant.y = Math.floor(this.config.cols / 2);
    this.ant.dir = 0;
  }

  // --------------------------------
  // LANGTON'S ANT
  // --------------------------------

  private step(): void {

    const idx = this.index(
      this.ant.x,
      this.ant.y
    );

    const cell = this.grid[idx];

    // White -> right
    // Black -> left
    if (cell === 0) {
      this.ant.dir = (this.ant.dir + 1) % 4;
    } else {
      this.ant.dir = (this.ant.dir + 3) % 4;
    }

    // Flip cell
    this.grid[idx] ^= 1;

    // Move
    switch (this.ant.dir) {

      case 0:
        this.ant.x--;
        break;

      case 1:
        this.ant.y++;
        break;

      case 2:
        this.ant.x++;
        break;

      case 3:
        this.ant.y--;
        break;
    }

    // Wrap around edges
    this.ant.x =
      (this.ant.x + this.config.rows) %
      this.config.rows;

    this.ant.y =
      (this.ant.y + this.config.cols) %
      this.config.cols;
  }

  // --------------------------------
  // LOOP
  // --------------------------------

  private loop = (time: number) => {

    if (!this.isRunning) {
      return;
    }

    if (
      time - this.lastUpdate >=
      this.config.updateTime
    ) {
      this.step();
      this.draw();

      this.lastUpdate = time;
    }

    this.animationId =
      requestAnimationFrame(this.loop);
  };

  Activate(): void {

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastUpdate = performance.now();

    this.loop(this.lastUpdate);
  }

  Deactivate(): void {

    this.isRunning = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // --------------------------------
  // DRAWING
  // --------------------------------

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  private draw(): void {

    const {
      rows,
      cols,
      cellSize
    } = this.config;

    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    // Trail cells
    ctx.fillStyle =
      this.getCssVar('--color-primary');

    for (let r = 0; r < rows; r++) {

      for (let c = 0; c < cols; c++) {

        if (
          this.grid[this.index(r, c)] === 1
        ) {

          ctx.fillRect(
            c * cellSize,
            r * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    // Ant
    ctx.fillStyle = '#ff0000';

    ctx.fillRect(
      this.ant.y * cellSize,
      this.ant.x * cellSize,
      cellSize,
      cellSize
    );
  }

  // --------------------------------
  // USER ACTIONS
  // --------------------------------

  Clear(): void {

    this.Deactivate();

    this.initGrid();
    this.resetAnt();

    this.draw();
  }

  Randomize(): void {

    const size = this.grid.length;

    for (let i = 0; i < size; i++) {
      this.grid[i] =
        Math.random() > 0.9 ? 1 : 0;
    }

    this.draw();
  }

  onCanvasClick(event: MouseEvent): void {

    const rect =
      this.canvas.nativeElement
        .getBoundingClientRect();

    const col = Math.floor(
      (event.clientX - rect.left) /
      this.config.cellSize
    );

    const row = Math.floor(
      (event.clientY - rect.top) /
      this.config.cellSize
    );

    if (
      row < 0 ||
      row >= this.config.rows ||
      col < 0 ||
      col >= this.config.cols
    ) {
      return;
    }

    const idx =
      this.index(row, col);

    this.grid[idx] ^= 1;

    this.draw();
  }

  // --------------------------------
  // RESIZE
  // --------------------------------

  RowsChanged(rows: number): void {

    this.config.rows = rows;
    this.rebuild();
  }

  ColsChanged(cols: number): void {

    this.config.cols = cols;
    this.rebuild();
  }

  private rebuild(): void {

    this.Deactivate();

    this.initGrid();
    this.resetAnt();

    this.resizeCanvas();
    this.draw();
  }

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;
    canvas.width = this.config.cols * this.config.cellSize;
    canvas.height = this.config.rows * this.config.cellSize;
  }

  // --------------------------------
  // CONFIG
  // --------------------------------
  onConfigChanged(event: SimulationConfigChange): void {
    if (!event.config) return;
    this.config = event.config;

    this.rebuild();

  const pattern =
    event.options.find(
      x => x.key === 'pattern'
    )?.value;

  const wrapEdges =
    event.options.find(
      x => x.key === 'wrapEdges'
    )?.value;

  // apply settings
}
}