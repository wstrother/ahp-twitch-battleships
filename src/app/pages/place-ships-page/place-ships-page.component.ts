import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDatabaseService } from 'src/app/services/game.database.service';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { combineLatest, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Game } from 'src/app/models/game';

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
  board: Observable<Board>;
  ships: Observable<Ship[]>;

  errorMessage: string = "";
  status: PlayerStatus = new PlayerStatus();

  constructor(private route: ActivatedRoute, private db: GameDatabaseService, private bs: BoardService) { }

  ngOnInit(): void {
    
    this.db.setCurrentGame(this.route.snapshot.paramMap.get('game'));
    this.db.connectPlayer();


    const handleError = (err: Error) => {
      this.errorMessage = {
        NoGameError: `Sorry, but there was an error finding your game. Please ensure you copied the URL correctly.`,
        FullGameError: `Sorry, but this game already has two players!`
      }[err.name];
    }


    const allLoaded = combineLatest([
        this.db.getCurrentGame(),
        this.db.getConnection(),
        this.db.getPlayerKey()
      ]).pipe(take(1));
    
      
    const handleConnection = ([game, connection, playerKey]) => {

      if (connection) {
        const playerNum = (game.player1 === playerKey) ? 1 : 2;

        this.ships = this.db.getCurrentShips();
        this.board = this.bs.getBoard().pipe(
          tap((board) => {
            this.bs.loadCurrentShips(board);
          })
        );

        // this.setStatus(playerNum); 
      }

    }

    allLoaded.subscribe(
        handleConnection, 
        handleError
    );
  }

  // setStatus(playerNum: number): void {
  //   this.status.playerNum = playerNum;

  //   const getStatusObj = (key: string | undefined, ready: boolean) => {
  //     return {
  //       opponentConnected: key !== undefined,
  //       opponentReady: ready
  //     }
  //   }

  //   const handleGame = (game: Game) => {
  //     let status = [
  //       getStatusObj(game.player1, game.p1ready),
  //       getStatusObj(game.player2, game.p2ready)
  //     ]

  //     let other = playerNum == 1 ? status[1] : status[0];
  //     Object.assign(this.status, other);
  //   }

  //   this.db.getCurrentGame().subscribe(handleGame);
  // }

  startGame(): void {
    console.log("starting...");
  }
}
