import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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

  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private destroyRef: DestroyRef,
    private host: ElementRef<HTMLElement>
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.hasMultipleImages = !!this.project.images && this.project.images.length > 1;

    if (this.isBrowser && this.hasMultipleImages) {
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

  /** Track the pointer to drive the spotlight glow and subtle 3D tilt. */
  onPointerMove(event: PointerEvent): void {
    if (!this.isBrowser) {
      return;
    }
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(2)}%`);
    el.style.setProperty('--tilt-x', `${((0.5 - y) * 5).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${((x - 0.5) * 5).toFixed(2)}deg`);
  }

  onPointerLeave(): void {
    if (!this.isBrowser) {
      return;
    }
    const el = this.host.nativeElement;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }
}
