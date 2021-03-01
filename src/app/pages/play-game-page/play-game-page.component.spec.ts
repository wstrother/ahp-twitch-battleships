import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGamePageComponent } from './play-game-page.component';

describe('PlayGamePageComponent', () => {
  let component: PlayGamePageComponent;
  let fixture: ComponentFixture<PlayGamePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayGamePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayGamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
