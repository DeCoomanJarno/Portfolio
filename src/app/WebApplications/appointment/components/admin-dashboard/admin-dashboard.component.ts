import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Appointment, AppointmentStatus } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  appointments: Appointment[] = [];
  displayedColumns = ['name', 'email', 'service', 'date', 'time', 'status', 'actions'];
  statusEnum = AppointmentStatus; // expose enum to template

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.appointmentService.getAppointmentsObservable().subscribe(data => this.appointments = data);
  }

  updateStatus(app: Appointment, status: AppointmentStatus) {
    this.appointmentService.updateAppointment({ ...app, status });
    this.snackBar.open(
      this.translate.instant('Appointment.Admin.StatusUpdated'),
      'Close',
      { duration: 2000 }
    );
  }

  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id);
    this.snackBar.open(
      this.translate.instant('Appointment.Admin.Deleted'),
      'Close',
      { duration: 2000 }
    );
  }
}
