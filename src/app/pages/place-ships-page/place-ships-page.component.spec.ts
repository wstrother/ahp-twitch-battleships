import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceShipsPageComponent } from './place-ships-page.component';

describe('PlaceShipsPageComponent', () => {
  let component: PlaceShipsPageComponent;
  let fixture: ComponentFixture<PlaceShipsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceShipsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceShipsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
