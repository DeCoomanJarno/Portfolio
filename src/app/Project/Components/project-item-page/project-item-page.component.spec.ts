import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectItemPageComponent } from './project-item-page.component';

describe('ProjectItemPageComponent', () => {
  let component: ProjectItemPageComponent;
  let fixture: ComponentFixture<ProjectItemPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectItemPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectItemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
