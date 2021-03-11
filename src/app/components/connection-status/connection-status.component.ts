import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, from, Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { ConnectionStatus, Game } from 'src/app/models/game';


@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.css']
})
export class ConnectionStatusComponent implements OnInit {
  title: string = "Welcome to AHP's Battleships App";

  errorMessage: string;
  playerNum: number;
  otherStage: number;

  constructor(private db: DatabaseService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.db.getUserId().subscribe(
      (uid: string) => {
        console.log("uid:", uid);
      }
    );

    this.getGameParam()
      .pipe(
        filter(gameKey => !!gameKey),
        
        switchMap((gameKey) => {
          this.db.setGameKey(gameKey);

          return combineLatest([
            this.db.getCurrentGame(),
            this.db.getUserId()
          ])
        })
      )
      .subscribe(
        ([game, id]) => {
          this.title = game.name;
          this.setStatus(game, id);
        },
        () => { this.errorMessage = "Error connecting to game!"; }
    );

      

    // const handleError = (err: Error) => {
    //   this.errorMessage = {
    //     NoGameError: `Sorry, but there was an error finding your game. Please ensure you copied the URL correctly.`,
    //     FullGameError: `Sorry, but this game already has two players!`
    //   }[err.name];
    // }

    // const handleConnection = (
    //   {game, playerKey, connected}: GameConnection
    // )  => {
    //   if (connected) {
    //     this.title = game.name;

    //     // this.getConnectionStatus(playerKey).subscribe(
    //     //   (status: ConnectionStatus) => {
    //     //     this.playerNum = status.playerNum

    //     //     if (!status.otherConnected) { 
    //     //       this.otherStage = 1
    //     //     }
    //     //     if (status.otherConnected && !status.otherReady) {
    //     //       this.otherStage = 2;
    //     //     }
    //     //     if (status.otherReady) {
    //     //       this.otherStage = 3;
    //     //     }

    //     //   }
    //     // )
    //   }
    // }

    // this.db.onGameConnection().subscribe(
    //   handleConnection,
    //   handleError
    // );
  }

  getGameParam(): Observable<string> {
    return this.route.queryParams.pipe(
      map(params => params["game"])
    );
  }

  setStatus(game: Game, id: string): void {
    let status = game.getConnectionStatus(id);

    this.playerNum = status.playerNum

    if (!status.otherConnected) { 
      this.otherStage = 1
    }
    if (status.otherConnected && !status.otherReady) {
      this.otherStage = 2;
    }
    if (status.otherReady) {
      this.otherStage = 3;
    }
  }
}
