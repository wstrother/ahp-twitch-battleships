import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipsViewComponent } from './ships-view.component';

describe('ShipsViewComponent', () => {
  let component: ShipsViewComponent;
  let fixture: ComponentFixture<ShipsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShipsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
