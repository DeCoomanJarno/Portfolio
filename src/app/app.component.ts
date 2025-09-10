import { Component } from '@angular/core';

import {  RouterModule } from '@angular/router';
import { HeaderComponent } from './Core/Components/header/header.component';
import { FooterComponent } from './Core/Components/Footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [HeaderComponent, RouterModule, FooterComponent],
    styleUrls: ['./app.component.css'],
    providers: []
})
export class AppComponent {

}
