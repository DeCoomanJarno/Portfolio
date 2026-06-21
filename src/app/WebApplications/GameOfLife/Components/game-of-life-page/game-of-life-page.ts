import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameConfigComponent } from '../../../../Core/Components/game-config/game-config';
import { LoadingComponent } from "../../../../Core/Components/loading/loading";
import { ConfigOption, SimulationConfig, SimulationConfigChange } from '../../../../Core/Models/simulation-config.model';

@Component({
  selector: 'app-game-of-life-page',
  standalone: true,
  imports: [CommonModule, GameConfigComponent, LoadingComponent],
  templateUrl: './game-of-life-page.html',
  styleUrls: ['./game-of-life-page.scss']
})
export class GameOfLifePageComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  config: SimulationConfig = {
    rows: 100,
    cols: 100,
    updateTime: 0, // no interval anymore
    cellSize: 6
  };

  lifeOptions: ConfigOption[] = [
  
];

  private current!: Uint8Array;
  private next!: Uint8Array;

  private running = false;
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
    this.randomize();
    this.draw();
    this.isLoading = false;
  }

  // ---------------------------
  // GRID INIT
  // ---------------------------

  private initGrid(): void {
    const size = this.config.rows * this.config.cols;
    this.current = new Uint8Array(size);
    this.next = new Uint8Array(size);
  }

  private index(r: number, c: number): number {
    return r * this.config.cols + c;
  }

  // ---------------------------
  // CORE SIMULATION
  // ---------------------------

  private step(): void {
    const { rows, cols } = this.config;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        let alive = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const rr = r + i;
            const cc = c + j;

            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
              alive += this.current[this.index(rr, cc)];
            }
          }
        }

        const idx = this.index(r, c);
        const self = this.current[idx];

        this.next[idx] =
          (self === 1 && (alive === 2 || alive === 3)) ||
          (self === 0 && alive === 3)
            ? 1
            : 0;
      }
    }

    // swap buffers
    [this.current, this.next] = [this.next, this.current];
  }

  // ---------------------------
  // LOOP (HIGH PERFORMANCE)
  // ---------------------------

  private loop = (time: number) => {
    if (!this.running) return;

    if (time - this.lastUpdate > this.config.updateTime) {
      this.step();
      this.draw();
      this.lastUpdate = time;
    }

    this.animationId = requestAnimationFrame(this.loop);
  };

  // ---------------------------
  // DRAW (CANVAS ONLY)
  // ---------------------------
private getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
  private draw(): void {
    const { rows, cols, cellSize } = this.config;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = this.getCssVar('--color-primary');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = this.index(r, c);
        if (this.current[idx] === 1) {
          ctx.fillRect(
            c * cellSize,
            r * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }

  // ---------------------------
  // USER ACTIONS (same features)
  // ---------------------------

  Activate(): void {
    if (this.running) return;
    this.running = true;
    this.loop(performance.now());
  }

  Deactivate(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  Clear(): void {
    this.Deactivate();
    this.initGrid();
    this.draw();
  }

  Randomize(): void {
    const size = this.config.rows * this.config.cols;
    for (let i = 0; i < size; i++) {
      this.current[i] = Math.random() > 0.5 ? 1 : 0;
    }
    this.draw();
  }

onCanvasClick(event: MouseEvent): void {
  const canvas = this.canvas.nativeElement;

  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.floor(x / this.config.cellSize);
  const row = Math.floor(y / this.config.cellSize);

  if (
    row < 0 || row >= this.config.rows ||
    col < 0 || col >= this.config.cols
  ) {
    return;
  }

  const idx = this.index(row, col);

  // toggle cell
  this.current[idx] = this.current[idx] ? 0 : 1;

  // immediate redraw
  this.draw();
}

  // ---------------------------
  // RESIZE
  // ---------------------------

  RowsChanged(newRows: number): void {
    this.config.rows = newRows;
    this.rebuildGrid();
  }

  ColsChanged(newCols: number): void {
    this.config.cols = newCols;
    this.rebuildGrid();
  }

  private rebuildGrid(): void {
    this.Deactivate();
    this.initGrid();
    this.randomize();
    this.resizeCanvas();
    this.draw();
  }

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;
    canvas.width = this.config.cols * this.config.cellSize;
    canvas.height = this.config.rows * this.config.cellSize;
  }

  // ---------------------------
  // CONFIG HOOK (kept compatible)
  // ---------------------------
  onConfigChanged(event: SimulationConfigChange): void {

    if (!event.config) return;

    this.config = event.config;
    this.rebuildGrid();
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
randomize(): void {
  const size = this.config.rows * this.config.cols;

  for (let i = 0; i < size; i++) {
    this.current[i] = Math.random() > 0.5 ? 1 : 0;
  }

  this.draw();
}

}