import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipContainerComponent } from './ship-container.component';

describe('ShipContainerComponent', () => {
  let component: ShipContainerComponent;
  let fixture: ComponentFixture<ShipContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
