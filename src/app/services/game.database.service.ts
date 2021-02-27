import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList,  SnapshotAction } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, Subject, combineLatest, Subscription } from 'rxjs';
import { first, map, mergeMap, take } from 'rxjs/operators';
import { DatabaseReference } from '@angular/fire/database/interfaces';



// database document classes

export class GameDoc {
  player1: string;
  player2: string;
  key: string;
  boardWidth: number;
  totalCells: number;
  shipArgs: number[];

  static getFromSnapshot(action: SnapshotAction<any>): GameDoc {
    if (action.key === null) {
      throw Error("Database error ocurred!")
    }
    let g = new GameDoc();
    g.key = action.key
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
  constructor(gameKey: string) {
    super(`Game with key ${gameKey} already has two players`);
    this.name = "FullGameError";
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameDatabaseService {
  private gamesRef: AngularFireList<any>;
  private playersRef: AngularFireList<any>;
  private shipsRef: AngularFireList<any>;

  private currentGame: Subject<GameDoc> = new Subject();
  private currentShips: Subject<ShipDoc[]> = new Subject();
  private otherShips: Subject<ShipDoc[]> = new Subject();
  
  private playerKey: Subject<string> = new BehaviorSubject("");
  private playerConnected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private af: AngularFireDatabase) {
    this.gamesRef = this.af.list("/games");
    this.playersRef = this.af.list("/players");
    this.shipsRef = this.af.list("/ships");

    this.checkPlayer();
  }
  
  // getPlayerKey()
  // returns an observable of the playerKey to ensure that
  // methods which require the playerKey value only execute
  // once it has been checked against the database
  getPlayerKey(): Observable<string> {
    return this.playerKey.asObservable().pipe(
      first(s => s !== "")    // this presumes that checkPlayer() is only called once
      //                      // and no other methods push a value to this observable!
    );
  }

  // getCurrentGame()
  // returns an observable of the current game as a GameDoc object
  // and ensures that it only ever emits a single value
  getCurrentGame(): Observable<GameDoc> {
    return this.currentGame.asObservable().pipe(
      take(1)
    )
  }

  // checkPlayer()
  // check for player when the app is loaded
  checkPlayer(): void {
    // helper function that sets localStorage 'playerKey' item
    // and passes the same value to the playerKey subject
    const updatePlayerKey = (key: string) => {
      this.playerKey.next(key);
      localStorage.setItem("playerKey", key);
      console.log(`PlayerKey set to ${key}`)
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
        p1ready: false
      }).then(r => r.key));
    }
    
    // get the playerKey and pipe it to the getGameKey
    // Observable instead
    return this.getPlayerKey().pipe(
      take(1),
      mergeMap(getGameKey)
    );
  }

  // setCurrentGame()
  // used by place-ships-page and play-game-page to set a reference
  // to the current game through the route 'id' parameter
  setCurrentGame(gameKey: string): void {
    // set a reference to the current game from the database
    // as a Subject<GameDoc>
    this.af.object(`games/${gameKey}`)
      .snapshotChanges().pipe(
        take(1),
        map((game) => GameDoc.getFromSnapshot(game))
      ).subscribe(
      (game) => {
        this.currentGame.next(game);

        // when the game is found in the database, set
        // ships for the current player
        this.setShips(game);
      },
      (err) => {
        console.log(`No game was found with key: ${gameKey}`);
        throw err;
      }
    );
  }

  // connectPlayer()
  // ensures that the current playerKey is associated to the current game
  // in the database
  connectPlayer(): void {
    // combine playerKey and currentGame values
    combineLatest([
      this.getPlayerKey(),
      this.getCurrentGame()
    ]).subscribe(
      ([playerKey, game]) => {
        // set booleans for each playerKey match
        // and whether or not the player2 value
        // should be pushed to the database
        const p1 = game.player1 === playerKey;
        const p2 = game.player2 === playerKey;
        const make2 = !p1 && game.player2 === undefined;
        const gameFull = !(p1 || p2 || make2);

        // throw an error if both player keys exist and
        // neither is a match for the current playerKey
        if (gameFull) {throw new FullGameError(game.key);}

        // push the player2 key to the database and set
        // the p2ready flag to false if the slot is empty
        if (make2) {
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

  // setCurrentShips()
  // caled after the setCurrentGame method resolves a document in
  // the database for the current game and creates the initial ships
  // for the current player if none are found in the database
  //
  // TODO: decompose into two separate methods for "/place" and "/play"
  // routes. The "/place" route doesn't need reference to otherShips
  // and may needlessly prolong subscription to the database list query
  setShips(game: GameDoc): void {
    // create an Observable on the '/ships' collection where items
    // match the current gameKey
    const shipsFilter = (ref: DatabaseReference) => ref.orderByChild("gameKey").equalTo(game.key);
    const shipsList$ = this.af.list("/ships", shipsFilter).snapshotChanges()
      .pipe(map(ships => ships.map(s => ShipDoc.getFromSnapshot(s)))
    );

    // destructure the getPlayerKey() and shipsList observables into
    // the playerKey string, and a current / other list for the
    // ShipDoc list, 
    const splitShips = ([playerKey, ships]) => {
      return {
        playerKey,
        current: ships.filter((s: ShipDoc) => s.playerKey === playerKey),
        other: ships.filter((s: ShipDoc) => s.playerKey !== playerKey)
      }
    }

    // declare subscription variable so that it can be cancelled
    let sub: Subscription;

    const handleShips = ({playerKey, current, other}) => {
      // if no ships are found belonging to the current player they are
      // generated and added to the database
      if (current.length === 0) {
        this.createShips(game, playerKey);
      }

      // pass both lists of ships to their respective Subjects
      this.currentShips.next(current);
      this.otherShips.next(other);

      // if both lists of ships match the number of ship arguments
      // in the GameDoc's parameters then unsubscribe from the list
      let currentDone = current.length === game.shipArgs.length;
      let otherDone = other.length === game.shipArgs.length;
      if (currentDone && otherDone) {sub.unsubscribe();}
    }

    // combine subscriptions to the playerKey and shipsList
    // and subscribe
    sub = combineLatest([
      this.getPlayerKey(),
      shipsList$
    ]).pipe(          //  -> [playerKey, ships]
      map(splitShips) //  -> {playerkey, current, other}
    ).subscribe(handleShips);
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
