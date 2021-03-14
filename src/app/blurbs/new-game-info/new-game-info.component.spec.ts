import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGameInfoComponent } from './new-game-info.component';

describe('NewGameInfoComponent', () => {
  let component: NewGameInfoComponent;
  let fixture: ComponentFixture<NewGameInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGameInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewGameInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
