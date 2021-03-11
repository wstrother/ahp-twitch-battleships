import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import { Board } from 'src/app/models/board';
import { Ship } from 'src/app/models/ship';
import { take } from 'rxjs/operators';
import { DatabaseService, GameConnection } from 'src/app/services/database.service';
import { GameService } from 'src/app/services/game.service';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-place-ships-page',
  templateUrl: './place-ships-page.component.html',
  styleUrls: ['./place-ships-page.component.css']
})
export class PlaceShipsPageComponent implements OnInit {
  board: Board;
  ships: Ship[];

  get donePlacing(): boolean {
    return this.ships && this.ships.every(s => s.placed);
  }

  constructor(
    private router: Router, 
    private db: DatabaseService, 
    private bs: BoardService,
    private gs: GameService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // const handleConnection = ({game, connected, playerKey}: GameConnection) => {

    //   let ready = game.getReady(playerKey);

    //   if (connected && !ready) {

    //     this.setShips();

    //     this.setBoard();

    //   }
      
    //   if (connected && ready) {
    //     this.gotoGame();
    //   }

    // }

    // this.db.onGameConnection().subscribe(
    //     handleConnection,
    //     (err) => {console.log(err.name)}
    // );
  }

  // openDialog(): void {
  //   let dialogRef = this.dialog.open(StartGameDialogComponent);

  //   dialogRef.afterClosed().subscribe(
  //     (result: any) => {
  //       if (result) { this.startGame(); }
  //     }
  //   );
  // }

  // setShips(): void {
  //   this.gs.getCurrentShips().subscribe(
  //     (ships) => { this.ships = ships }
  //   )
  // }

  // setBoard(): void {
  //   this.bs.getBoard().subscribe(
  //     board => {
  //       this.bs.loadCurrentShips(board);
  //       this.board = board;
  //     }
  //   );
  // }

  // startGame(): void {
  //   this.db.setReady();
  //   this.gotoGame();
  // }

  // gotoGame(): void {
  //   this.db.getCurrentGame().pipe(take(1))
  //     .subscribe(game => {
  //       this.router.navigate(["/play"], {queryParams: {'game': game.key}});
  //     });
  // }
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