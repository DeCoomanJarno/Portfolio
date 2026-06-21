import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { GameConfigComponent } from '../../../../Core/Components/game-config/game-config';
import { LoadingComponent } from '../../../../Core/Components/loading/loading';
import { ConfigAction, ConfigChange, ConfigField } from '../../../../Core/Models/simulation-config.model';
import { async, BehaviorSubject, Observable } from 'rxjs';

export interface LifeConfigModel{
  rows: ConfigField<number>;
  cols: ConfigField<number>;
  cellSize: ConfigField<number>;
  updateTime: ConfigField<number>;
  wrapEdges: ConfigField<boolean>;
}
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

  // ----------------------------
  // GRID
  // ----------------------------
  private current!: Uint8Array;
  private next!: Uint8Array;

  private isRunning$ = new BehaviorSubject<boolean>(false);
  isLoading = false;

  private animationId: number | null = null;
  private lastUpdate = 0;

  // ----------------------------
  // SINGLE SOURCE OF TRUTH
  // ----------------------------
cfg: LifeConfigModel = {
  rows: {
    value: 100,
    min: 10,
    max: 300,
    step: 1,
    type: 'slider',
    labelKey: 'life.rows.label',
    descriptionKey: 'life.rows.description'
  },

  cols: {
    value: 100,
    min: 10,
    max: 300,
    step: 1,
    type: 'slider',
    labelKey: 'life.cols.label',
    descriptionKey: 'life.cols.description'
  },

  cellSize: {
    value: 6,
    min: 2,
    max: 12,
    step: 1,
    type: 'slider',
    unit: 'px',
    labelKey: 'life.cellSize.label',
    descriptionKey: 'life.cellSize.description'
  },

  updateTime: {
    value: 10,
    min: 1,
    max: 10000,
    step: 1,
    type: 'slider',
    unit: 'ms',
    labelKey: 'life.updateTime.label',
    descriptionKey: 'life.updateTime.description'
  },

  wrapEdges: {
    value: false,
    type: 'toggle',
    labelKey: 'life.wrapEdges.label',
    descriptionKey: 'life.wrapEdges.description'
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

  // ----------------------------
  // INIT
  // ----------------------------
  ngOnInit(): void {
    this.isLoading = true;
  }

ngAfterViewInit(): void {
  this.ctx = this.canvas.nativeElement.getContext('2d')!;

  this.initGrid();    
  this.Randomize();   
  this.resizeCanvas();
  this.draw();

  this.isLoading = false;
}

  // ----------------------------
  // STATE UPDATE (ONLY PLACE CONFIG IS DERIVED)
  // ----------------------------
onConfigChanged(event: ConfigChange<LifeConfigModel>): void {

  this.cfg = event.full;

  switch (event.key) {
    case 'rows':
    case 'cols':
      this.rebuildGrid();
      break;

    case 'cellSize':
      this.resizeCanvas();
      this.draw();
      break;

    case 'updateTime':
      break;

    case 'wrapEdges':
      break;
  }
}


  // ----------------------------
  // GRID
  // ----------------------------
  private initGrid(): void {
    const size = this.cfg.rows.value * this.cfg.cols.value;
    this.current = new Uint8Array(size);
    this.next = new Uint8Array(size);
  }

  private index(r: number, c: number): number {
    return r * this.cfg.cols.value + c;
  }

  // ----------------------------
  // SIMULATION
  // ----------------------------
  private step(): void {
    for (let r = 0; r < this.cfg.rows.value; r++) {
      for (let c = 0; c < this.cfg.cols.value; c++) {

        let alive = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            let rr = r + i;
            let cc = c + j;

            if (this.cfg.wrapEdges.value) {
              rr = (rr + this.cfg.rows.value) % this.cfg.rows.value;
              cc = (cc + this.cfg.cols.value) % this.cfg.cols.value;
            } else {
              if (
                rr < 0 || rr >= this.cfg.rows.value ||
                cc < 0 || cc >= this.cfg.cols.value
              ) continue;
            }

            alive += this.current[this.index(rr, cc)];
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

    [this.current, this.next] = [this.next, this.current];
  }

  // ----------------------------
  // LOOP
  // ----------------------------
  private loop = (time: number) => {
    if (!this.isRunning$.value) return;

    if (time - this.lastUpdate > this.cfg.updateTime.value) {
      this.step();
      this.draw();
      this.lastUpdate = time;
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

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // ----------------------------
  // DRAW
  // ----------------------------
  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  private draw(): void {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = this.getCssVar('--color-primary');

    for (let r = 0; r < this.cfg.rows.value; r++) {
      for (let c = 0; c < this.cfg.cols.value; c++) {

        const idx = this.index(r, c);

        if (this.current[idx] === 1) {
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

  // ----------------------------
  // ACTIONS
  // ----------------------------
  Clear(): void {
    this.Deactivate();
    this.initGrid();
    this.draw();
  }

  Randomize(): void {
    const size = this.cfg.rows.value * this.cfg.cols.value;

    for (let i = 0; i < size; i++) {
      this.current[i] = Math.random() > 0.5 ? 1 : 0;
    }

    this.draw();
  }

  onCanvasClick(event: MouseEvent): void {
    const rect = this.canvas.nativeElement.getBoundingClientRect();

    const col = Math.floor((event.clientX - rect.left) / this.cfg.cellSize.value);
    const row = Math.floor((event.clientY - rect.top) / this.cfg.cellSize.value);

    if (
      row < 0 || row >= this.cfg.rows.value ||
      col < 0 || col >= this.cfg.cols.value
    ) return;

    const idx = this.index(row, col);
    this.current[idx] ^= 1;

    this.draw();
  }

  // ----------------------------
  // REBUILD
  // ----------------------------
  private rebuildGrid(): void {
    this.Deactivate();
    this.initGrid();
    this.Randomize();
    this.resizeCanvas();
    this.draw();
  }

  private resizeCanvas(): void {
    const canvas = this.canvas.nativeElement;

    canvas.width = this.cfg.cols.value * this.cfg.cellSize.value;
    canvas.height = this.cfg.rows.value * this.cfg.cellSize.value;
  }
}