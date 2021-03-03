import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireList, DatabaseReference } from '@angular/fire/database/interfaces';
import { combineLatest, from, Observable, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';


class FullGameError extends Error {
  constructor() {
    super(`This game already has two players`);
    this.name = "FullGameError";
  }
}

class NoGameError extends Error {
  constructor(gameKey: string) {
    super(`No game with key ${gameKey} was found`);
    this.name = "NoGameError";
  }
}

export interface GameConnection {
  game: Game;
  connected: boolean;
  playerKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private playerKey: ReplaySubject<string> = new ReplaySubject(1);
  private gameKey: ReplaySubject<string> = new ReplaySubject(1);
  private playerConnected: ReplaySubject<boolean> = new ReplaySubject(1);

  gameLoaded: boolean = false;
  
  private shipsRef: AngularFireList<any>;
  private gamesRef: AngularFireList<any>;
  private playersRef: AngularFireList<any>;
  private shotsRef: AngularFireList<any>;

  constructor(private af: AngularFireDatabase) {
    this.gamesRef = this.af.list("/games");
    this.playersRef = this.af.list("/players");
    this.shipsRef = this.af.list("/ships");
    this.shotsRef = this.af.list("/shots");

    this.checkPlayer();
  }

  checkPlayer(): void {

    // helper function that sets localStorage 'playerKey' item
    // and passes the same value to the playerKey subject
    const updatePlayerKey = (key: string) => {
      this.playerKey.next(key);
      localStorage.setItem("playerKey", key);
    }
    
    const playerKey = localStorage.getItem("playerKey");

    // cast the document from the database as a boolean
    const handlePlayer = (playerFound: boolean) => {
      
      // if the record is there then pass the current key
      // to updatePlayerKey
      if (playerFound) {updatePlayerKey(playerKey)}

      // if not call createPlayer with updatePlayerKey
      // as the subscription callback
      else {this.createPlayer().subscribe(updatePlayerKey)}
    }
    
    this.af.object(`players/${playerKey}`)
      .valueChanges().pipe(take(1))
      .subscribe(handlePlayer);
  }

  createPlayer(): Observable<string> {

    return from(
      this.playersRef.push({
        time: Date.now()
      }).then(r => r.key)
    );
  }

  getPlayerKey(): Observable<string> {
    return this.playerKey.asObservable();
  }

  getCurrentGame(): Observable<Game> {

    const getGameDoc = (gameKey: string) => this.af.object(`games/${gameKey}`)
        .snapshotChanges().pipe(
          map((game) => {
            
            let g = Game.getFromSnapshot(game)
            return g;
          }),
          catchError(() => {throw new NoGameError(gameKey)})
        )

    return this.gameKey.pipe(
      switchMap(getGameDoc)
    )
  }

  getConnection(): Observable<boolean> {
    return this.playerConnected.pipe(
      tap(b => {
        if (!b) {throw new FullGameError();}
      })
    );
  }

  onGameConnection(): Observable<GameConnection> {
    const getGameConnection = (
      [game, connected, playerKey]
    ) => { return {game, connected, playerKey} }

    return combineLatest([
      this.getCurrentGame(),
      this.getConnection(),
      this.getPlayerKey()
    ]).pipe(
      map(getGameConnection)
    );
  }

  getGameShips(gameKey: string): Observable<Ship[]> {

    const gameFilter = (ref: DatabaseReference) => ref
      .orderByChild("gameKey").equalTo(gameKey);

    return this.af.list("/ships", gameFilter).snapshotChanges()
      .pipe(map(
        ships => ships.map(s => {
          return Ship.getFromSnapshot(s)
        })
      )
    );
  }

  getGameShots(gameKey: string): Observable<Shot[]> {

    const gameFilter = (ref: DatabaseReference) => ref
      .orderByChild("gameKey").equalTo(gameKey);
    
    return this.af.list("/shots", gameFilter).snapshotChanges()
      .pipe(map(
        shots => shots.map(s => {
          return Shot.getFromSnapshot(s)
        })
      )
    );
  }

  setGameKey(gameKey: string): void {
    this.gameLoaded = true;
    this.gameKey.next(gameKey);
  }

  createGame(game: Game): Observable<Game> { 

    return this.getPlayerKey().pipe(
      switchMap((playerKey: string) => {

        game.player1 = playerKey;
        
        return game.create(this.gamesRef);
      }),
      tap((game) => {
        this.setGameKey(game.key);
        this.createShips(game.player1);
      })
    );
  }

  connectToGame(): void {

    combineLatest([
      this.getPlayerKey(),
      this.getCurrentGame()
    ]).pipe(take(1)).subscribe(
      ([playerKey, game]) => {

        const playerNum = game.getPlayerNum(playerKey);

        if (game.p2open && playerNum === 2) {
          game.update(this.gamesRef, {player2: playerKey});
          this.createShips(playerKey);
        }

        if (playerNum) {
          this.playerConnected.next(true);
          
        } else {
          this.playerConnected.next(false);
        }
      
      }
    );
  }

  setReady(): void {
    combineLatest([
      this.getPlayerKey(),
      this.getCurrentGame()
    ]).pipe(take(1)).subscribe(
      ([playerKey, game]) => {
        game.setReady(playerKey, this.gamesRef);
      }
    )
  }

  createShips(playerKey: string): void {
    const makeShips = (game: Game) => {
      game.shipArgs.forEach(
        (n) => {
          let s = new Ship(n, game.key, playerKey);
          s.create(this.shipsRef);
        }
        );
    }
      
      this.getCurrentGame().pipe(
        take(1)
      ).subscribe(makeShips);
  }

  updateShip(ship: Ship, data: any): void {
    ship.update(this.shipsRef, data);
  }

  fireShot(row: number, col: number): void {
    combineLatest([
      this.getCurrentGame(),
      this.getPlayerKey()
    ]).pipe(take(1)).subscribe(
      ([game, playerKey]) => {
        let shot = new Shot(row, col, game.key, playerKey);
        shot.create(this.shotsRef);
      }
    );
  }

}
