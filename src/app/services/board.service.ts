import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Board } from '../models/board';
import { Cell } from '../models/cell';
import { Ship } from '../models/ship';
import { GameDatabaseService } from './game.database.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private _selected: Subject<Ship | null> = new Subject<Ship | null>();
  selected$: Observable<Ship | null>;
  private _previous: Ship | null = null;
  cellSize = 25;

  constructor(private db: GameDatabaseService) {
    this.selected$ = this._selected.asObservable();
  }

  getBoard(width: number, numCells: number): Board {
    return new Board(width, numCells);
  }

  getShips(args: number[]): Ship[] {
    let ships = args.map(
      (size) => new Ship(size)
    );

    // ships.forEach(
    //   (ship) => {this.db.createShip(ship)}
    // );

    return ships;
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
