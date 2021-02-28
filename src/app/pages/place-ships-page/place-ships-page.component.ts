import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDatabaseService, GameDoc, ShipDoc } from 'src/app/services/game.database.service';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

class PlayerStatus {
  playerNum: number;
  opponentReady: boolean;
  opponentConnected: boolean;
}

@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Board;
  ships: Ship[];

  errorMessage: string = "";
  status: PlayerStatus = new PlayerStatus();

  constructor(private route: ActivatedRoute, private db: GameDatabaseService, private bs: BoardService) { }

  ngOnInit(): void {
    
    this.db.setCurrentGame(this.route.snapshot.paramMap.get('game'));
    this.db.connectPlayer();

    const handleError = (err: Error) => {
      if (err.name == "NoGameError") {
        this.errorMessage = `Sorry, but there was an error finding your game. Please ensure you copied the URL correctly.`
      }
      if (err.name == "FullGameError") {
        this.errorMessage = "Sorry, but this game already has two players!"
      }
    }

    combineLatest([
      this.db.getCurrentGame(),
      this.db.getConnection(),
      this.db.getPlayerKey()
    ]).pipe(take(1))
      .subscribe(([game, connection, playerKey]) => {

      if (connection) {
        const playerNum = (game.player1 === playerKey) ? 1 : 2;

        this.setBoard(game);
        this.setStatus(playerNum); 
      }

    }, handleError);
  }

  setStatus(playerNum: number): void {
    this.status.playerNum = playerNum;

    const getStatusObj = (key: string | undefined, ready: boolean) => {
      return {
        opponentConnected: key !== undefined,
        opponentReady: ready
      }
    }

    const handleGame = (game: GameDoc) => {
      let status = [
        getStatusObj(game.player1, game.p1ready),
        getStatusObj(game.player2, game.p2ready)
      ]

      let other = playerNum == 1 ? status[1] : status[0];
      Object.assign(this.status, other);
      
      console.log(this.status);
    }

    this.db.getCurrentGame().subscribe(handleGame);
  }

  setBoard(game: GameDoc): void {
    this.board = this.bs.getBoard(game);

    this.db.getCurrentShips().subscribe((ships) => {
      this.setShips(ships);
    });
  }

  setShips(ships: ShipDoc[]): void {
    this.ships = this.bs.getShips(this.board, ships);
  }
}
