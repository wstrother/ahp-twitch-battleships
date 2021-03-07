import { TestBed } from '@angular/core/testing';

import { MonService } from './mon.service';

describe('MonService', () => {
  let service: MonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
