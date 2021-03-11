import { Injectable } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, first, map, switchMap, take } from 'rxjs/operators';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';
import { DatabaseService } from './database.service';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentShips: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);
  private otherShips: ReplaySubject<Ship[]> = new ReplaySubject<Ship[]>(1);

  private _currentShots: Shot[] = [];
  private currentShotList: ReplaySubject<Shot[]> = new ReplaySubject<Shot[]>(1);

  private _otherShots: Shot[] = [];
  private otherNewShot: ReplaySubject<Shot> = new ReplaySubject<Shot>();

  constructor(private db: DatabaseService) {
    // this.setCurrentShips();
    // this.setOtherShips();
    // this.setShots();
  }

  // setShots(): void {
  //   console.log("setting up shots subscription...");

  //   combineLatest([
  //     this.db.getCurrentGame(),
  //     this.db.getPlayerKey()
  //   ]).pipe(take(1)).subscribe(
  //     ([game, playerKey]) => {
  //       this.db.getGameShots(game.key).subscribe(
  //         (shots) => { 
  //           this.filterShots(shots, playerKey); 

  //         }
  //       )
  //     }
  //   );
  // }

  // filterShots(shots: Shot[], playerKey: string): void {
  //   const checkToAdd = (list: Shot[], shot: Shot) => {
  //     if (list.every(s => !shot.check(s))) {list.push(shot)}
  //   }

  //   console.log("filtering shots");
  //   shots.forEach(shot => {
  //     if (shot.playerKey === playerKey) {
  //       checkToAdd(this._currentShots, shot);
        
  //     } else {
  //       checkToAdd(this._otherShots, shot);
  //       this.otherNewShot.next(shot);
  //     }

  //   this.currentShotList.next(this._currentShots);
  //   });
  // }

  // getOtherShots(): Observable<Shot[]> {
  //   return combineLatest([
  //     this.db.getCurrentGame(),
  //     this.db.getPlayerKey()
  //   ]).pipe(
  //     switchMap(([game, playerKey]) => this.db.getGameShots(game.key)
  //       .pipe(
  //         map(shots => shots.filter(shot => shot.playerKey !== playerKey))
  //       )
  //   ));
  // }

  // getCurrentShots(): Observable<Shot[]> {
  //   return combineLatest([
  //     this.db.getCurrentGame(),
  //     this.db.getPlayerKey()
  //   ]).pipe(
  //     switchMap(([game, playerKey]) => this.db.getGameShots(game.key)
  //       .pipe(
  //         map(shots => shots.filter(shot => shot.playerKey === playerKey))
  //       )
  //   ));
  // }

  // getCurrentShips(): Observable<Ship[]> {
  //   return this.currentShips.asObservable().pipe(take(1));
  // }

  // setCurrentShips(): void {

  //   const currentShip$ = ([game, playerKey]) => {
  //     return this.db.getGameShips(game.key).pipe(
  //       map(ships => ships.filter(s => s.playerKey === playerKey)),        
  //       first(ships => ships.length === game.shipArgs.length)
  //     )
  //   }

  //   combineLatest([
  //     this.db.getCurrentGame(),
  //     this.db.getPlayerKey()
  //   ]).pipe(
  //     switchMap(currentShip$)
  //   ).subscribe(
  //     (ships) => {
  //       this.currentShips.next(ships);
  //     }
  //   );

  // }

  // onOtherReady(): Observable<Boolean> {
  //   return this.otherShips.pipe(
  //     map((ships: Ship[]) => {return true}),
  //     take(1)
  //   );
  // }

  // getOtherShips(): Observable<Ship[]> {
  //   return this.otherShips.pipe(take(1));
  // }

  // setOtherShips(): void {

  //   const otherFilter = (ships: Ship[], game: Game, playerKey: string) => {
  //     let mapped = [];
  //     let otherKey = game.otherKey(playerKey);

  //     if (game.otherReady(playerKey)) {
  //       mapped = ships.filter(s => s.playerKey === otherKey)
  //     }

  //     return mapped
  //   }

  //   const otherShip$ = ([game, playerKey]) => {
  //     return this.db.getGameShips(game.key).pipe(
  //       map(ships => otherFilter(ships, game, playerKey)),
  //       first(ships => ships.length === game.shipArgs.length)
  //     )
  //   }

  //   combineLatest([
  //     this.db.getCurrentGame(),
  //     this.db.getPlayerKey()
  //   ]).pipe(
  //     switchMap(otherShip$)
  //   ).subscribe(
  //     (ships) => {
  //       this.otherShips.next(ships);
  //     }
  //   );

  // }

}
