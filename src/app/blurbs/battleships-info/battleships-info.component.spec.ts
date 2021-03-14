import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleshipsInfoComponent } from './battleships-info.component';

describe('BattleshipsInfoComponent', () => {
  let component: BattleshipsInfoComponent;
  let fixture: ComponentFixture<BattleshipsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BattleshipsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BattleshipsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
