import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScienceCalculatorComponent } from './science-calculator';

describe('ScienceCalculatorComponent', () => {
  let component: ScienceCalculatorComponent;
  let fixture: ComponentFixture<ScienceCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScienceCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScienceCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
