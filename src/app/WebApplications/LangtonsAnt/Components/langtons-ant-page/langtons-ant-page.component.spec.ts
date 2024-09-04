import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangtonsAntPageComponent } from './langtons-ant-page.component';

describe('LangtonsAntPageComponent', () => {
  let component: LangtonsAntPageComponent;
  let fixture: ComponentFixture<LangtonsAntPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangtonsAntPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangtonsAntPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
