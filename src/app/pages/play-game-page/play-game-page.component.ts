import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, partition, Subject } from 'rxjs';
import { last, take } from 'rxjs/operators';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { Shot } from 'src/app/models/shot';
import { BoardService, ShotAlert } from 'src/app/services/board.service';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-play-game-page',
  templateUrl: './play-game-page.component.html',
  styleUrls: ['./play-game-page.component.css']
})
export class PlayGamePageComponent implements OnInit {
  playerBoard: Board;
  otherBoard: Board;

  playerShips: Ship[] = [];
  otherShips: Ship[] = [];

  private _currentShots: Shot[] = [];
  private _otherShots: Shot[] = [];

  private currentShotsLoaded: boolean = false;
  private currentAlerts: Subject<string> = new Subject();
  
  private otherShotsLoaded: boolean = false;
  private otherAlerts: Subject<string> = new Subject();

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private gs: GameService
  ) { }

  ngOnInit(): void {
    const handleConnection = ({game, connected, playerKey}: GameConnection) => {

      let ready = game.getReady(playerKey);

      if (connected && ready) {

        this.setBoards();
        this.setAlerts();
      }
      
      if (connected && !ready) {
        this.gotoPlacement();
      }

    }

    this.db.onGameConnection().subscribe(
        handleConnection
    );
  }

  setAlerts(): void {
    this.db.getPlayerKey().pipe(take(1))
      .subscribe(
        (playerKey: string) => {
          const [current, other] = partition(this.bs.getAlerts(),
            (sa: ShotAlert) => { return sa.shot.playerKey === playerKey }
          )

          current.subscribe((sa: ShotAlert) => { 
            this.currentAlerts.next(`YOU: ${sa.message}`); 
          });
          other.subscribe((sa: ShotAlert) => { 
            this.otherAlerts.next(`OTHER: ${sa.message}`); 
          });
        }
      )
  }

  setBoards(): void {
    const checkToHandle = (list: Shot[], board: Board, shot: Shot) => {
      if (list.every(s => !shot.check(s))) {
        list.push(shot);
        this.bs.handleShot(board, shot);
      }
    }

    combineLatest([
      this.bs.getBoard(),
      this.bs.getBoard()
    ]).subscribe(
      (boards: Board[]) => {

        this.bs.loadCurrentShips(boards[0]);
        this.otherBoard = boards[0];
        this.gs.getOtherShots().subscribe(
          (shots: Shot[]) => { 
            shots.forEach(shot => {
              checkToHandle(this._otherShots, boards[0], shot);
            });

            if (!this.otherShotsLoaded) {
              this.otherAlerts.subscribe(console.log);
            }
            this.otherShotsLoaded = true;
          }
        );


        this.bs.loadOtherShips(boards[1]);
        this.playerBoard = boards[1];
        
        this.gs.getCurrentShots().pipe(take(1)).subscribe(
          (shots: Shot[]) => { 
            shots.forEach(shot => {
              checkToHandle(this._currentShots, boards[1], shot);
            });

            if (!this.currentShotsLoaded) {
              this.currentAlerts.subscribe(console.log);
            }
            this.currentShotsLoaded = true;
          }
        );
      }
    );

  }

  gotoPlacement(): void {
    this.db.getCurrentGame().pipe(take(1))
      .subscribe(game => {
        this.router.navigate(["/place"], {queryParams: {'game': game.key}});
      });
  }
}
