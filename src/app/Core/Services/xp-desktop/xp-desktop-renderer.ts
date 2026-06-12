import * as THREE from 'three';

export interface XPDesktopBodyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface XPDesktopRenderHelpers {
  wrapText: (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => string[];
}

export type XPDesktopAppRenderer = (
  ctx: CanvasRenderingContext2D,
  bodyRect: XPDesktopBodyRect,
  helpers: XPDesktopRenderHelpers
) => void;

export interface XPDesktopAppLike {
  id: string;
  iconLabel: string;
  title: string;
  renderContent: XPDesktopAppRenderer;
}

export interface XPScreenContent {
  title: string;
  status: string;
  apps: string[];
  commandLines: string[];
  locale: string;
}

export interface XPDesktopStateLike {
  xpApps: XPDesktopAppLike[];
  xpOpenAppId: string | null;
}

export class XPDesktopRenderer {
  static paint(
    screenMaterial: THREE.MeshStandardMaterial,
    content: XPScreenContent,
    cursorVisible: boolean,
    state?: XPDesktopStateLike
  ): void {
    const canvas = (screenMaterial as any).screenCanvas as HTMLCanvasElement;
    const ctx = (screenMaterial as any).screenCtx as CanvasRenderingContext2D;
    const texture = (screenMaterial as any).screenTexture as THREE.CanvasTexture;

    if (!ctx || !canvas || !texture) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originalTextureData = (screenMaterial as any).originalTextureData as ImageData;
    if (originalTextureData) {
      ctx.putImageData(originalTextureData, 0, 0);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const xMin = 111, xMax = 1989, yMin = 93, yMax = 2633;
    const screenWidth = xMax - xMin;
    const screenHeight = yMax - yMin;

    ctx.save();
    ctx.beginPath();
    ctx.rect(xMin, yMin, screenWidth, screenHeight);
    ctx.clip();

    ctx.translate(xMin, yMin);
    ctx.rotate(Math.PI / 2);
    ctx.translate(0, -screenWidth);
    ctx.scale(-1, 1);
    ctx.translate(-screenHeight, 0);

    const viewW = screenHeight;
    const viewH = screenWidth;

    this.paintWallpaper(ctx, viewW, viewH);
    this.paintDesktopIcons(ctx, state?.xpApps ?? [], content.apps);

    const openApp = state?.xpOpenAppId
      ? (state?.xpApps ?? []).find(a => a.id === state.xpOpenAppId) ?? null
      : null;

    if (openApp) {
      this.paintWindow(ctx, viewW, viewH, openApp);
    } else {
      this.paintTerminal(ctx, viewW, viewH, content, cursorVisible);
    }

    this.paintTaskbar(ctx, viewW, viewH, content);

    ctx.restore();
    texture.needsUpdate = true;
    screenMaterial.needsUpdate = true;
  }

  private static paintWallpaper(ctx: CanvasRenderingContext2D, viewW: number, viewH: number): void {
    const wallpaper = ctx.createLinearGradient(0, 0, viewW, viewH);
    wallpaper.addColorStop(0, '#2559c8');
    wallpaper.addColorStop(0.5, '#3f79dc');
    wallpaper.addColorStop(1, '#2f62c9');
    ctx.fillStyle = wallpaper;
    ctx.fillRect(0, 0, viewW, viewH);

    const hill = ctx.createRadialGradient(viewW * 0.2, viewH * 0.8, viewW * 0.05, viewW * 0.2, viewH * 0.8, viewW * 0.7);
    hill.addColorStop(0, '#66b85a');
    hill.addColorStop(1, '#2f7a38');
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.ellipse(viewW * 0.35, viewH * 1.05, viewW * 0.55, viewH * 0.35, 0, Math.PI, 0, true);
    ctx.fill();
  }

  private static paintDesktopIcons(ctx: CanvasRenderingContext2D, apps: XPDesktopAppLike[], fallbackLabels: string[]): void {
    const iconLabels = apps.length ? apps.map(a => a.iconLabel) : fallbackLabels.slice(0, 4);

    iconLabels.forEach((name, idx) => {
      const y = 60 + idx * 130;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(22, y - 6, 58, 58);
      ctx.fillStyle = '#e8f0ff';
      ctx.fillRect(26, y - 2, 50, 50);
      ctx.fillStyle = '#1348b2';
      ctx.font = 'bold 24px Tahoma, Arial, sans-serif';
      ctx.fillText(String(idx + 1), 40, y + 30);

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 20px Tahoma, Arial, sans-serif';
      ctx.fillText(name, 92, y + 34);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, 90, y + 32);
    });
  }

