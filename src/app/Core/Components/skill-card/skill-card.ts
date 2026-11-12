import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconModule } from '@angularlibrary/ui-lib';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ui-skill-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, NgClass, IconModule],
  templateUrl: './skill-card.html',
  styleUrls: ['./skill-card.scss']
})
export class SkillCard {
  @Input() category!: {
    Name: string;
    Icon: string;
    Skills: { Name: string; IconUrl?: string; Level?: string }[];
  };

  getSkillKey(skill: string): string {
    const parts = skill.split('.');
    return parts[parts.length - 1].toLowerCase();
  }
}
