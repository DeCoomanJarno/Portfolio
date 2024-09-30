import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Core/Components/header/header.component';
import { GameOfLifePageComponent } from './WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameOfLifePageComponent, HeaderComponent,RouterModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',  
  providers: []
})
export class AppComponent {
  title = 'Portfolio';
}