  private static paintTerminal(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    content: XPScreenContent,
    cursorVisible: boolean
  ): void {
    const winX = Math.round(viewW * 0.12);
    const winY = 40;
    const winW = Math.round(viewW * 0.82);
    const winH = Math.round(viewH * 0.78);

    ctx.fillStyle = '#f1f4fc';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = '#7f9dbf';
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);

    const titleGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY);
    titleGrad.addColorStop(0, '#0a2c8e');
    titleGrad.addColorStop(0.5, '#2f62c8');
    titleGrad.addColorStop(1, '#78a2ea');
    ctx.fillStyle = titleGrad;
    ctx.fillRect(winX + 1, winY + 1, winW - 2, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Tahoma, Arial, sans-serif';
    ctx.fillText(content.title, winX + 16, winY + 29);

    const terminalX = winX + 18;
    const terminalY = winY + 58;
    const terminalW = winW - 36;
    const terminalH = winH - 80;
    ctx.fillStyle = '#0f1825';
    ctx.fillRect(terminalX, terminalY, terminalW, terminalH);
    ctx.strokeStyle = '#4e6a97';
    ctx.strokeRect(terminalX, terminalY, terminalW, terminalH);

    ctx.fillStyle = '#9dd0ff';
    ctx.font = 'bold 17px Consolas, "Courier New", monospace';
    const lines = content.commandLines.slice(0, 7);
    lines.forEach((line, idx) => {
      const displayLine = idx === lines.length - 1 && cursorVisible ? `${line} _` : line;
      ctx.fillText(displayLine, terminalX + 14, terminalY + 26 + idx * 28);
    });
  }

  private static paintWindow(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    app: XPDesktopAppLike
  ): void {
    const winX = Math.round(viewW * 0.12);
    const winY = 40;
    const winW = Math.round(viewW * 0.82);
    const winH = Math.round(viewH * 0.78);

    ctx.fillStyle = '#f1f4fc';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = '#7f9dbf';
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);

    const titleGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY);
    titleGrad.addColorStop(0, '#0a2c8e');
    titleGrad.addColorStop(0.5, '#2f62c8');
    titleGrad.addColorStop(1, '#78a2ea');
    ctx.fillStyle = titleGrad;
    ctx.fillRect(winX + 1, winY + 1, winW - 2, 44);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Tahoma, Arial, sans-serif';
    ctx.fillText(app.title, winX + 16, winY + 29);

    const closeX = winX + winW - 60;
    const closeY = winY + 4;
    const closeSize = 36;
    ctx.fillStyle = '#d04040';
    ctx.fillRect(closeX, closeY, closeSize, closeSize);
    ctx.strokeStyle = '#8a1a1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeX, closeY, closeSize, closeSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Tahoma, Arial, sans-serif';
    ctx.fillText('X', closeX + 10, closeY + 26);

    const bodyX = winX + 18;
    const bodyY = winY + 58;
    const bodyW = winW - 36;
    const bodyH = winH - 80;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
    ctx.strokeStyle = '#b8c7de';
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    app.renderContent(
      ctx,
      {
        x: bodyX + 14,
        y: bodyY + 14,
        width: bodyW - 28,
        height: bodyH - 28
      },
      {
        wrapText: (drawCtx, text, maxWidth) => this.wrapText(drawCtx, text, maxWidth)
      }
    );
  }

  private static paintTaskbar(ctx: CanvasRenderingContext2D, viewW: number, viewH: number, content: XPScreenContent): void {
    const taskbarH = 46;
    ctx.fillStyle = '#1f4fa6';
    ctx.fillRect(0, viewH - taskbarH, viewW, taskbarH);

    const startGrad = ctx.createLinearGradient(0, viewH - taskbarH, 140, viewH);
    startGrad.addColorStop(0, '#53b648');
    startGrad.addColorStop(1, '#2f8c2f');
    ctx.fillStyle = startGrad;
    ctx.fillRect(0, viewH - taskbarH, 148, taskbarH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Tahoma, Arial, sans-serif';
    ctx.fillText('Start', 44, viewH - 14);

    ctx.fillStyle = '#dce9ff';
    ctx.font = 'bold 18px Tahoma, Arial, sans-serif';
    const nowLabel = new Intl.DateTimeFormat(content.locale, { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const statusText = `${content.status} | ${nowLabel}`;
    ctx.fillText(statusText, viewW - ctx.measureText(statusText).width - 18, viewH - 14);
  }

  private static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const { width } = ctx.measureText(testLine);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
