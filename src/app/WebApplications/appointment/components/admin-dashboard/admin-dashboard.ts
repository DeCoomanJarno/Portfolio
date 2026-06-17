import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Appointment, AppointmentStatus } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {

  appointments: Appointment[] = [];
  displayedColumns = ['name', 'email', 'service', 'date', 'time', 'status', 'actions'];
  statusEnum = AppointmentStatus;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.appointmentService.getAppointmentsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.appointments = data);
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
