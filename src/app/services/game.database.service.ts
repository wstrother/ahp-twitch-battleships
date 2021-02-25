import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Ship } from '../models/ship';

@Injectable({
  providedIn: 'root'
})
export class GameDatabaseService {
  private gamesRef: AngularFireList<any>;
  private playersRef: AngularFireList<any>;
  private shipsRef: AngularFireList<any>;
  private currentGame: AngularFireObject<any>;
  gameKey: string;
  playerKey: string;
  ships: Ship[] = [];

  constructor(private af: AngularFireDatabase) {
      this.gamesRef = this.af.list("/games");
      this.playersRef = this.af.list("/players");
      this.shipsRef = this.af.list("/ships");
      this.checkPlayer();
   }

   checkPlayer(): void {
    if (localStorage.getItem("playerKey")) {
      this.playerKey = localStorage.getItem("playerKey");
    } else {
      this.createPlayer();
    }
   }

   createPlayer(): void {
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

  createGame(game: any) {
    return this.gamesRef.push({
      name: game.name,
      boardWidth: game.boardWidth,
      totalCells: game.totalCells,
      shipArgs: game.shipArgs,
      player1: this.playerKey
    });
  }

  setCurrentGame(gameKey: string): void {
    this.currentGame = this.af.object(`games/${gameKey}`);
    this.gameKey = gameKey;
  }

  getGameParams(): any {
    return this.currentGame.valueChanges();
  }

  getCurrentShips() {
    
  }

  createShip(ship: Ship) {
  //   if (this.gameKey) {
  //     this.shipsRef.push({
  //       game: this.gameKey,
  //       size: ship.size,
  //       direction: ship.direction,
  //       placed: ship.placed
  //     }).then(
  //       () => {console.log("Placed ship:", ship)}
  //     )
  //   } else {
  //     console.log("currentGame not set!");
  //   }
  }
}
