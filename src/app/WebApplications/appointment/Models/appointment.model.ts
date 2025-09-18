export interface Appointment {
  id: number;
  name: string;
  email: string;
  service: string;
  date: string;   // yyyy-mm-dd
  time: string;   // HH:mm
  status: AppointmentStatus;
}

export enum AppointmentStatus {
    Pending = 'Pending',
    Confirmed= 'Confirmed',
    Done= 'Done',
    Cancel= 'Cancel',
    CancelRequest= 'CancelRequest'
}
