import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceShipsInfoComponent } from './place-ships-info.component';

describe('PlaceShipsInfoComponent', () => {
  let component: PlaceShipsInfoComponent;
  let fixture: ComponentFixture<PlaceShipsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceShipsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceShipsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
