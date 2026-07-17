import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Technology } from '../../../Core/Models/technology.model';

@Component({
  selector: 'app-technology-list',
  imports: [CommonModule, TranslateModule],
  templateUrl: './technology-list.html',
  styleUrl: './technology-list.scss'
})
export class TechnologyList {
  @Input() technologies: Technology[] = [];

}
