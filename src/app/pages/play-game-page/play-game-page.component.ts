import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { Shot } from 'src/app/models/shot';
import { BoardService } from 'src/app/services/board.service';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-play-game-page',
  templateUrl: './play-game-page.component.html',
  styleUrls: ['./play-game-page.component.css']
})
export class PlayGamePageComponent implements OnInit {
  playerBoard: Board;
  otherBoard: Board;

  playerShips: Ship[] = [];
  otherShips: Ship[] = [];

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private gs: GameService
  ) { }

  ngOnInit(): void {
    const handleConnection = ({game, connected, playerKey}: GameConnection) => {

      let ready = game.getReady(playerKey);

      if (connected && ready) {

        this.setBoards();

      }
      
      if (connected && !ready) {
        this.gotoPlacement();
      }

    }

    this.db.onGameConnection().subscribe(
        handleConnection
    );

  }

  setBoards(): void {
    combineLatest([
      this.bs.getBoard(),
      this.bs.getBoard()
    ]).subscribe(
      (boards: Board[]) => {

        this.bs.loadCurrentShips(boards[0]);
        this.otherBoard = boards[0];
        this.gs.getOtherShots().subscribe(
          (shot: Shot) => {
            this.bs.handleShot(boards[0], shot.row, shot.col);
          }
        );

        this.bs.loadOtherShips(boards[1]);
        this.playerBoard = boards[1];
        this.gs.getCurrentShots().subscribe(
          (shots: Shot[]) => {
            shots.forEach(shot => this.bs.handleShot(boards[1], shot.row, shot.col));
          }
        );

      }
    );

  }

  gotoPlacement(): void {
    this.db.getCurrentGame().pipe(take(1))
      .subscribe(game => {
        this.router.navigate(["/place"], {queryParams: {'game': game.key}});
      });
  }
}
