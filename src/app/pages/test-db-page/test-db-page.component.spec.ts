import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDbPageComponent } from './test-db-page.component';

describe('TestDbPageComponent', () => {
  let component: TestDbPageComponent;
  let fixture: ComponentFixture<TestDbPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDbPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDbPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
