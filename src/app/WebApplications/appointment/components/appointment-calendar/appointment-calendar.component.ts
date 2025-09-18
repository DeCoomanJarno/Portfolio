import { Component, OnInit } from '@angular/core';
import { Appointment } from '../../Models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-calendar',
  standalone: false,
  templateUrl: './appointment-calendar.component.html',
  styleUrl: './appointment-calendar.component.css'
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  groupedAppointments: Record<string, Appointment[]> = {};

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getAppointmentsObservable().subscribe(data => {
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
