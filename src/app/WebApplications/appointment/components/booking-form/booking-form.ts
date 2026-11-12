import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment, AppointmentStatus } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, User } from '@angularlibrary/core-lib';

@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.scss'
})
export class BookingFormComponent implements OnInit {
  private static readonly viewerEmailKey = 'appointment.viewerEmail';

  bookingForm: FormGroup;
  user: User | null = null;
  userAppointments: Appointment[] = [];
  private viewerEmail = '';
  readonly minDate = new Date();
  readonly statusEnum = AppointmentStatus;
  readonly services = ['Consultation', 'Installation', 'Maintenance', 'Support'];
  readonly times = this.buildTimeSlots('09:00', '17:30', 30);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      fullname: [''],
      email: ['', [Validators.required, Validators.email]],
      service: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.viewerEmail = this.resolveViewerEmail();

    if (this.user) {
      // Prefill user info
      this.bookingForm.patchValue({
        name: this.user.username,
        fullname: this.user.fullname,
        email: this.user.email
      });
    }

    this.appointmentService.getAppointmentsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadUserAppointments());
  }

  submit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookingForm.getRawValue();
    const normalizedDate = this.toIsoDate(formValue.date);
    const normalizedTime = String(formValue.time || '').trim();

    if (!normalizedDate || !normalizedTime) {
      this.showMessage('Appointment.BookAppointment.InvalidDate', 'Please select a valid date and time.');
      return;
    }

    const selectedDateTime = new Date(`${normalizedDate}T${normalizedTime}:00`);
    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime.getTime() < Date.now()) {
      this.showMessage('Appointment.BookAppointment.PastTime', 'Please pick a future date and time.');
      return;
    }

    if (this.appointmentService.hasSlotConflict(normalizedDate, normalizedTime)) {
      this.showMessage('Appointment.BookAppointment.SlotTaken', 'This time slot is already booked. Please choose another one.');
      return;
    }

    const newAppointment: Appointment = {
      id: this.appointmentService.getNextId(),
      name: String(formValue.name || '').trim(),
      email: String(formValue.email || '').trim(),
      service: formValue.service,
      date: normalizedDate,
      time: normalizedTime,
      status: AppointmentStatus.Pending
    };

    const added = this.appointmentService.addAppointment(newAppointment);
    if (!added) {
      this.showMessage('Appointment.BookAppointment.SlotTaken', 'This time slot is already booked. Please choose another one.');
      return;
    }

    this.viewerEmail = String(newAppointment.email || '').trim().toLowerCase();
    if (this.viewerEmail) sessionStorage.setItem(BookingFormComponent.viewerEmailKey, this.viewerEmail);

    this.showMessage('Appointment.BookAppointment.Success', 'Appointment booked successfully.');

    this.bookingForm.patchValue({ service: '', date: null, time: '' });
    this.bookingForm.markAsPristine();
  }

  cancelAppointment(app: Appointment): void {
    if (app.status === AppointmentStatus.Pending) {
      const changed = this.appointmentService.clientCancelPending(app.id);
      if (!changed) {
        this.showMessage('Appointment.BookAppointment.NotAllowed', 'This reservation can no longer be changed from your side.');
        return;
      }
      this.showMessage('Appointment.BookAppointment.Cancelled', 'Appointment cancelled.');
      return;
    }

    if (app.status !== AppointmentStatus.Confirmed) {
      this.showMessage('Appointment.BookAppointment.NotAllowed', 'This reservation can no longer be changed from your side.');
      return;
    }

    const changed = this.appointmentService.clientRequestCancellation(app.id);
    if (!changed) {
      this.showMessage('Appointment.BookAppointment.NotAllowed', 'This reservation can no longer be changed from your side.');
      return;
    }

    this.showMessage('Appointment.BookAppointment.CancelRequested', 'Cancellation request sent.');
  }

  loadUserAppointments(): void {
    const allAppointments = this.appointmentService.getAppointmentsSnapshot();
    const userEmail = String(this.user?.email || '').trim().toLowerCase();
    const viewerEmail = userEmail || this.viewerEmail;

    if (!viewerEmail) {
      this.userAppointments = [];
      return;
    }

    this.userAppointments = allAppointments
      .filter((a) => String(a.email || '').trim().toLowerCase() === viewerEmail)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  getServiceLabel(service: string): string {
    return this.translate.instant(`Appointment.Services.${service}`);
  }

  getStatusLabel(status: AppointmentStatus): string {
    const key = `Appointment.BookAppointment.${status}`;
    const translated = this.translate.instant(key);
    return translated === key ? status : translated;
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Confirmed:
        return 'is-confirmed';
      case AppointmentStatus.Done:
        return 'is-done';
      case AppointmentStatus.Cancel:
        return 'is-canceled';
      case AppointmentStatus.CancelRequest:
        return 'is-requested';
      default:
        return 'is-pending';
    }
  }

  private showMessage(key: string, fallback: string): void {
    const translated = this.translate.instant(key);
    this.snackBar.open(translated === key ? fallback : translated, 'Close', { duration: 3000 });
  }

  private toIsoDate(value: Date | string | null): string {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildTimeSlots(start: string, end: string, stepMinutes: number): string[] {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const slots: string[] = [];

    for (let minutes = startTotal; minutes <= endTotal; minutes += stepMinutes) {
      const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
      const minute = String(minutes % 60).padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }

    return slots;
  }

  private resolveViewerEmail(): string {
    const userEmail = String(this.user?.email || '').trim().toLowerCase();
    if (userEmail) return userEmail;
    return String(sessionStorage.getItem(BookingFormComponent.viewerEmailKey) || '').trim().toLowerCase();
  }
}
