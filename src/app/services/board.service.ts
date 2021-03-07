import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';
import { Board } from '../models/board';
import { Game } from '../models/game';
import { Ship } from '../models/ship';
import { Shot } from '../models/shot';
import { DatabaseService } from './database.service';
import { GameService } from './game.service';


export interface ShotAlert {
  shot: Shot;
  message: string;
  sink?: boolean;
}

export interface PendingShot {
  row: number;
  col: number;
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

  cellSize = 25;

  constructor(private db: DatabaseService, private gs: GameService) {
    this.selected$ = this._selected.asObservable();
  }

  getPendingShot(): Observable<null | PendingShot> {
    return this.pendingShot.asObservable();
  }

  getBoard(): Observable<Board> {
    return this.db.getCurrentGame().pipe(
      map((game: Game) => {
        return new Board(game.boardWidth, game.totalCells);
      }),
      take(1)
    )
  }

  loadCurrentShips(board: Board): void {
    this.gs.getCurrentShips().subscribe(
      (ships: Ship[]) => {this.placeShips(board, ships)}
    );
  }

  loadOtherShips(board: Board): void {
    this.gs.getOtherShips().subscribe(
      (ships: Ship[]) => {this.placeShips(board, ships)}
    )
  }

  placeShips(board: Board, ships: Ship[]): void {
    ships.forEach(ship => {
      if (ship.placed) {
        board.setShipPosition(ship, ship.row, ship.col)
      }
    });
  }

  selectShip(ship: Ship): void {
    if (this._previous) {
      let prev = this._previous;
      prev.selected = false;
      prev.ghost.clear();

      if (prev.cells.length === prev.size) {
        prev.placed = true;
      }

      // if a previously selected ship is placed on the board
      // make sure it's current state is updated in the database
      if (prev.placed) {
        this.db.updateShip(prev, {
          placed: true,
          row: prev.row,
          col: prev.col,
          direction: prev.direction
        })
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
        return {row, col, time: 3 - n};
      }),
      tap(handlePending)
    );

    return pending$;
  }

  handleShot(board: Board, shot: Shot): void {
    let cell = board.getCell(shot.row, shot.col);
    cell.shot = true;

    if (cell.hasShip) {
      this.handleAlert(cell.ship, shot);
    }
  }

  handleAlert(ship: Ship, shot: Shot): void {
    let message = "";
    let sink = ship.isSunk;

    if (sink) {
      message = `Ship sunk at row: ${shot.row}, col: ${shot.col}`;
    } else {
      message = `Ship hit at row: ${shot.row}, col ${shot.col}`;
    }

    this.alerts.next({shot, message, sink});
  }

  getAlerts(): Observable<ShotAlert> {
    return this.alerts.asObservable();
  }
}