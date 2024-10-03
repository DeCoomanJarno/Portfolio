import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestProjectComponent } from './test-project.component';

describe('TestProjectComponent', () => {
  let component: TestProjectComponent;
  let fixture: ComponentFixture<TestProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
