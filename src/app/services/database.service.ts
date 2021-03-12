import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireList, DatabaseReference, SnapshotAction } from '@angular/fire/database/interfaces';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, switchMap, switchMapTo, take, tap } from 'rxjs/operators';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _userId: ReplaySubject<string> = new ReplaySubject(1);
  private _gameKey: ReplaySubject<string> = new ReplaySubject(1);
  private _currentGame: ReplaySubject<Game> = new ReplaySubject(1);
  private _errorMessage: ReplaySubject<string> = new ReplaySubject(1);

  playerShips$: Observable<Ship[]>;
  otherShips$: Observable<Ship[]>;

  private shipsRef: AngularFireList<any>;
  private gamesRef: AngularFireList<any>;
  private shotsRef: AngularFireList<any>;

  gameLoaded: boolean = false;

  constructor(private af: AngularFireDatabase, private auth: AngularFireAuth) {
    this.gamesRef = this.af.list("/games");
    this.shipsRef = this.af.list("/ships");
    this.shotsRef = this.af.list("/shots");
    
    // on init, this class signs the user in anonymously which sets a value
    // for the userId$ observable
    const handleUser = (user: any) => {
      if (!user) {
        this.auth.signInAnonymously();
      }
      else {
        this._userId.next(user.uid);
      }
    }
    this.auth.authState.subscribe(handleUser);

    // then using the userId, set an observable on the record in the database
    // piping the value from the current gameKey$ observable to a request
    // which is then either mapped to a Game object for the currentGame$
    // errorMessage$ observables
    const getGame$ = (gameKey: string): Observable<Game> => {
      return this.af.object(`games/${gameKey}`).snapshotChanges()
        .pipe(map(
            (response: SnapshotAction<Game>) => Game.getFromSnapshot(response)
        )
      );
    }
    this.userId$.pipe(
      switchMapTo(this.gameKey$
        .pipe(switchMap(getGame$))
      )
    ).subscribe(
      (game: Game) => { this._currentGame.next(game); },
      () => { this._errorMessage.next("Error Connecting to Game"); }
    );

    // connect the user to the current game
    this.connectPlayer();

    // set up observables of the players and opponent's ships and shots
    this.playerShips$ = this.getPlayerShips();
    this.otherShips$ = this.getOtherShips();
  }
  
  get currentGame$(): Observable<Game> {
    return this._currentGame.asObservable();
  }

  get errorMessage$(): Observable<string> {
    return this._errorMessage.asObservable();
  }

  get userId$(): Observable<string> {
    return this._userId.asObservable();
  }

  get gameKey$(): Observable<string> {
    return this._gameKey.asObservable();
  }

  setGameKey(gameKey: string): void {
    this._gameKey.next(gameKey);
    this.gameLoaded = true;
  }

  getShips(): Observable<Ship[]> {
    
    return this.currentGame$.pipe(
      switchMap((game: Game) => {

        const gameFilter = (ref: DatabaseReference) => ref
              .orderByChild("gameKey").equalTo(game.key);

        return this.af.list("/ships", gameFilter).snapshotChanges().pipe(
          map((ships) => ships.map(s => Ship.getFromSnapshot(s)))
        );

      })
    );

  }

  getPlayerShips(): Observable<Ship[]> {
    return this.userId$.pipe(
      switchMap((id: string) => {

        return this.getShips().pipe(
          map(ships => ships.filter(s => s.player === id))
        );

      })
    );
  }

  getOtherShips(): Observable<Ship[]> {
    return this.userId$.pipe(
      switchMap((id: string) => {

        return this.getShips().pipe(
          map(ships => ships.filter(s => s.player !== id))
        );

      })
    );
  }

  createGame(game: Game): Observable<Game> {
    if (game.random) {
      game.seed = Date.now() + "";
    }

    return this.userId$.pipe(
      switchMap((id: string) => {

        game.player1 = id;
        
        return game.create(this.gamesRef);
      }),
      tap((game) => {
        this.createShips(game, game.player1);
      })
    );
  }

  connectPlayer(): void {
    console.log("connecting player 2");

    combineLatest([
      this.userId$,
      this.currentGame$
    ]).pipe(take(1)).subscribe(
      ([id, game]) => {

        const playerNum = game.getPlayerNum(id);

        if (game.p2open && playerNum === 2) {
          game.update(this.gamesRef, {player2: id});
          this.createShips(game, id);
        }
      }
    );
  }

  createShips(game: Game, id: string): void {
    game.shipArgs.forEach(
      (n) => {
        let s = new Ship(n, game.key, id);
        s.create(this.shipsRef);
      }
    );
  }

  updateShip(ship: Ship, data: any): void {
    ship.update(this.shipsRef, data);
  }

  setReady(): void {
    combineLatest([
      this.userId$,
      this.currentGame$
    ]).pipe(take(1)).subscribe(
      ([playerKey, game]) => {
        game.setReady(playerKey, this.gamesRef);
      }
    )
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

  getOtherShots(): Observable<Shot[]> {
    return combineLatest([
      this.currentGame$,
      this.userId$
    ]).pipe(
      switchMap(([game, uid]) => this.getGameShots(game.key)
        .pipe(
          map(shots => shots.filter(shot => shot.player !== uid))
        )
    ));
  }

  getCurrentShots(): Observable<Shot[]> {
    return combineLatest([
      this.currentGame$,
      this.userId$
    ]).pipe(
      switchMap(([game, uid]) => this.getGameShots(game.key)
        .pipe(
          map(shots => shots.filter(shot => shot.player === uid))
        )
    ));
  }

  fireShot(row: number, col: number): Observable<Shot> {
    return combineLatest([
      this.currentGame$,
      this.userId$
    ]).pipe(
      take(1),
      switchMap(([game, uid]) => {
        let shot = new Shot(row, col, game.key, uid);
        return shot.create(this.shotsRef);
        })
      );
  }

}
