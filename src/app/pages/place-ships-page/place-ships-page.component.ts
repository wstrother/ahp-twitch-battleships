import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDatabaseService, GameDoc } from 'src/app/services/game.database.service';
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
    // on loading the database sets the current game based on the route parameter
    // the GameDatabaseService should then initialize the currentShips observable
    // with the ships associated with this game, creating them if none are found
    // in the database (i.e. the first time this page is loaded)
    
    this.db.setCurrentGame(this.route.snapshot.paramMap.get('game'));
    // TODO:
    // add try catch block later to provide front end error handling
    // (i.e. database is down or a bad parameter is in the URL)
    

    // the GameDatabaseService creates a connection to the current playerKey if
    // they are not player1 and no player2 exists. If 2 other players already exist
    // an error is thrown
    this.db.connectPlayer();
    this.db.playerConnected.subscribe(console.log);
    // TODO:
    // add try catch blocks to update the frontend to reflect if the game is full
    // (i.e. two other player keys are already associated to the currentGame)

    //
    // when the GameDatabaseService sets the currentGame as a GameDoc object
    // the BoardService generates a Board object based on the GameDoc
    // and the GameDatabaseService should ensure that ships are generated
    // for the player
    this.db.currentGame.pipe(first()).subscribe(
      (game: GameDoc) => {
        this.board = this.bs.getBoard(game);
        this.shipArgs = game.shipArgs;
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
