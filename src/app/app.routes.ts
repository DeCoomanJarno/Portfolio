import { Routes } from '@angular/router';
import { GameOfLifePageComponent } from './WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page.component';
import { HomePageComponent } from './Home/Components/home-page/home-page.component';
import { LangtonsAntPageComponent } from './WebApplications/LangtonsAnt/Components/langtons-ant-page/langtons-ant-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'GameOfLife', pathMatch: 'full'},
    { path: 'Home', component: HomePageComponent },
    { path: 'Services', component: HomePageComponent },
    { path: 'GameOfLife', component: GameOfLifePageComponent},
    { path: 'LangtonsAnt', component: LangtonsAntPageComponent },
];
