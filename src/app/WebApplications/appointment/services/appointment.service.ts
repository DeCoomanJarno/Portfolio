import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment, AppointmentStatus } from '../Models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly storageKey = 'appointments';
  private readonly appointments$: BehaviorSubject<Appointment[]>;

  constructor() {
    const stored = sessionStorage.getItem(this.storageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const hydrated = this.hydrateAppointments(parsed);
    this.appointments$ = new BehaviorSubject<Appointment[]>(hydrated);
    this.save(hydrated);
  }

  addAppointment(app: Appointment): boolean {
    const current = this.appointments$.getValue();
    const normalized: Appointment = {
      ...app,
      id: app.id || this.getNextId(),
      date: this.normalizeDate(app.date),
      time: this.normalizeTime(app.time),
      status: app.status || AppointmentStatus.Pending,
    };

    if (this.hasSlotConflict(normalized.date, normalized.time)) {
      return false;
    }

    const next = this.sortAppointments([...current, normalized]);
    this.save(next);
    return true;
  }

  getAppointmentsSnapshot(): Appointment[] {
    return [...this.appointments$.value];
  }

  getAppointmentsObservable(): Observable<Appointment[]> {
    return this.appointments$.asObservable();
  }

  getAppointmentsByEmail(email: string): Appointment[] {
    return this.appointments$.value.filter((app) => app.email === email);
  }

  updateAppointment(updated: Appointment): boolean {
    const current = this.appointments$.value;
    const normalized: Appointment = {
      ...updated,
      date: this.normalizeDate(updated.date),
      time: this.normalizeTime(updated.time),
    };

    if (this.hasSlotConflict(normalized.date, normalized.time, normalized.id)) {
      return false;
    }

    const newAppointments = current.map((app) => (app.id === normalized.id ? normalized : app));
    this.save(this.sortAppointments(newAppointments));
    return true;
  }

  updateAppointmentStatus(updated: Appointment, status: AppointmentStatus): void {
    this.updateAppointment({ ...updated, status });
  }

  clientCancelPending(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.Pending, AppointmentStatus.Cancel);
  }

  clientRequestCancellation(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.Confirmed, AppointmentStatus.CancelRequest);
  }

  adminApprovePending(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.Pending, AppointmentStatus.Confirmed);
  }

  adminDeclinePending(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.Pending, AppointmentStatus.Cancel);
  }

  adminApproveCancellation(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.CancelRequest, AppointmentStatus.Cancel);
  }

  adminDenyCancellation(appointmentId: number): boolean {
    return this.transitionStatus(appointmentId, AppointmentStatus.CancelRequest, AppointmentStatus.Confirmed);
  }

  deleteAppointment(id: number): void {
    const current = this.appointments$.value;
    const newAppointments = current.filter((app) => app.id !== id);
    this.save(newAppointments);
  }

  hasSlotConflict(date: string, time: string, excludeId?: number): boolean {
    return this.appointments$.value.some((app) => {
      const sameDate = app.date === date;
      const sameTime = app.time === time;
      const sameEntry = excludeId !== undefined && app.id === excludeId;
      const canceled = app.status === AppointmentStatus.Cancel;
      return sameDate && sameTime && !sameEntry && !canceled;
    });
  }

  private save(appointments: Appointment[]): void {
    const sorted = this.sortAppointments(appointments);
    sessionStorage.setItem(this.storageKey, JSON.stringify(sorted));
    this.appointments$.next(sorted);
  }

  private transitionStatus(id: number, from: AppointmentStatus, to: AppointmentStatus): boolean {
    const current = this.appointments$.value;
    const target = current.find((app) => app.id === id);
    if (!target || target.status !== from) return false;

    const next = current.map((app) => (app.id === id ? { ...app, status: to } : app));
    this.save(next);
    return true;
  }

  getNextId(): number {
    const current = this.appointments$.value;
    return current.length ? Math.max(...current.map((a) => a.id || 0)) + 1 : 1;
  }

  private hydrateAppointments(source: unknown): Appointment[] {
    if (!Array.isArray(source)) return [];
    return source
      .map((item): Appointment | null => {
        const app = item as Partial<Appointment>;
        if (!app || !app.email || !app.service || !app.date || !app.time) return null;
        return {
          id: Number(app.id) || 0,
          name: String(app.name || ''),
          email: String(app.email),
          service: String(app.service),
          date: this.normalizeDate(app.date),
          time: this.normalizeTime(app.time),
          status: (app.status as AppointmentStatus) || AppointmentStatus.Pending,
        };
      })
      .filter((app): app is Appointment => !!app);
  }

  private sortAppointments(appointments: Appointment[]): Appointment[] {
    return [...appointments].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  private normalizeDate(value: string | Date): string {
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) return str;
    return this.normalizeDate(parsed);
  }

  private normalizeTime(value: string): string {
    const str = String(value || '').trim();
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return str;
    const hour = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, '0');
    const minute = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, '0');
    return `${hour}:${minute}`;
  }
}
