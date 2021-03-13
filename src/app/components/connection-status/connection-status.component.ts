import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { DatabaseService } from 'src/app/services/database.service';
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
    this.db.userId$.subscribe(
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
            this.db.currentGame$,
            this.db.userId$
          ])
        })
      )
      .subscribe(
        ([game, id]) => {
          this.title = game.name;
          this.setStatus(game, id);
        }
    );

    this.db.errorMessage$.subscribe(
      (msg: string) => { this.errorMessage = msg; }
    )
  }

  getGameParam(): Observable<string> {
    return this.route.queryParams.pipe(
      map(params => params["game"])
    );
  }

  setStatus(game: Game, id: string): void {
    let status: ConnectionStatus = game.getConnectionStatus(id);

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
