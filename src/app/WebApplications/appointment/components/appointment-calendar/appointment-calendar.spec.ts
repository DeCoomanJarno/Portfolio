import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentCalendarComponent } from './appointment-calendar';

describe('AppointmentCalendar', () => {
  let component: AppointmentCalendarComponent;
  let fixture: ComponentFixture<AppointmentCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
