import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment, AppointmentStatus } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../Models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent {

  bookingForm: FormGroup;
  user: User | null = null;
  userAppointments: Appointment[] = [];
  services = ['Consultation', 'Installation', 'Maintenance', 'Support']; // example services

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

    if (this.user?.role === 'client') {
      // pre-fill client info
      this.bookingForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        fullname: this.user.fullname
      });
      this.loadUserAppointments();
    }
  }

  submit() {
    const formValue = this.bookingForm.getRawValue();

    const newAppointment: Appointment = {
      id: Date.now(),
      name: formValue.name,
      email: formValue.email,
      service: formValue.service,
      date: formValue.date,
      time: formValue.time,
      status:  AppointmentStatus.Pending
    };

    this.appointmentService.addAppointment(newAppointment);

    this.snackBar.open(
      this.translate.instant('Appointment.BookAppointment.Success'),
      'Close',
      { duration: 3000 }
    );

    this.bookingForm.patchValue({ service: '', date: '', time: '' });
    // reload appointments
    this.loadUserAppointments();
  }

  private loadUserAppointments() {
    const allAppointments = this.appointmentService.getAppointmentsSnapshot();
    if (this.user) {
      this.userAppointments = allAppointments.filter(a => a.email === this.user!.email);
    }
  }
  cancelAppointment(app: Appointment) {
  if (app.status === AppointmentStatus.Pending) {
    this.appointmentService.deleteAppointment(app.id);
    this.snackBar.open(
      this.translate.instant('Appointment.BookAppointment.Cancelled'),
      'Close',
      { duration: 3000 }
    );
  } else {
    // status is confirmed or other → request cancellation
    this.appointmentService.updateAppointmentStatus(app, AppointmentStatus.CancelRequest);
    this.snackBar.open(
      this.translate.instant('Appointment.BookAppointment.CancelRequested'),
      'Close',
      { duration: 3000 }
    );
  }
  this.loadUserAppointments();
}
}
