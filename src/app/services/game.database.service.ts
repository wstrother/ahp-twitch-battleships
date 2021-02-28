import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList,  SnapshotAction } from '@angular/fire/database';
import { from, Observable, combineLatest, ReplaySubject } from 'rxjs';
import { catchError, first, map, switchMap, take, tap } from 'rxjs/operators';
import { DatabaseReference } from '@angular/fire/database/interfaces';



// database document classes

export class GameDoc {
  player1: string;
  p1ready: boolean = false;

  player2: string;
  p2ready: boolean = false;
  
  key: string;
  boardWidth: number;
  totalCells: number;
  shipArgs: number[];

  static getFromSnapshot(action: SnapshotAction<any>): GameDoc {
    if (action.key === null) {
      throw Error("Database error ocurred!");
    }
    let g = new GameDoc();
    g.key = action.key;
    Object.assign(g, action.payload.val());

    return g;
  }
}

export class ShipDoc {
  row: number = 0;
  col: number = 0;
  direction: "x" | "y" = "x";
  placed: boolean = false;
  playerKey: string;
  key: string; 
  gameKey: string; 
  size: number;

  static getFromSnapshot(action: SnapshotAction<any>): ShipDoc {
    if (action.key === null) {
      throw Error("Database error ocurred!")
    }
    let s = new ShipDoc();
    s.key = action.key;
    Object.assign(s, action.payload.val());

    return s;
  }
}

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


  // create connections to the database and check that the current
  // user has a record in the database by calling checkPlayer()
  constructor(private af: AngularFireDatabase) {
    this.gamesRef = this.af.list("/games");
    this.playersRef = this.af.list("/players");
    this.shipsRef = this.af.list("/ships");

    this.checkPlayer();
  }
  
  // helper methods that return observable values of the
  // playerKey, currentGame, and playerConnected subjects
  // and ensure the subscription automatically closes after
  // emitting a value;

  getPlayerKey(): Observable<string> {
    return this.playerKey.asObservable();
  }

  getCurrentGame(): Observable<GameDoc> {

    const getGameDoc = (gameKey: string) => this.af.object(`games/${gameKey}`)
        .snapshotChanges().pipe(
          map((game) => GameDoc.getFromSnapshot(game)),
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

  
  // helper method combines the streams of getCurrentGame() and
  // getPlayerKey() methods to filter to only ships associated with
  // the current game and player and creates ships for the player if
  // none are found, also closes the subscription when enough ships
  // for the game have been emitted
  getCurrentShips(): Observable<ShipDoc[]> {

    const currentShip$ = ([game, playerKey]) => {
      return this.getGameShips(game.key).pipe(
        // filter to ships for the current player
        map(ships => ships.filter(s => s.playerKey === playerKey)),
        
        // if no ships are found, create ships for this game
        tap(ships => {
          if (ships.length === 0) {this.createShips(game, playerKey)}
        }),
        
        // only emit the list of ships when all the ships for the
        // game have been created
        first(ships => ships.length === game.shipArgs.length)
      )
    }

    return combineLatest([
      this.getCurrentGame(),
      this.getPlayerKey()
    ]).pipe(      // ([game, playerKey])
      switchMap(currentShip$)
    );
  }

  // returns the "/ships" collection from the database filtered to
  // a specific gameKey
  getGameShips(gameKey: string): Observable<ShipDoc[]> {
    const gameFilter = (ref: DatabaseReference) => ref.orderByChild("gameKey").equalTo(gameKey);

    return this.af.list("/ships", gameFilter).snapshotChanges()
      .pipe(map(
        ships => ships.map(s => ShipDoc.getFromSnapshot(s))
      )
    );
  }

  // checkPlayer()
  // check for player when the app is loaded
  checkPlayer(): void {
    // helper function that sets localStorage 'playerKey' item
    // and passes the same value to the playerKey subject
    const updatePlayerKey = (key: string) => {
      this.playerKey.next(key);
      localStorage.setItem("playerKey", key);
    }
    
    // check localStorage for stored playerKey
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
    
    // create the database object Observable and pipe
    // the first result
    this.af.object(`players/${playerKey}`)
      .valueChanges().pipe(take(1))
      .subscribe(handlePlayer);
  }

  // createPlayer()
  // creates a player document on the database with the current
  // timestamp and returns an Observable of the playerKey string
  createPlayer(): Observable<string> {
    return from(
      this.playersRef.push({
        time: Date.now()
      }).then(r => r.key)
    ).pipe(
      take(1)
    );
  }

   // createGame()
   // used by new-game-page to generate a game for the database
   // using form data from the UI and returns a successful database
   // operation as an Observable of the gameKey string
  createGame({name, boardWidth, totalCells, shipArgs}): Observable<string> {    
    // return the database push Promise as an observable that returns
    // the gameKey when subscribed so the router can navigate to the
    // correct page
    const getGameKey = (playerKey: string) => {
      return from(this.gamesRef.push({
        name,
        boardWidth,
        totalCells,
        shipArgs,
        
        player1: playerKey,
        p1ready: false,

        p2ready: false
      }).then(r => r.key));
    }
    
    // get the playerKey and pipe it to the getGameKey
    // Observable instead
    return this.getPlayerKey().pipe(
      switchMap(getGameKey)
    );
  }

  // setCurrentGame()
  // used by place-ships-page and play-game-page to set a reference
  // to the current game through the route 'id' parameter
  setCurrentGame(gameKey: string): void {
    this.gameKey.next(gameKey);
  }

  // connectPlayer()
  // ensures that the current playerKey is associated to the current game
  // in the database and throws an error if the game is full
  connectPlayer(): void {
    // combine playerKey and currentGame values
    combineLatest([
      this.getPlayerKey(),
      this.getCurrentGame()
    ]).pipe(take(1)).subscribe(
      ([playerKey, game]) => {
        // set booleans for each playerKey match
        // and whether or not the player2 value
        // should be pushed to the database
        const p2empty = game.player2 === undefined;
        const p1 = game.player1 === playerKey;
        const p2 = game.player2 === playerKey || p2empty;
        const gameFull = !(p1 || p2);

        // send false if both player keys exist and
        // neither is a match for the current playerKey
        if (gameFull) {this.playerConnected.next(false);}

        // push the player2 key to the database and set
        // the p2ready flag to false if the slot is empty
        if (p2empty && !p1) {
          this.gamesRef.update(game.key, {
            player2: playerKey,
            p2ready: false
          });
        }
        // update the playerConnected subject if there's
        // a match
        if (p1 || p2) {this.playerConnected.next(true);}
      }
    );
  }

  // createShips()
  // creates the initial unplaced ships for the current player and current game
  createShips(game: GameDoc, playerKey: string): void {
    game.shipArgs.forEach(
      (n) => {
        this.shipsRef.push({
          size: n,
          row: 0,
          col: 0,
          placed: false,
          direction: "x",
          playerKey,
          gameKey: game.key
        });
      }
    );
  }

  // updateShip()
  // push any updated data for a given ship to the database
  updateShip(shipKey: string, data: any): void {
    this.shipsRef.update(shipKey, data)
  }
}
