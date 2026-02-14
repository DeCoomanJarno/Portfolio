import { Routes } from '@angular/router';
import { GameOfLifePageComponent } from './WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page';
import { HomePageComponent } from './Home/Components/home-page/home-page';
import { LangtonsAntPageComponent } from './WebApplications/LangtonsAnt/Components/langtons-ant-page/langtons-ant-page';
import { ResumePageComponent } from './Resume/Components/resume-page/resume-page';
import { ProjectsPageComponent } from './Project/Components/projects-page/projects-page';
import { CalculatorPageComponent } from './WebApplications/Calculator/Components/calculator-page/calculator-page';
import { ProjectItemPageComponent } from './Project/Components/project-item-page/project-item-page';
import { FreelancePage } from './Freelance/Components/freelance-page/freelance-page';
import { Calculator } from './Freelance/Components/calculator/calculator';

export const routes: Routes = [
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
    { path: 'Home', component: FreelancePage },
    { path: 'About', component: HomePageComponent },
    { path: 'Freelance-Calculator', component: Calculator },
    { path: 'Projects', component: ProjectsPageComponent },
    { path: 'Projects/:id', component: ProjectItemPageComponent },
    { path: 'Resume', component: ResumePageComponent },
    { path: 'GameOfLife', component: GameOfLifePageComponent },
    { path: 'LangtonsAnt', component: LangtonsAntPageComponent },
    { path: 'Calculator', component: CalculatorPageComponent },
    {
        path: 'Appointments',
        loadChildren: () =>
            import('./WebApplications/appointment/appointment-module').then(m => m.AppointmentModule)
    }, 
    {
        path: 'Inventory',
        loadChildren: () =>
            import('./WebApplications/inventory/inventory-module').then(m => m.InventoryModule)
    }
];
