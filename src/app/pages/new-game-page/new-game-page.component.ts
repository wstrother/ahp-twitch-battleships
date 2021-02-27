import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { GameDatabaseService, GameDoc } from 'src/app/services/game.database.service';

@Component({
  selector: 'app-new-game-page',
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.css']
})
export class NewGamePageComponent implements OnInit {
  boardWidth: number = 10;
  totalCells: number = 100;
  gameName: string = "New Game";
  
  constructor(private router: Router, private db: GameDatabaseService) { }

  ngOnInit(): void {
  }

  makeGame(): void {
    // passes form data to the database to create a new game
    // and returns a promise to get the gameKey
    // use the gameKey when returned to navigate to the '/place/
    // page with gameKey as 'game' parameter
    this.db.createGame({
      name: this.gameName,
      boardWidth: this.boardWidth,
      totalCells: this.totalCells,
      shipArgs: [5, 4, 4, 3, 2] // add UI for ship args later
    }).subscribe(
      done => done.then(console.log)
    )
    // .then(
    //   (gameKey) => {
    //     this.router.navigate(["/place", {'game': gameKey}]);
    //   }
    // )
    // add .catch later to provide front end error handling to the
    // html template
  }
}
