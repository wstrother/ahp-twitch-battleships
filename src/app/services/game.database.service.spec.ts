import { TestBed } from '@angular/core/testing';

import { GameDatabaseService } from './game.database.service';

describe('GameDatabaseService', () => {
  let service: GameDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
