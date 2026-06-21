import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../../Core/Components/loading/loading';
import { GameConfigComponent } from '../../../../Core/Components/game-config/game-config';
import { ConfigAction, ConfigChange, ConfigField } from '../../../../Core/Models/simulation-config.model';
import { BehaviorSubject } from 'rxjs';

type Direction = 'up' | 'right' | 'down' | 'left';

export interface LangtonsAntConfigModel{
  rows: ConfigField<number>;
  cols: ConfigField<number>;
  cellSize: ConfigField<number>;
  updateTime: ConfigField<number>;
  wrapEdges: ConfigField<boolean>;
  startDirection: ConfigField<Direction>;
}

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

  private grid!: Uint8Array;

  ant = { x: 0, y: 0, dir: 0 };

private isRunning$ = new BehaviorSubject<boolean>(false);  
isLoading = false;

  private animationId: number | null = null;
  private lastUpdate = 0;

  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
cfg: LangtonsAntConfigModel = {
  rows: {
    value: 100,
    min: 10,
    max: 300,
    step: 1,
    type: 'slider',
    labelKey: 'ant.rows.label',
    descriptionKey: 'ant.rows.description'
  },

  cols: {
    value: 100,
    min: 10,
    max: 300,
    step: 1,
    type: 'slider',
    labelKey: 'ant.cols.label',
    descriptionKey: 'ant.cols.description'
  },

  cellSize: {
    value: 6,
    min: 2,
    max: 12,
    step: 1,
    type: 'slider',
    unit: 'px',
    labelKey: 'ant.cellSize.label',
    descriptionKey: 'ant.cellSize.description'
  },

  updateTime: {
    value: 10,
    min: 1,
    max: 10000,
    step: 1,
    type: 'slider',
    unit: 'ms',
    labelKey: 'ant.updateTime.label',
    descriptionKey: 'ant.updateTime.description'
  },

  wrapEdges: {
    value: true,
    type: 'toggle',
    labelKey: 'ant.wrapEdges.label',
    descriptionKey: 'ant.wrapEdges.description'
  },

  startDirection: {
    value: 'up',
    type: 'select',
    labelKey: 'ant.startDirection.label',
    descriptionKey: 'ant.startDirection.description',
    options: [
      { labelKey: 'ant.direction.up', value: 'up' },
      { labelKey: 'ant.direction.right', value: 'right' },
      { labelKey: 'ant.direction.down', value: 'down' },
      { labelKey: 'ant.direction.left', value: 'left' }
    ]
  }
};

actions: ConfigAction[] = [
  {
    labelKey: 'common.start',
    variant: 'primary',
    visible: () => !this.isRunning$.value,
    execute: () => this.Activate()
  },
  {
    labelKey: 'common.pause',
    variant: 'warning',
    visible: () => this.isRunning$.value,
    execute: () => this.Deactivate()
  },
  {
    labelKey: 'common.reset',
    variant: 'danger',
    execute: () => this.Clear()
  },
  {
    labelKey: 'common.randomize',
    variant: 'secondary',
    execute: () => this.Randomize()
  }
];

  // ─────────────────────────────
  ngOnInit(): void {
    this.isLoading = true;
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.initGrid();    
    this.resizeCanvas();
    this.resetAnt();
    this.draw();
    this.isLoading = false;
  }

  // ─────────────────────────────
onConfigChanged(event: ConfigChange<LangtonsAntConfigModel>): void {

  this.cfg = event.full;

  switch (event.key) {
    case 'rows':
    case 'cols':
      this.rebuild();
      break;

    case 'cellSize':
      this.resizeCanvas();
      this.draw();
      break;

    case 'updateTime':
      break;

    case 'wrapEdges':
      break;
      
    case 'startDirection':
      this.resetAnt();
      this.rebuild();
      this.draw();
      break;
  }
}


  // ─────────────────────────────
private initGrid(): void {
  this.grid = new Uint8Array(
    this.cfg.rows.value * this.cfg.cols.value
  );
}

  private index(r: number, c: number): number {
    return r * this.cfg.cols.value + c;
  }

