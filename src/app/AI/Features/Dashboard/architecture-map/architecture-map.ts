import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ArchitectureNode, ArchitectureEdge } from '../../../Core/Models/architecture-node.model';

interface PositionedNode extends ArchitectureNode {
  x: number;
  y: number;
}

@Component({
  selector: 'app-architecture-map',
  imports: [CommonModule, TranslateModule],
  templateUrl: './architecture-map.html',
  styleUrl: './architecture-map.scss'
})
export class ArchitectureMap implements OnChanges {
  @Input() nodes: ArchitectureNode[] = [];
  @Input() edges: ArchitectureEdge[] = [];

  positioned: PositionedNode[] = [];
  viewWidth = 800;
  viewHeight = 260;

  private readonly nodeWidth = 130;
  private readonly nodeHeight = 56;
  private readonly rowGap = 34;
  private positionMap = new Map<string, PositionedNode>();

  ngOnChanges(): void {
    this.layout();
  }

  private columnFor(type: ArchitectureNode['type']): number {
    switch (type) {
      case 'user': return 0;
      case 'frontend': return 1;
      case 'api': return 2;
      case 'database': return 3;
      default: return 3;
    }
  }

  private layout(): void {
    const columns = new Map<number, ArchitectureNode[]>();
    for (const node of this.nodes) {
      const col = this.columnFor(node.type);
      const bucket = columns.get(col) ?? [];
      bucket.push(node);
      columns.set(col, bucket);
    }

    const colIndexes = Array.from(columns.keys());
    const colCount = Math.max(...colIndexes, 0) + 1;
    const maxRows = Math.max(...Array.from(columns.values()).map((c) => c.length), 1);

    const marginX = 90;
    const marginY = 40;
    const usableWidth = this.viewWidth - marginX * 2;
    const rowStep = this.nodeHeight + this.rowGap;

    this.viewHeight = marginY * 2 + maxRows * this.nodeHeight + Math.max(maxRows - 1, 0) * this.rowGap;

    this.positionMap.clear();
    const result: PositionedNode[] = [];

    for (const [col, bucket] of columns.entries()) {
      const x = colCount > 1 ? marginX + (usableWidth * col) / (colCount - 1) : this.viewWidth / 2;
      const columnHeight = bucket.length * this.nodeHeight + (bucket.length - 1) * this.rowGap;
      const startY = (this.viewHeight - columnHeight) / 2 + this.nodeHeight / 2;

      bucket.forEach((node, idx) => {
        const positionedNode: PositionedNode = { ...node, x, y: startY + idx * rowStep };
        this.positionMap.set(node.id, positionedNode);
        result.push(positionedNode);
      });
    }

    this.positioned = result;
  }

  edgePath(edge: ArchitectureEdge): string {
    const from = this.positionMap.get(edge.from);
    const to = this.positionMap.get(edge.to);
    if (!from || !to) return '';

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    // Exit the source box and stop short of the target box so the arrow stays visible.
    const startX = from.x + ux * (this.nodeWidth / 2 + 4);
    const startY = from.y + uy * (this.nodeHeight / 2 + 4);
    const endX = to.x - ux * (this.nodeWidth / 2 + 12);
    const endY = to.y - uy * (this.nodeHeight / 2 + 12);

    const midX = (startX + endX) / 2;
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }

  getSymbol(type: string): string {
    switch (type) {
      case 'user': return '👤';
      case 'frontend': return '💻';
      case 'api': return '⚙️';
      case 'database': return '💾';
      default: return '🌐';
    }
  }
}
