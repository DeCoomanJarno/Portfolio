import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Appointment } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-calendar',
  standalone: false,
  templateUrl: './appointment-calendar.html',
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  groupedAppointments: Record<string, Appointment[]> = {};

  private readonly destroyRef = inject(DestroyRef);

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getAppointmentsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
      this.appointments = data.sort((a, b) => a.date.localeCompare(b.date));
      this.groupedAppointments = this.groupByDate();
    });
  }

  private groupByDate(): Record<string, Appointment[]> {
    return this.appointments.reduce((acc, curr) => {
      (acc[curr.date] = acc[curr.date] || []).push(curr);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }

  getDates(): string[] {
    return Object.keys(this.groupedAppointments);
  }
}
