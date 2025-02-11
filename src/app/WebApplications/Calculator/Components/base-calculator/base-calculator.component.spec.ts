import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseCalculatorComponent } from './base-calculator.component';

describe('BaseCalculatorComponent', () => {
  let component: BaseCalculatorComponent;
  let fixture: ComponentFixture<BaseCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
