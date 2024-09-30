import { Routes } from '@angular/router';
import { GameOfLifePageComponent } from './WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page.component';
import { HomePageComponent } from './Home/Components/home-page/home-page.component';
import { LangtonsAntPageComponent } from './WebApplications/LangtonsAnt/Components/langtons-ant-page/langtons-ant-page.component';
import { ProjectDetailComponent } from './Project/Components/project-detail/project-detail.component';
import { ResumePageComponent } from './Resume/Components/resume-page/resume-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'Home', pathMatch: 'full'},
    { path: 'Home', component: HomePageComponent },
    { path: 'GameOfLife', component: GameOfLifePageComponent},
    { path: 'LangtonsAnt', component: LangtonsAntPageComponent },
    { path: 'project/:id', component: ProjectDetailComponent },
    { path: 'Resume', component: ResumePageComponent },
];
