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
  displayedColumns = ['customer', 'service', 'schedule', 'status', 'manage'];
  selectedStatus = 'All';
  readonly statusFilters: Array<'All' | AppointmentStatus> = [
    'All',
    AppointmentStatus.Pending,
    AppointmentStatus.Confirmed,
    AppointmentStatus.Done,
    AppointmentStatus.CancelRequest,
    AppointmentStatus.Cancel,
  ];
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
      .subscribe((data) => {
        this.appointments = [...data].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      });
  }

  get filteredAppointments(): Appointment[] {
    if (this.selectedStatus === 'All') return this.appointments;
    return this.appointments.filter((app) => app.status === this.selectedStatus);
  }

  approvePending(app: Appointment): void {
    const changed = this.appointmentService.adminApprovePending(app.id);
    if (!changed) {
      this.notify('Appointment.Admin.InvalidTransition', 'Status change not allowed for this reservation.');
      return;
    }
    this.notify('Appointment.Admin.StatusUpdated', 'Status updated.');
  }

  declinePending(app: Appointment): void {
    const changed = this.appointmentService.adminDeclinePending(app.id);
    if (!changed) {
      this.notify('Appointment.Admin.InvalidTransition', 'Status change not allowed for this reservation.');
      return;
    }
    this.notify('Appointment.Admin.StatusUpdated', 'Status updated.');
  }

  approveCancellation(app: Appointment): void {
    const changed = this.appointmentService.adminApproveCancellation(app.id);
    if (!changed) {
      this.notify('Appointment.Admin.InvalidTransition', 'Status change not allowed for this reservation.');
      return;
    }
    this.notify('Appointment.Admin.StatusUpdated', 'Status updated.');
  }

  denyCancellation(app: Appointment): void {
    const changed = this.appointmentService.adminDenyCancellation(app.id);
    if (!changed) {
      this.notify('Appointment.Admin.InvalidTransition', 'Status change not allowed for this reservation.');
      return;
    }
    this.notify('Appointment.Admin.StatusUpdated', 'Status updated.');
  }

  markDone(app: Appointment): void {
    if (app.status !== AppointmentStatus.Confirmed) {
      this.notify('Appointment.Admin.InvalidTransition', 'Status change not allowed for this reservation.');
      return;
    }
    this.appointmentService.updateAppointmentStatus(app, AppointmentStatus.Done);
    this.notify('Appointment.Admin.StatusUpdated', 'Status updated.');
  }

  canApprovePending(app: Appointment): boolean {
    return app.status === AppointmentStatus.Pending;
  }

  canDeclinePending(app: Appointment): boolean {
    return app.status === AppointmentStatus.Pending;
  }

  canApproveCancellation(app: Appointment): boolean {
    return app.status === AppointmentStatus.CancelRequest;
  }

  canDenyCancellation(app: Appointment): boolean {
    return app.status === AppointmentStatus.CancelRequest;
  }

  canMarkDone(app: Appointment): boolean {
    return app.status === AppointmentStatus.Confirmed;
  }

  isClosed(app: Appointment): boolean {
    return app.status === AppointmentStatus.Cancel || app.status === AppointmentStatus.Done;
  }

  canDelete(app: Appointment): boolean {
    return this.isClosed(app);
  }

  getActionsLabel(app: Appointment): string {
    if (this.canApprovePending(app)) return 'Review pending reservation';
    if (this.canApproveCancellation(app)) return 'Review cancellation request';
    if (this.canMarkDone(app)) return 'Mark appointment as done';
    return 'No action required';
  }

  private notify(key: string, fallback: string): void {
    const translated = this.translate.instant(key);
    this.snackBar.open(
      translated === key ? fallback : translated,
      'Close',
      { duration: 2000 }
    );
  }

  deleteAppointment(id: number): void {
    this.appointmentService.deleteAppointment(id);
    this.snackBar.open(
      this.translate.instant('Appointment.Admin.Deleted'),
      'Close',
      { duration: 2000 }
    );
  }

  statusLabel(status: AppointmentStatus): string {
    const bookingKey = `Appointment.BookAppointment.${status}`;
    const translatedBooking = this.translate.instant(bookingKey);
    if (translatedBooking !== bookingKey) return translatedBooking;
    return status;
  }

  statusClass(status: AppointmentStatus): string {
    return `status-${status.toLowerCase()}`;
  }
}