private resetAnt(): void {
  const rows = this.cfg.rows.value;
  const cols = this.cfg.cols.value;

  this.ant.x = Math.floor(rows / 2);
  this.ant.y = Math.floor(cols / 2);

  const map: Record<Direction, number> = {
    up: 3,
    right: 0,
    down: 1,
    left: 2
  };

  this.ant.dir = map[this.cfg.startDirection.value];

  // 🛡 safety clamp (important)
  this.ant.x = Math.min(Math.max(this.ant.x, 0), rows - 1);
  this.ant.y = Math.min(Math.max(this.ant.y, 0), cols - 1);
}

  private step(): void {
  const rows = this.cfg.rows.value;
  const cols = this.cfg.cols.value;

  const idx = this.index(this.ant.x, this.ant.y);
  const cell = this.grid[idx];

  // turn
  this.ant.dir = cell === 0
    ? (this.ant.dir + 1) % 4
    : (this.ant.dir + 3) % 4;

  // flip cell
  this.grid[idx] ^= 1;

  // move
  let x = this.ant.x;
  let y = this.ant.y;

  switch (this.ant.dir) {
    case 0: x--; break;
    case 1: y++; break;
    case 2: x++; break;
    case 3: y--; break;
  }

  // wrap OR clamp (THIS is the key fix)
  if (this.cfg.wrapEdges.value) {
    x = (x + rows) % rows;
    y = (y + cols) % cols;
  } else {
    // clamp OR stop at edges safely
    if (x < 0 || x >= rows || y < 0 || y >= cols) {
      // reverse move (prevents invalid state)
      this.ant.x = Math.min(Math.max(this.ant.x, 0), rows - 1);
      this.ant.y = Math.min(Math.max(this.ant.y, 0), cols - 1);
      return;
    }
  }

  this.ant.x = x;
  this.ant.y = y;
}

  private loop = (t: number) => {
    if (!this.isRunning$.value) return;

    if (t - this.lastUpdate > this.cfg.updateTime.value) {
      this.step();
      this.draw();
      this.lastUpdate = t;
    }

    this.animationId = requestAnimationFrame(this.loop);
  };

  Activate(): void {
    if (this.isRunning$.value) return;
    this.isRunning$.next(true);
        this.lastUpdate = performance.now();
    this.loop(this.lastUpdate);
  }

  Deactivate(): void {
    this.isRunning$.next(false);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private draw(): void {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary');
    ctx.fillStyle = primaryColor;
    for (let r = 0; r < this.cfg.rows.value; r++) {
      for (let c = 0; c < this.cfg.cols.value; c++) {
        if(r === this.ant.x && c == this.ant.y)
        {
          ctx.fillStyle = 'red';

          ctx.fillRect(
            this.ant.y * this.cfg.cellSize.value,
            this.ant.x * this.cfg.cellSize.value,
            this.cfg.cellSize.value,
            this.cfg.cellSize.value
          );
          ctx.fillStyle = primaryColor;
        }
        else if (this.grid[this.index(r, c)] === 1) {
          ctx.fillRect(
            c * this.cfg.cellSize.value,
            r * this.cfg.cellSize.value,
            this.cfg.cellSize.value,
            this.cfg.cellSize.value
          );
        }
      }
    }
  }

  Clear(): void {
    this.Deactivate();
    this.initGrid();
    this.resetAnt();
    this.draw();
  }

  Randomize(): void {
    const size = this.cfg.rows.value * this.cfg.cols.value;

    for (let i = 0; i < size; i++) {
      this.grid[i] = Math.random() > 0.9 ? 1 : 0;
    }

    this.draw();
  }

  onCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.nativeElement.getBoundingClientRect();

    const col = Math.floor((e.clientX - rect.left) / this.cfg.cellSize.value);
    const row = Math.floor((e.clientY - rect.top) / this.cfg.cellSize.value);

    if (row < 0 || col < 0 || row >= this.cfg.rows.value || col >= this.cfg.cols.value) return;

    this.grid[this.index(row, col)] ^= 1;
    this.draw();
  }

private rebuild(): void {
  this.Deactivate();
  this.initGrid();
  this.resizeCanvas();
  this.resetAnt();
  this.draw();
}

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;

    canvas.width = this.cfg.cols.value * this.cfg.cellSize.value;
    canvas.height = this.cfg.rows.value * this.cfg.cellSize.value;
  }
}