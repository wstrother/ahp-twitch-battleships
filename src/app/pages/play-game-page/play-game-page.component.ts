import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, partition, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { Shot } from 'src/app/models/shot';
import { BoardService, PendingShot, ShotAlert } from 'src/app/services/board.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-play-game-page',
  templateUrl: './play-game-page.component.html',
  styleUrls: ['./play-game-page.component.css']
})
export class PlayGamePageComponent implements OnInit {
  playerBoard: Board;
  otherBoard: Board;
  gameReady: boolean = false;

  playerShips: Ship[] = [];
  otherShips: Ship[] = [];

  filter: string = "";
  pendingMessage: string;
  cancelMessage: string = "";
  pendingTime: number;

  private _currentShots: Shot[] = [];
  private _otherShots: Shot[] = [];

  private currentShotsLoaded: boolean = false;
  private currentAlerts: Subject<ShotAlert> = new Subject();
  
  private otherShotsLoaded: boolean = false;
  private otherAlerts: Subject<ShotAlert> = new Subject();

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    let boardsSet = false;

    const handleConnection = ([uid, game]) => {

      let ready = game.getReady(uid);
      let otherReady = game.otherReady(uid);

      if (ready) {

        if (!boardsSet) {
          this.setBoards();
          boardsSet = true;
        }
        
        if (!otherReady) {
          this.pendingMessage = "Waiting for opponent to place ships...";
        }
        
        if (otherReady) {
          this.pendingMessage = "";
          this.gameReady = true;
          this.setAlerts();
          this.setPending();
        }
      }
      
      else {
        this.gotoPlacement();
      }

    }

    combineLatest([
      this.db.userId$,
      this.db.currentGame$
    ]).subscribe(
        handleConnection
    );
  }

  get totalShots(): number {
    let total = 0;

    if (this.playerBoard) {
      this.playerBoard.cells.forEach(
        (cell) => {
          if (cell.shot) { total++; }
        }
      )
    }

    return total;
  }

  setFilter(event: any): void {
    if (event.code === "Escape") {
      this.filter = "";
    }

    this.playerBoard.filterCells(this.filter);
  }

  setPending(): void {
    this.bs.getPendingShot().subscribe(
      (p: null | PendingShot) => {
        if (p) {
          this.pendingMessage = `Firing at ${p.cell.data.name}`;
          this.pendingTime = p.time;
          this.cancelMessage = "(Click to cancel)"
        } else {
          this.pendingMessage = "";
        }
      }
    )
  }

  setAlerts(): void {
    this.db.userId$.pipe(take(1))
      .subscribe(
        (playerKey: string) => {
          const [current, other] = partition(this.bs.getAlerts(),
            (sa: ShotAlert) => { return sa.shot.player === playerKey }
          )

          current.subscribe((sa: ShotAlert) => { 
            this.currentAlerts.next(sa); 
          });
          other.subscribe((sa: ShotAlert) => { 
            this.otherAlerts.next(sa); 
          });
        }
      )
  }

  handleAlert(shotAlert: ShotAlert, self: boolean): void {
    let open = true;
    if (self && !shotAlert.hit) {
      open = false;
    }

    if (open) {
      this.snackBar.openFromComponent(ShotAlertComponent, {
        duration: 3000,
        data: {shotAlert, self}
      });
    }
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
    ]).pipe(
      tap((boards: Board[]) => {
        this.otherBoard = boards[0];
        this.playerBoard = boards[1];
      })
    ).subscribe(
      (boards: Board[]) => {

        this.db.playerShips$.pipe(take(1))
          .subscribe((ships) => {
            this.otherBoard.placeShips(ships);
          }
        );

        this.db.otherShips$.pipe(take(1))
          .subscribe((ships) => {
            this.playerBoard.placeShips(ships);
          }
        );

        this.db.getOtherShots().subscribe(
          (shots: Shot[]) => { 
            shots.forEach(shot => {
              checkToHandle(this._otherShots, boards[0], shot);
            });

            if (!this.otherShotsLoaded) {
              this.otherAlerts.subscribe(
                sa => { this.handleAlert(sa, false)}
              );
            }
            this.otherShotsLoaded = true;
          }
        );

        this.db.getCurrentShots().pipe(take(1)).subscribe(
          (shots: Shot[]) => { 
            shots.forEach(shot => {
              checkToHandle(this._currentShots, boards[1], shot);
            });

            if (!this.currentShotsLoaded) {
              this.currentAlerts.subscribe(
                sa => { this.handleAlert(sa, true)}
              );
            }
            this.currentShotsLoaded = true;
          }
        );


      }
    )
  }

  gotoPlacement(): void {
    this.db.currentGame$.pipe(take(1))
      .subscribe(game => {
        this.router.navigate(["/place"], {queryParams: {'game': game.key}});
      });
  }
}

@Component({
  selector: 'app-play-game-alert',
  template: `
  <span class='{{ cssClass }}'>{{ message }}</span>`,
  styleUrls: ['./play-game-page.component.css']
})
export class ShotAlertComponent implements OnInit {
  message: string;
  cssClass: string;
  self: boolean;
  shotAlert: ShotAlert;
  row: number;
  col: number;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.shotAlert = this.data.shotAlert;
    this.self = this.data.self;
    let shot = this.data.shotAlert.shot;
    this.row = shot.row;
    this.col = shot.col;

    this.message = this.getMessage();
    this.cssClass = this.getCss();
  }

  getMessage(): string {
    let cell = this.shotAlert.cell;
    let target = cell.data.name;
    let action: string;
    let coords = `row: ${this.row + 1}, col: ${this.col + 1}`

    if (cell.hasShip) {
      if (cell.ship.isSunk) {
        action = "Ship sunk";
      } else {
        action = "Direct hit";
      }
    } else {
      action = "Shot fired";
    }

    

    return `${action} at ${target}! (${coords})`;
  }

  getCss(): string {
    let sink = this.shotAlert.sink ? " alert-sink" : "";
    let good = this.self ? " alert-good" : " alert-bad";

    return "shot-alert" + sink + good;
  }
}