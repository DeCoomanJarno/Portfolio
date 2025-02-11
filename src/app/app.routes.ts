import { Routes } from '@angular/router';
import { GameOfLifePageComponent } from './WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page.component';
import { HomePageComponent } from './Home/Components/home-page/home-page.component';
import { LangtonsAntPageComponent } from './WebApplications/LangtonsAnt/Components/langtons-ant-page/langtons-ant-page.component';
import { ResumePageComponent } from './Resume/Components/resume-page/resume-page.component';
import { ProjectsPageComponent } from './Project/Components/projects-page/projects-page.component';
import { CalculatorPageComponent } from './WebApplications/Calculator/Components/calculator-page/calculator-page.component';
import { ProjectItemPageComponent } from './Project/Components/project-item-page/project-item-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
    { path: 'Home', component: HomePageComponent },
    { path: 'Projects', component: ProjectsPageComponent},
    { path: 'projects/0', component: ProjectsPageComponent },
    { path: 'projects/:id', component: ProjectItemPageComponent },
    { path: 'Resume', component: ResumePageComponent },
    { path: 'GameOfLife', component: GameOfLifePageComponent },
    { path: 'LangtonsAnt', component: LangtonsAntPageComponent },
    { path: 'Calculator', component: CalculatorPageComponent },
];
