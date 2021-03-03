import { Injectable } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Ship } from './models/ship';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _currentShips: Ship[];
  currentShips$: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);

  private _otherShips: Ship[];
  otherShips$: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);

  constructor(private db: DatabaseService) {
    this.getCurrentShips().subscribe(
      (ships) => {
        this._currentShips = ships;
        this.currentShips$.next(ships);
      }
    )
    
  }

  getCurrentShips(): Observable<Ship[]> {

    const currentShip$ = ([game, playerKey]) => {
      return this.db.getGameShips(game.key).pipe(
        map(ships => ships.filter(s => s.playerKey === playerKey)),        
        first(ships => ships.length === game.shipArgs.length)
      )
    }

    return combineLatest([
      this.db.getCurrentGame(),
      this.db.getPlayerKey()
    ]).pipe(
      switchMap(currentShip$)
    );
  }

}
