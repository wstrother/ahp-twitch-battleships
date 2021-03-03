import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { from, Observable, combineLatest, ReplaySubject } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { Game } from '../models/game';
import { Ship } from '../models/ship';


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
export class GameDatabaseService {
  private playerKey: ReplaySubject<string> = new ReplaySubject(1);
  private gameKey: ReplaySubject<string> = new ReplaySubject(1);
  private playerConnected: ReplaySubject<boolean> = new ReplaySubject(1);
  
  private shipsRef: AngularFireList<any>;
  private gamesRef: AngularFireList<any>;
  private playersRef: AngularFireList<any>;

  constructor(private af: AngularFireDatabase) {
    this.gamesRef = this.af.list("/games");
    this.playersRef = this.af.list("/players");
    this.shipsRef = this.af.list("/ships");

    this.checkPlayer();
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
      take(1),
      map(getGameConnection)
    );
  }

  getCurrentShips(): Observable<Ship[]> {

    const currentShip$ = ([game, playerKey]) => {
      return this.getGameShips(game.key).pipe(

        // filter to ships for the current player
        map(ships => ships.filter(s => s.playerKey === playerKey)),
        
        // only emit the list of ships once all the ships for the
        // game have been created
        filter(ships => ships.length === game.shipArgs.length)
      )
    }

    return combineLatest([
      this.getCurrentGame(),
      this.getPlayerKey()
    ]).pipe(      // ([game, playerKey])
      switchMap(currentShip$)
    );
  }

  getGameShips(gameKey: string): Observable<Ship[]> {

    const gameFilter = (ref: DatabaseReference) => ref.orderByChild("gameKey").equalTo(gameKey);

    return this.af.list("/ships", gameFilter).snapshotChanges()
      .pipe(map(
        ships => ships.map(s => {
          let sh = Ship.getFromSnapshot(s)
          return sh
        })
      )
    );
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

  createGame(game: Game): Observable<Game> { 

    return this.getPlayerKey().pipe(
      switchMap((playerKey: string) => {

        game.player1 = playerKey;
        this.createShips(playerKey);
        
        return game.create(this.gamesRef);
      })
    );
  }

  setCurrentGame(gameKey: string): void {
    this.gameKey.next(gameKey);
  }

  connectPlayer(): void {

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
}
