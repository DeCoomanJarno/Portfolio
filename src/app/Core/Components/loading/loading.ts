import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-loading',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
    templateUrl: './loading.html',
    styleUrls: ['./loading.scss']
})
export class LoadingComponent {
  @Input() isLoading = false

}
