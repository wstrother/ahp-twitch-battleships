import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomizeInfoComponent } from './randomize-info.component';

describe('RandomizeInfoComponent', () => {
  let component: RandomizeInfoComponent;
  let fixture: ComponentFixture<RandomizeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RandomizeInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomizeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
