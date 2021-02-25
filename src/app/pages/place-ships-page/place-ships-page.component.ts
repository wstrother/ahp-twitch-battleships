import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDatabaseService } from 'src/app/services/game.database.service';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';

@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Board;
  ships: Ship[];

  constructor(private route: ActivatedRoute, private db: GameDatabaseService, private bs: BoardService) { }

  ngOnInit(): void {
    this.db.setCurrentGame(this.route.snapshot.paramMap.get('id'));

    this.db.getGameParams().subscribe(
      (data: any) => {
        this.board = this.bs.getBoard(data.boardWidth, data.totalCells);
        // this.ships = this.bs.getShips(data.shipArgs);
      }
    );
    
  }
}
