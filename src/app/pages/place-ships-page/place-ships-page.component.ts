import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { switchMap, take, tap } from 'rxjs/operators';
import { DatabaseService } from 'src/app/services/database.service';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Subscription } from 'rxjs';
import { PlaceShipsInfoComponent } from 'src/app/blurbs/place-ships-info/place-ships-info.component';


@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Board;
  ships: Ship[];

  redirectCheck$: Subscription;

  get donePlacing(): boolean {
    return this.ships && this.ships.every(s => s.placed);
  }

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log("initializing place ships");

    this.bs.getBoard()
      .pipe(
        tap((board: Board) => { 
          this.board = board; 
        }),
        
        switchMap((board: Board) => this.db.playerShips$.pipe(
          take(1),

          tap((ships: Ship[]) => { 
            board.placeShips(ships); 
          })
        ))
      )
      .subscribe(
        (ships: Ship[]) => {
          this.ships = ships;
        }
    );

    this.redirectCheck$ = combineLatest([
      this.db.userId$,
      this.db.currentGame$
    ]).subscribe(
      ([uid, game]) => {
        if (game.getReady(uid)) {
          console.log("redirecting...");
          this.redirectCheck$.unsubscribe();
          this.gotoGame();
        }
      }
    );
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(StartGameDialogComponent);

    dialogRef.afterClosed().subscribe(
      (result: any) => {
        if (result) { this.startGame(); }
      }
    );
  }

  openHelp(): void {
    this.dialog.open(PlaceShipsInfoComponent);
  }

  startGame(): void {
    this.db.setReady();
    this.gotoGame();
  }

  gotoGame(): void {
    this.db.currentGame$.pipe(take(1))
      .subscribe(game => {
        console.log("going to play game");
        this.redirectCheck$.unsubscribe();
        this.router.navigate(["/play"], {queryParams: {'game': game.key}});
      });
  }
}

@Component({
  selector: 'app-start-game-dialog',
  template: `
  <mat-dialog-content>Confirm Start Game?</mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Confirm</button>
  </mat-dialog-actions>`
})
export class StartGameDialogComponent {}