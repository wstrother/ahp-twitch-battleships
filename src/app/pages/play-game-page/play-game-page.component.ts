import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { BoardService } from 'src/app/services/board.service';
import { GameDatabaseService } from 'src/app/services/game.database.service';

@Component({
  selector: 'app-play-game-page',
  templateUrl: './play-game-page.component.html',
  styleUrls: ['./play-game-page.component.css']
})
export class PlayGamePageComponent implements OnInit {
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

      if (connection) {

        this.db.getCurrentShips().subscribe(
          (ships) => {
            
            if (!ships.every(s => s.placed)) {
              this.errorMessage = "You're not done placing your ships yet!"
              this.router.navigate(["place", {
                game: this.route.snapshot.paramMap.get('game')
              }]);
            
            } else {
              this.db.setReady();
            }
          }
        );

      }
    }

    allLoaded.subscribe(
      handleConnection, 
      handleError
  );
  }
}
