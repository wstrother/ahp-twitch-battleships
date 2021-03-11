import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/game';
import { DatabaseService } from 'src/app/services/database.service';

interface Generation {
  name: string,
  totalCells: number,
  defaultWidth: number
}

@Component({
  selector: 'app-new-game-page',
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.css']
})
export class NewGamePageComponent implements OnInit {
  game: Game = new Game("New Game", 13, 151);
  gens: Generation[] = [
    {name: "Gen 1", totalCells: 151, defaultWidth: 13},
    {name: "Gen 2", totalCells: 251, defaultWidth: 16},
    {name: "Gen 3", totalCells: 386, defaultWidth: 20}
  ]
  selected: Generation = this.gens[0];
  
  constructor(
    private router: Router, 
    private db: DatabaseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // if (this.db.gameLoaded) {
    //   window.location.reload(); 
    // }
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(NewGameDialogComponent);

    dialogRef.afterClosed().subscribe(
      (result: any) => {
        if (result) { this.makeGame(); }
      }
    );
  }

  makeGame(): void {
    this.validateFields();

    this.db.createGame(this.game).subscribe(
      () => {
        this.router.navigate(["/place"], {queryParams: {'game': this.game.key}});
      }
    );
  }

  validateFields(): void {
    let wStr: string = this.game.boardWidth + "";
    let cStr: string = this.game.totalCells + "";

    const toNum = (s: string, min: number, max: number): number => {
      let num = parseInt(s.replace(/\D/g, ""));
      if (num < min) {num = min}
      if (num > max) {num = max}

      return num;
    }

    this.game.boardWidth = toNum(wStr, 10, 30);
    this.game.totalCells = toNum(cStr, 50, 386);
  }

  selectGen(event: any): void {
    this.game.boardWidth = event.value.defaultWidth;
    this.game.totalCells = event.value.totalCells;
  }
}


@Component({
  selector: 'app-new-game-dialog',
  template: `
  <mat-dialog-content>Confirm New Game?</mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Confirm</button>
  </mat-dialog-actions>`
})
export class NewGameDialogComponent {}
