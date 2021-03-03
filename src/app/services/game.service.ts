import { Injectable } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, first, map, switchMap, take } from 'rxjs/operators';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { DatabaseService } from './database.service';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentShips: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);
  private otherShips: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);

  constructor(private db: DatabaseService) {
    this.setCurrentShips();
    this.setOtherShips();
  }

  getCurrentShips(): Observable<Ship[]> {
    return this.currentShips.asObservable().pipe(take(1));
  }

  setCurrentShips(): void {

    const currentShip$ = ([game, playerKey]) => {
      return this.db.getGameShips(game.key).pipe(
        map(ships => ships.filter(s => s.playerKey === playerKey)),        
        first(ships => ships.length === game.shipArgs.length)
      )
    }

    combineLatest([
      this.db.getCurrentGame(),
      this.db.getPlayerKey()
    ]).pipe(
      switchMap(currentShip$)
    ).subscribe(
      (ships) => {
        this.currentShips.next(ships);
      }
    );

  }

  getOtherShips(): Observable<Ship[]> {
    return this.otherShips.asObservable().pipe(take(1));
  }

  setOtherShips(): void {

    const otherFilter = (ships: Ship[], game: Game, playerKey: string) => {
      let mapped = [];
      let otherKey = game.otherKey(playerKey);

      if (game.otherReady(playerKey)) {
        mapped = ships.filter(s => s.playerKey === otherKey)
      }

      return mapped
    }

    const otherShip$ = ([game, playerKey]) => {
      return this.db.getGameShips(game.key).pipe(
        map(ships => otherFilter(ships, game, playerKey)),
        first(ships => ships.length === game.shipArgs.length)
      )
    }

    combineLatest([
      this.db.getCurrentGame(),
      this.db.getPlayerKey()
    ]).pipe(
      switchMap(otherShip$)
    ).subscribe(
      (ships) => {
        this.otherShips.next(ships);
      }
    );

  }

}
