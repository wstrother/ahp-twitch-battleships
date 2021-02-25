import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDatabaseService } from 'src/app/services/game.database.service';

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
    this.db.createGame({
      name: this.gameName,
      boardWidth: this.boardWidth,
      totalCells: this.totalCells,
      shipArgs: [5, 4, 4, 3, 2] // add UI for ship args later
    }).then(
      (data: any) => {
        this.router.navigate(["/place", {id: data.key}]);
      },
      (err) => {console.log(err)}
    );
  }
}
