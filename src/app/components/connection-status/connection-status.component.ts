import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { ConnectionStatus, Game } from 'src/app/models/game';

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.css']
})
export class ConnectionStatusComponent implements OnInit {
  status$: Observable<ConnectionStatus>;
  title: string = "Welcome to AHP's Battleships App";
  errorMessage: string;

  constructor(private db: DatabaseService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getGameParam().subscribe(
      (gameKey) => {
        this.db.setGameKey(gameKey);
        this.db.connectToGame();
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
        this.status$ = this.getConnectionStatus(playerKey)
      }
    }

    this.db.onGameConnection().subscribe(
      handleConnection,
      handleError
    );
  }

  getGameParam(): Observable<string> {
    return this.route.queryParams.pipe(
      map(params => params["game"]),
      filter(game => game)
    )
  }

  getConnectionStatus(playerKey: string): Observable<ConnectionStatus> {
    return this.db.getCurrentGame().pipe(
      map((game: Game) => {
        return game.getConnectionStatus(playerKey);
      })
    );
  }


}
