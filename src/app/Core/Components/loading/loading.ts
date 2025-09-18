import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading',
    imports: [],
    templateUrl: './loading.html',
    styleUrl: './loading.css'
})
export class LoadingComponent {
  @Input() isLoading = false

}
