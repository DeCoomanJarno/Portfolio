import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { Appointment, AppointmentStatus } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-calendar',
  standalone: false,
  templateUrl: './appointment-calendar.html',
  styleUrl: './appointment-calendar.scss'
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  groupedAppointments: Record<string, Appointment[]> = {};

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private appointmentService: AppointmentService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.appointmentService.getAppointmentsObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
      this.appointments = [...data].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      this.groupedAppointments = this.groupByDate();
    });
  }

  private groupByDate(): Record<string, Appointment[]> {
    return this.appointments.reduce((acc, curr) => {
      (acc[curr.date] = acc[curr.date] || []).push(curr);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }

  getDateEntries(): Array<{ date: string; items: Appointment[] }> {
    return Object.keys(this.groupedAppointments)
      .sort((a, b) => a.localeCompare(b))
      .map((date) => ({
        date,
        items: [...this.groupedAppointments[date]].sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }

  statusLabel(status: AppointmentStatus): string {
    const key = `Appointment.BookAppointment.${status}`;
    const translated = this.translate.instant(key);
    return translated === key ? status : translated;
  }

  statusClass(status: AppointmentStatus): string {
    return `status-${status.toLowerCase()}`;
  }
}
