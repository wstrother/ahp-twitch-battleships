import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGameInfoComponent } from './play-game-info.component';

describe('PlayGameInfoComponent', () => {
  let component: PlayGameInfoComponent;
  let fixture: ComponentFixture<PlayGameInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayGameInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayGameInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
