import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOfLifePageComponent } from './game-of-life-page.component';

describe('GameOfLifePageComponent', () => {
  let component: GameOfLifePageComponent;
  let fixture: ComponentFixture<GameOfLifePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameOfLifePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameOfLifePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
