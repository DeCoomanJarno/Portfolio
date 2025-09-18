import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment, AppointmentStatus } from '../Models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private storageKey = 'appointments';
private appointments$: BehaviorSubject<Appointment[]>;

  constructor() {
    const stored = sessionStorage.getItem(this.storageKey);
    this.appointments$ = new BehaviorSubject<Appointment[]>(
      stored ? JSON.parse(stored) : []
    );
  }

  addAppointment(app: Appointment) {
    const current = this.appointments$.getValue();
    current.push(app);
    sessionStorage.setItem(this.storageKey, JSON.stringify(current));
    this.appointments$.next(current);
  }

  getAppointmentsSnapshot(): Appointment[] {
    const stored = sessionStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  getAppointmentsObservable() {
    return this.appointments$.asObservable();
  }

  updateAppointment(updated: Appointment): void {
    const current = this.appointments$.value;
    const newAppointments = current.map(app => app.id === updated.id ? updated : app);
    this.save(newAppointments);
  }

  updateAppointmentStatus(updated: Appointment, status: AppointmentStatus): void {
    updated.status = status;
    const current = this.appointments$.value;
    const newAppointments = current.map(app => app.id === updated.id ? updated : app);
    this.save(newAppointments);
  }

  deleteAppointment(id: number): void {
    const current = this.appointments$.value;
    const newAppointments = current.filter(app => app.id !== id);
    this.save(newAppointments);
  }

  private save(appointments: Appointment[]): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(appointments));
    this.appointments$.next(appointments);
  }

  getNextId(): number {
    const current = this.appointments$.value;
    return current.length ? Math.max(...current.map(a => a.id)) + 1 : 1;
  }
}
