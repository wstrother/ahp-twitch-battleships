import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { ConnectionStatus, Game } from 'src/app/models/game';

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.css']
})
export class ConnectionStatusComponent implements OnInit {
  title: string;

  errorMessage: string;
  playerNum: number;
  otherStage: number;

  constructor(private db: DatabaseService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getGameParam().subscribe(
      (gameKey) => {
        if (gameKey) {
          this.db.setGameKey(gameKey);
          this.db.connectToGame();
        } else {
          this.title = "Welcome to AHP's Battleships App";
        }
      }
    );

    const handleError = (err: Error) => {
      this.errorMessage = {
        NoGameError: `Sorry, but there was an error finding your game. Please ensure you copied the URL correctly.`,
        FullGameError: `Sorry, but this game already has two players!`
      }[err.name];
    }

    const handleConnection = (
      {game, playerKey, connected}: GameConnection
    )  => {
      if (connected) {
        this.title = game.name;
        this.getConnectionStatus(playerKey).subscribe(
          (status: ConnectionStatus) => {
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
        )
      }
    }

    this.db.onGameConnection().subscribe(
      handleConnection,
      handleError
    );
  }

  getGameParam(): Observable<string> {
    return this.route.queryParams.pipe(
      map(params => params["game"])
    );
  }

  getConnectionStatus(playerKey: string): Observable<ConnectionStatus> {
    return this.db.getCurrentGame().pipe(
      map((game: Game) => {
        return game.getConnectionStatus(playerKey);
      })
    );
  }


}
