import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameOfLifePageComponent } from "./GameOfLife/Components/game-of-life-page/game-of-life-page.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameOfLifePageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Portfolio';
}
