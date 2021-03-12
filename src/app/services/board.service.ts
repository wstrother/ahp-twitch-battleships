import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';
import { Board } from '../models/board';
import { Cell } from '../models/cell';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';
import { DatabaseService } from './database.service';
import { MonService } from './mon.service';


export interface ShotAlert {
  shot: Shot;
  cell: Cell;
  sink: boolean;
  hit: boolean;
}

export interface PendingShot {
  cell: Cell;
  time: number;
}


@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private _selected: Subject<Ship | null> = new Subject<Ship | null>();
  private _previous: Ship | null = null;
  selected$: Observable<Ship | null>;

  alerts: Subject<ShotAlert> = new Subject<ShotAlert>();
  pendingShot: Subject<null | PendingShot> = new Subject<null | PendingShot>();

  cellSize = 40;

  constructor(
    private db: DatabaseService,
    private ms: MonService
  ) {
    this.selected$ = this._selected.asObservable();
  }

  getPendingShot(): Observable<null | PendingShot> {
    return this.pendingShot.asObservable();
  }

  getBoard(): Observable<Board> {
    return this.db.currentGame$.pipe(
      map((game: Game) => {
        return new Board(game.boardWidth, game.totalCells, this.ms.getMons(game));
      }),
      take(1)
    );
  }

  selectShip(ship: Ship): void {
    if (this._previous) {
      let prev = this._previous;
      prev.selected = false;
      prev.ghost.clear();

      // if a previously selected ship is placed on the board
      // make sure it's current state is updated in the database
      if (prev.placed) {
        this.db.updateShip(prev, {
          placed: true,
          row: prev.row,
          col: prev.col,
          direction: prev.direction
        });
      }
    }

    if (ship) {
      ship.selected = true;
      ship.clear();

      // if ship is selected make sure placed is false in database
      this.db.updateShip(ship, {placed: false});
    }

    this._selected.next(ship);
    this._previous = ship;
  }

  fireShot(board: Board, row: number, col: number): Observable<PendingShot> {
    let cell = board.getCell(row, col);

    const handlePending = (p: PendingShot) => {
      this.pendingShot.next(p);
      if (p.time === 0) {

        this.db.fireShot(row, col).subscribe(
          (shot: Shot) => {
            this.handleShot(board, shot);
          }
        );

      }
    }
    
    let pending$ = timer(0, 1000).pipe(
      take(4),
      finalize(() => { this.pendingShot.next(null); }),
      map((n: number): PendingShot => {
        return {cell, time: 3 - n};
      }),
      tap(handlePending)
    );

    return pending$;
  }

  handleShot(board: Board, shot: Shot): void {
    let cell = board.getCell(shot.row, shot.col);
    cell.shot = true;
    this.handleAlert(cell, shot);
  }

  handleAlert(cell: Cell, shot: Shot): void {
    let hit = cell.hasShip;
    let sink = false;
    if (hit) {
      sink = cell.ship.isSunk;
    }

    this.alerts.next({shot, cell, hit, sink});
  }

  getAlerts(): Observable<ShotAlert> {
    return this.alerts.asObservable();
  }
}