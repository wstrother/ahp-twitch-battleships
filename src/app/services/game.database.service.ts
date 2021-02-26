import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject, SnapshotAction } from '@angular/fire/database';
import { from, Observable, Subject } from 'rxjs';
import { Ship } from '../models/ship';
import { first, map, mergeMap } from 'rxjs/operators';



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
  playerKey: string;
  gameSet: boolean = false;

  constructor(private af: AngularFireDatabase) {
      this.gamesRef = this.af.list("/games");
      this.playersRef = this.af.list("/players");
      this.shipsRef = this.af.list("/ships");
      this.checkPlayer();
    }

    // check for player when the app is loaded

   checkPlayer(): void {
     // check localStorage for stored playerKey
    if (localStorage.getItem("playerKey")) {
      this.playerKey = localStorage.getItem("playerKey");

      // if stored playerKey is found, ensure there's a corresponding
      // document in the database
      this.af.object(`players/${this.playerKey}`).valueChanges()
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
         this.playerKey = data.key;
       },
       (err) => {
         console.log(err);
       }
     );
   }

   // createGame()
   // used by new-game-page to generate a game for the database
   // and set the current game using form data from the UI

  createGame({name, boardWidth, totalCells, shipArgs}): void {
    // push initial game parameters to the database and assign
    // the current playerKey to player1
    this.gamesRef.push({
      name,
      boardWidth,
      totalCells,
      shipArgs,
      player1: this.playerKey
    }).then(
      (data) => {
        this.setCurrentGame(data.key);
      }
    );
  }

  // setCurrentGame()
  // used by new-game-page when createGame is called and also
  // the place-ships-page and play-game-page to set a reference
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
        this.gameSet = true;

        // when the game is found in the database, set
        // ships for the current player
        this.setCurrentShips(game);
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

  setCurrentShips(game: GameDoc): void {
    // creates an Observable on the '/ships' collection where items
    // match the current gameKey

    let SHIPS_CHECKED = false;

    this.af.list("/ships", ref => ref.orderByChild("gameKey").equalTo(game.key))
      .snapshotChanges().pipe(
        map(ships => ships.map(g => ShipDoc.getFromSnapshot(g)))
      ).subscribe(
        (ships) => {
          // pipes the results of the filtered query to the currentShips subject
          // as ShipDoc objects
          this.currentShips.next(ships);

          // filter the matching ships for those belonging to the current player
          // if none are detected then the initial args are passed to createShips
          if (!SHIPS_CHECKED) {
            SHIPS_CHECKED = true;
            let current = ships.filter(ship => ship.playerKey === this.playerKey);
            if (current.length === 0) {
              this.createShips(game, this.playerKey);
            }
          }
        }
      );
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
}
