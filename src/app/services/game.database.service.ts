import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList,  SnapshotAction } from '@angular/fire/database';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first, map, last, filter } from 'rxjs/operators';
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


@Injectable({
  providedIn: 'root'
})
export class GameDatabaseService {
  private gamesRef: AngularFireList<any>;
  private playersRef: AngularFireList<any>;
  private shipsRef: AngularFireList<any>;

  currentGame: Subject<GameDoc> = new Subject();
  currentShips: Subject<ShipDoc[]> = new Subject();
  otherShips: Subject<ShipDoc[]> = new Subject();
  
  playerKey: Subject<string> = new BehaviorSubject("");
  playerConnected: Subject<boolean> = new Subject();
  // gameSet: boolean = false;


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
      filter(s => s !== ""),
      first()     // this presumes that checkPlayer() is only called once!
      //          // and no other methods push a value to this observable!
    );
  }

  // check for player when the app is loaded

  checkPlayer(): void {
    // check localStorage for stored playerKey
    if (localStorage.getItem("playerKey")) {
      const playerKey = localStorage.getItem("playerKey");

      this.playerKey.next(playerKey);

      // if stored playerKey is found, ensure there's a corresponding
      // document in the database
      this.af.object(`players/${playerKey}`).valueChanges()
        .pipe(first()).subscribe(
        (doc) => {
          // if nothing is found in the database, call createPlayer
          // and generate a new key
          if (doc === null) {
            this.createPlayer();
          }
        }
      );
    } else {
      // if no playerKey in localStorage, generate a new one
      this.createPlayer();
    }
  }

  createPlayer(): void {
    // creates a player document with the current timestamp and
    // saves the key in localStorage
    this.playersRef.push({
      "time": Date.now()
    }).then(
      (data) => {
        localStorage.setItem("playerKey", data.key);
        this.playerKey.next(data.key);
      },
      (err) => {
        console.log(err);
      }
    );
  }

   // createGame()
   // used by new-game-page to generate a game for the database
   // and set the current game using form data from the UI

  createGame({name, boardWidth, totalCells, shipArgs}): Observable<Promise<string>> {
    // push initial game parameters to the database and assign
    // the current playerKey to player1

    console.log("creating game...");

    return this.getPlayerKey().pipe(
      map(async (playerKey) => {
        const data = await this.gamesRef.push({
          name,
          boardWidth,
          totalCells,
          shipArgs,
          player1: playerKey,
          p1ready: false
        });
        return data.key;
      })
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
        first(),
        map((game) => GameDoc.getFromSnapshot(game))
      ).subscribe(
      (game) => {
        this.currentGame.next(game);
        // this.gameSet = true;

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

  // setCurrentShips()
  // caled after the setCurrentGame method resolves a document in
  // the database for the current game and creates the initial ships
  // for the current player if none are found in the database

  setShips(game: GameDoc): void {
    // creates an Observable on the '/ships' collection where items
    // match the current gameKey

    let SHIPS_CHECKED = false;

    const shipsFilter = (ref: DatabaseReference) => ref.orderByChild("gameKey").equalTo(game.key);
    
    const shipsList = this.af.list("/ships", shipsFilter).snapshotChanges()
      .pipe(map(ships => ships.map(s => ShipDoc.getFromSnapshot(s)))
    );

    this.getPlayerKey().subscribe(
      (playerKey: string) => {
        shipsList.subscribe((ships: ShipDoc[]) => {
          this.otherShips.next(ships.filter(s => s.playerKey !== playerKey));

          let currentShips = ships.filter(s => s.playerKey === playerKey);
          if (!SHIPS_CHECKED) {
            SHIPS_CHECKED = true;
            if (currentShips.length === 0) {this.createShips(game, playerKey)}
          }
          this.currentShips.next(currentShips);
        })
      }
    );

    // this.af.list("/ships", shipsFilter)
    //   .snapshotChanges().pipe(
    //     map(ships => ships.map(g => ShipDoc.getFromSnapshot(g)))
    //   ).subscribe(
    //     (ships) => {
    //       // pipes the results of the filtered query to the currentShips subject
    //       // as ShipDoc objects array, once the number 
    //       this.currentShips.next(ships);

    //       // filter the matching ships for those belonging to the current player
    //       // if none are detected then the initial args are passed to createShips
    //       if (!SHIPS_CHECKED) {
    //         SHIPS_CHECKED = true;
    //         let current = ships.filter(ship => ship.playerKey === this.playerKey);
    //         if (current.length === 0) {
    //           this.createShips(game, this.playerKey);
    //         }
    //       }
    //     }
    //   );
  }

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

  updateShip(shipKey: string, data: any): void {
    this.shipsRef.update(shipKey, data).then(
      (resp) => {
        console.log("Updated ship " + shipKey);
        console.log(data);
      }
    );
  }
}
