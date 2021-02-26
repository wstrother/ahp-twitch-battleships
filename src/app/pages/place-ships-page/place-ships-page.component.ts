import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDatabaseService } from 'src/app/services/game.database.service';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Board;
  ships: Ship[];
  shipArgs: number[];

  private waitForShips: Subscription;

  constructor(private route: ActivatedRoute, private db: GameDatabaseService, private bs: BoardService) { }

  ngOnInit(): void {
    this.db.setCurrentGame(this.route.snapshot.paramMap.get('id'));

    this.db.currentGame.pipe(first()).subscribe(
      (g) => {
        this.board = this.bs.getBoard(g);
        this.shipArgs = g.shipArgs;
      }
    );

    this.waitForShips = this.db.currentShips.subscribe(
      (ships) => {
        if (this.shipArgs && ships.length === this.shipArgs.length) {
          this.ships = this.bs.getShips(this.board, ships);
          this.waitForShips.unsubscribe();
        }
      }
    );
    
  }
}
