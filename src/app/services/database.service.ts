import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireList, DatabaseReference, SnapshotAction } from '@angular/fire/database/interfaces';
import { combineLatest, from, Observable, ReplaySubject, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, switchMapTo, take, tap } from 'rxjs/operators';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';


export class GameConnection {
  constructor(
    public game: Game,
    public uid: string,
    public connected: boolean
  ) {}
}


// SERVICE CLASS

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _userId: ReplaySubject<string> = new ReplaySubject(1);
  private _gameKey: ReplaySubject<string> = new ReplaySubject(1);
  private _currentGame: ReplaySubject<Game> = new ReplaySubject(1);
  private _gameConnection: ReplaySubject<GameConnection> = new ReplaySubject(1);
  private _errorMessage: ReplaySubject<string> = new ReplaySubject(1);

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
  }
  
  get currentGame$(): Observable<Game> {
    return this._currentGame.asObservable();
  }

  get gameConnection$(): Observable<GameConnection> {
    return this._gameConnection.asObservable();
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

  getCurrentShips(): Observable<Ship[]> {
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

}



// export class DatabaseService {
//   private playerKey: ReplaySubject<string> = new ReplaySubject(1);
//   private gameKey: ReplaySubject<string> = new ReplaySubject(1);
//   private playerConnected: ReplaySubject<boolean> = new ReplaySubject(1);

//   gameLoaded: boolean = false;
  
//   private shipsRef: AngularFireList<any>;
//   private gamesRef: AngularFireList<any>;
//   private playersRef: AngularFireList<any>;
//   private shotsRef: AngularFireList<any>;

//   constructor(private af: AngularFireDatabase) {
//     this.gamesRef = this.af.list("/games");
//     this.playersRef = this.af.list("/players");
//     this.shipsRef = this.af.list("/ships");
//     this.shotsRef = this.af.list("/shots");

//     this.checkPlayer();
//   }

//   checkPlayer(): void {

//     // helper function that sets localStorage 'playerKey' item
//     // and passes the same value to the playerKey subject
//     const updatePlayerKey = (key: string) => {
//       this.playerKey.next(key);
//       localStorage.setItem("playerKey", key);
//     }
    
//     const playerKey = localStorage.getItem("playerKey");

//     // cast the document from the database as a boolean
//     const handlePlayer = (playerFound: boolean) => {
      
//       // if the record is there then pass the current key
//       // to updatePlayerKey
//       if (playerFound) {updatePlayerKey(playerKey)}

//       // if not call createPlayer with updatePlayerKey
//       // as the subscription callback
//       else {this.createPlayer().subscribe(updatePlayerKey)}
//     }
    
//     this.af.object(`players/${playerKey}`)
//       .valueChanges().pipe(take(1))
//       .subscribe(handlePlayer);
//   }

//   createPlayer(): Observable<string> {

//     return from(
//       this.playersRef.push({
//         time: Date.now()
//       }).then(r => r.key)
//     );
//   }

//   getPlayerKey(): Observable<string> {
//     return this.playerKey.asObservable();
//   }

//   getCurrentGame(): Observable<Game> {

//     const getGameDoc = (gameKey: string) => this.af.object(`games/${gameKey}`)
//         .snapshotChanges().pipe(
//           map((game) => {
            
//             let g = Game.getFromSnapshot(game)
//             return g;
//           }),
//           catchError(() => {throw new NoGameError(gameKey)})
//         )

//     return this.gameKey.pipe(
//       switchMap(getGameDoc)
//     )
//   }

//   getConnection(): Observable<boolean> {
//     return this.playerConnected.pipe(
//       tap(b => {
//         if (!b) {throw new FullGameError();}
//       })
//     );
//   }

//   onGameConnection(): Observable<GameConnection> {
//     const getGameConnection = (
//       [game, connected, playerKey]
//     ) => { return {game, connected, playerKey} }

//     return combineLatest([
//       this.getCurrentGame(),
//       this.getConnection(),
//       this.getPlayerKey()
//     ]).pipe(
//       map(getGameConnection)
//     );
//   }

//   getGameShips(gameKey: string): Observable<Ship[]> {

//     const gameFilter = (ref: DatabaseReference) => ref
//       .orderByChild("gameKey").equalTo(gameKey);

//     return this.af.list("/ships", gameFilter).snapshotChanges()
//       .pipe(map(
//         ships => ships.map(s => {
//           return Ship.getFromSnapshot(s)
//         })
//       )
//     );
//   }

//   getGameShots(gameKey: string): Observable<Shot[]> {

//     const gameFilter = (ref: DatabaseReference) => ref
//       .orderByChild("gameKey").equalTo(gameKey);
    
//     return this.af.list("/shots", gameFilter).snapshotChanges()
//       .pipe(map(
//         shots => shots.map(s => {
//           return Shot.getFromSnapshot(s)
//         })
//       )
//     );
//   }

//   setGameKey(gameKey: string): void {
//     this.gameLoaded = true;
//     this.gameKey.next(gameKey);
//   }

//   createGame(game: Game): Observable<Game> { 
//     if (game.random) {
//       game.seed = Date.now() + "";
//     }

//     return this.getPlayerKey().pipe(
//       switchMap((playerKey: string) => {

//         game.player1 = playerKey;
        
//         return game.create(this.gamesRef);
//       }),
//       tap((game) => {
//         this.setGameKey(game.key);
//         this.createShips(game.player1);
//       })
//     );
//   }

//   connectToGame(): void {

//     combineLatest([
//       this.getPlayerKey(),
//       this.getCurrentGame()
//     ]).pipe(take(1)).subscribe(
//       ([playerKey, game]) => {

//         const playerNum = game.getPlayerNum(playerKey);

//         if (game.p2open && playerNum === 2) {
//           game.update(this.gamesRef, {player2: playerKey});
//           this.createShips(playerKey);
//         }

//         if (playerNum) {
//           this.playerConnected.next(true);
          
//         } else {
//           this.playerConnected.next(false);
//         }
      
//       }
//     );
//   }

//   setReady(): void {
//     combineLatest([
//       this.getPlayerKey(),
//       this.getCurrentGame()
//     ]).pipe(take(1)).subscribe(
//       ([playerKey, game]) => {
//         game.setReady(playerKey, this.gamesRef);
//       }
//     )
//   }

//   createShips(playerKey: string): void {
//     const makeShips = (game: Game) => {
//       game.shipArgs.forEach(
//         (n) => {
//           let s = new Ship(n, game.key, playerKey);
//           s.create(this.shipsRef);
//         }
//         );
//     }
      
//       this.getCurrentGame().pipe(
//         take(1)
//       ).subscribe(makeShips);
//   }

//   updateShip(ship: Ship, data: any): void {
//     ship.update(this.shipsRef, data);
//   }

//   fireShot(row: number, col: number): Observable<Shot> {
//     return combineLatest([
//       this.getCurrentGame(),
//       this.getPlayerKey()
//     ]).pipe(
//       take(1),
//       switchMap(([game, playerKey]) => {
//         let shot = new Shot(row, col, game.key, playerKey);
//         return shot.create(this.shotsRef);
//         })
//       );
//   }

// }
