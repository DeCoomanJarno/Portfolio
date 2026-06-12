import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { XPDesktopApp } from '../../../../../Core/Services/premium-3d-animation.service';

export function buildProcessXPApp(translate: TranslateService): XPDesktopApp {
  const steps = [1, 2, 3].map((step) => ({
    title: translate.instant(`freelance.process.step${step}.title`) || '',
    description: translate.instant(`freelance.process.step${step}.desc`) || ''
  }));

  return {
    id: 'process',
    iconLabel: translate.instant('freelance.hero.apps.process') || 'Process',
    title: translate.instant('freelance.hero.apps.process') || 'Process',
    renderContent: (ctx, bodyRect, helpers) => {
      let y = bodyRect.y;
      ctx.fillStyle = '#173467';
      ctx.font = 'bold 18px Tahoma, Arial, sans-serif';
      ctx.fillText(translate.instant('freelance.hero.apps.process') || 'Process', bodyRect.x, y + 18);
      y += 34;

      steps.forEach((step, index) => {
        if (y > bodyRect.y + bodyRect.height - 30) return;

        ctx.fillStyle = '#1a3d78';
        ctx.font = 'bold 15px Tahoma, Arial, sans-serif';
        ctx.fillText(`0${index + 1}  ${step.title}`, bodyRect.x, y + 16);

        ctx.fillStyle = '#3f5682';
        ctx.font = '13px Tahoma, Arial, sans-serif';
        const lines = helpers.wrapText(ctx, step.description, bodyRect.width - 8).slice(0, 2);
        lines.forEach((line, lineIndex) => ctx.fillText(line, bodyRect.x + 16, y + 34 + lineIndex * 14));

        y += 62;
      });
    }
  };
}

@Component({
  selector: 'app-xp-app-process',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './xp-app-process.html',
  styleUrls: ['./xp-app-process.scss']
})
export class XpAppProcessComponent {}
