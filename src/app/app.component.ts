import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { GameOfLifePageComponent } from "./GameOfLife/Components/game-of-life-page/game-of-life-page.component";
import { HeaderComponent } from './Core/Components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameOfLifePageComponent, HeaderComponent,RouterModule, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',  
  providers: []
})
export class AppComponent {
  title = 'Portfolio';
}
