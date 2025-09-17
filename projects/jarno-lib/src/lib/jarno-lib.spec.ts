import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JarnoLib } from './jarno-lib';

describe('JarnoLib', () => {
  let component: JarnoLib;
  let fixture: ComponentFixture<JarnoLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JarnoLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JarnoLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
