import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { ProjectPreviewModel } from '../../Models/project-model';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { IconPipe } from '../../../Core/Pipes/icon.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ui-project-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconPipe, MatTooltipModule, TranslatePipe],
  templateUrl: './project-item.html',
  styleUrls: ['./project-item.scss']
})
export class ProjectItemComponent implements OnInit {
  @Input() project!: ProjectPreviewModel;
  hasMultipleImages = false;
  currentImageIndex = signal(0);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.hasMultipleImages = !!this.project.images && this.project.images.length > 1;

    if (isPlatformBrowser(this.platformId) && this.hasMultipleImages) {
      const intervalId = setInterval(() => {
        this.currentImageIndex.update(
          index => (index + 1) % (this.project.images?.length || 1)
        );
      }, 4000);
      this.destroyRef.onDestroy(() => clearInterval(intervalId));
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex.set(index);
  }
}
