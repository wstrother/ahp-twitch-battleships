import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { GameService } from 'src/app/services/game.service';


@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Observable<Board>;
  ships: Observable<Ship[]>;
  donePlacing: boolean = false;

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private gs: GameService
  ) { }

  ngOnInit(): void {
    
    const handleConnection = ({game, connected, playerKey}: GameConnection) => {

      let ready = game.getReady(playerKey);

      if (connected && !ready) {

        this.ships = this.gs.getCurrentShips()

        this.board = this.bs.getBoard().pipe(
          tap((board) => {
            this.bs.loadCurrentShips(board);
          })
        );

      }
      
      if (connected && ready) {
        this.startGame();
      }

    }

    this.db.onGameConnection().subscribe(
        handleConnection
    );
  }

  startGame(): void {
    this.db.getCurrentGame().pipe(take(1))
      .subscribe(game => {
        this.router.navigate(["/play"], {queryParams: {'game': game.key}});
      });
  }
}
