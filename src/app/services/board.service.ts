import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Board } from '../models/board';
import { Cell } from '../models/cell';
import { Ship } from '../models/ship';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // ships: Ship[];
  private _selected: Subject<Ship | null> = new Subject<Ship | null>();
  selected$: Observable<Ship | null>;
  private _previous: Ship | null = null;

  constructor() {
    this.selected$ = this._selected.asObservable();

    // will add a game state to the database
    // will construct boards based on settings parameters and add to game state
  }

  getBoard(width: number, numCells: number): Board {
    return new Board(width, numCells);
    // will return board from database by passing reference to current game id
    // and a player token to determine wich board is which
  }

  addShip(board: Board, ship: Ship, row: number, col: number): void {
    board.setShipPosition(ship, row, col);
    // will update the game state to the database
  }

  handleShot(cell: Cell): void {
    cell.shot = true;
    // will update the game state to the database
  }

  selectShip(ship: Ship): void {
    if (this._previous) {
      this._previous.selected = false;
    }

    if (ship) {ship.selected = true;}

    this._selected.next(ship);
    this._previous = ship;
  }
}
