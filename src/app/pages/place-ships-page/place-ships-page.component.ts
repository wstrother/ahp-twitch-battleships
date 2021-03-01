import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameDatabaseService } from 'src/app/services/game.database.service';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { combineLatest, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ConnectionStatus, Game } from 'src/app/models/game';


@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Observable<Board>;
  ships: Observable<Ship[]>;
  status: Observable<ConnectionStatus>;
  donePlacing: boolean = false;

  errorMessage: string;

  constructor(
    private route: ActivatedRoute, private router: Router, 
    private db: GameDatabaseService, private bs: BoardService
  ) { }

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

      let ready = game.getReady(playerKey);

      if (connection && !ready) {
        this.ships = this.db.getCurrentShips().pipe(
          tap((ships) => {
            this.donePlacing = ships.every(s => s.placed);
          })
        );
        this.board = this.bs.getBoard().pipe(
          tap((board) => {
            this.bs.loadCurrentShips(board);
          })
        );
        this.status = this.setStatus(playerKey);
      } else {
        this.errorMessage = "You've already started playing!"
        this.startGame();
      }

    }

    allLoaded.subscribe(
        handleConnection, 
        handleError
    );
  }

  setStatus(playerKey: string): Observable<ConnectionStatus> {
    return this.db.getCurrentGame().pipe(
      map((game: Game) => {
        return game.getConnectionStatus(playerKey);
      })
    );
  }

  startGame(): void {
    let gameKey = this.route.snapshot.paramMap.get('game');
    this.router.navigate(["/play", {game: gameKey}])
  }
}
