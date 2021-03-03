import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/game';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-new-game-page',
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.css']
})
export class NewGamePageComponent implements OnInit {
  game: Game = new Game("New Game", 10, 100);
  
  constructor(private router: Router, private db: DatabaseService) { }

  ngOnInit(): void {
    if (this.db.gameLoaded) {
      window.location.reload();
    }
  }

  makeGame(): void {
    // passes form data to the database to create a new game
    // and returns a promise to get the gameKey
    // use the gameKey when returned to navigate to the '/place/
    // page with gameKey as 'game' parameter
    this.game.shipArgs = [5, 4, 3, 3, 2];

    this.db.createGame(this.game).subscribe(
      () => {
        this.router.navigate(["/place"], {queryParams: {'game': this.game.key}});
      }
    );
    // TODO:
    // add .catch later to provide front end error handling to the
    // html template
  }
}
