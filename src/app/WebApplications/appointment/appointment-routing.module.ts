import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar';
import { AppointmentPageComponent } from './components/appointment-page/appointment-page';
import { Login } from 'JarnoLib';

const routes: Routes = [
  {
    path: '',
    component: AppointmentPageComponent,
    children: [
      { path: '', redirectTo: 'book', pathMatch: 'full' },
      { path: 'book', component: BookingFormComponent },
      { path: 'login', component: Login },
      { path: 'admin/dashboard', component: AdminDashboardComponent },
      { path: 'admin/calendar', component: AppointmentCalendarComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
