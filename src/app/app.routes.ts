import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
    {
        path: 'Home',
        loadComponent: () => import('./Freelance/Components/freelance-page/freelance-page').then(m => m.FreelancePage)
    },
    {
        path: 'About',
        loadComponent: () => import('./Home/Components/home-page/home-page').then(m => m.HomePageComponent)
    },
    {
        path: 'Freelance-Calculator',
        loadComponent: () => import('./Freelance/Components/calculator/calculator').then(m => m.Calculator)
    },
    {
        path: 'Projects',
        loadComponent: () => import('./Project/Components/projects-page/projects-page').then(m => m.ProjectsPageComponent)
    },
    {
        path: 'Projects/:id',
        loadComponent: () => import('./Project/Components/project-item-page/project-item-page').then(m => m.ProjectItemPageComponent)
    },
    {
        path: 'Resume',
        loadComponent: () => import('./Resume/Components/resume-page/resume-page').then(m => m.ResumePageComponent)
    },
    {
        path: 'GameOfLife',
        loadComponent: () => import('./WebApplications/GameOfLife/Components/game-of-life-page/game-of-life-page').then(m => m.GameOfLifePageComponent)
    },
    {
        path: 'LangtonsAnt',
        loadComponent: () => import('./WebApplications/LangtonsAnt/Components/langtons-ant-page/langtons-ant-page').then(m => m.LangtonsAntPageComponent)
    },
    {
        path: 'Calculator',
        loadComponent: () => import('./WebApplications/Calculator/Components/calculator-page/calculator-page').then(m => m.CalculatorPageComponent)
    },
    {
        path: 'Appointments',
        loadChildren: () =>
            import('./WebApplications/appointment/appointment-module').then(m => m.AppointmentModule)
    },
    {
        path: 'Inventory',
        loadChildren: () =>
            import('./WebApplications/inventory/inventory-module').then(m => m.InventoryModule)
    },
    { path: '**', redirectTo: 'Home' }
];
