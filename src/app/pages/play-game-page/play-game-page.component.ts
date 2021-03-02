import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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


  }
}
