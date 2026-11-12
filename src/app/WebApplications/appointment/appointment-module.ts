import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from './components/header/header';
import { AppointmentPageComponent } from './components/appointment-page/appointment-page';
import { AuthService } from '@angularlibrary/core-lib';


@NgModule({
 declarations: [
    BookingFormComponent,
    AdminDashboardComponent,
    AppointmentCalendarComponent,
    HeaderComponent,
    AppointmentPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppointmentRoutingModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatSnackBarModule,
    TranslatePipe,
    MatRadioModule,
    MatMenuModule
  ]
})
export class AppointmentModule {
  constructor(auth: AuthService) {
    let users = auth.getDemoCredentials();
    users.find(t => t.username.includes('admin'))?.roles.push(
      {
        name: 'appointments:admin',
        permissions: ['appointments:create', 'appointments:cancel', 'appointments:approve', 'appointments:decline']
      }
    )
    users.forEach(user => {
      auth.register(user)
    });
  }
}
