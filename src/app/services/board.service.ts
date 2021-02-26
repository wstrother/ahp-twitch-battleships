import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Board } from '../models/board';
import { Cell } from '../models/cell';
import { Ship } from '../models/ship';
import { GameDatabaseService, GameDoc, ShipDoc } from './game.database.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private _selected: Subject<Ship | null> = new Subject<Ship | null>();
  private _previous: Ship | null = null;
  selected$: Observable<Ship | null>;

  cellSize = 25;

  constructor(private db: GameDatabaseService) {
    this.selected$ = this._selected.asObservable();
  }

  // returns a Board object based on the current game's parameters

  getBoard(game: GameDoc): Board {
    return new Board(game.boardWidth, game.totalCells);
  }

  // creates Ship objects and places them on the board according
  // to the records in the database

  getShips(board: Board, docs: ShipDoc[]): Ship[] {
    let ships: Ship[] = [];
    let ship: Ship;

    docs.forEach((doc) => {
      ship = new Ship(doc.size, doc.key);
      ships.push(ship);
      if (ship.placed) {
        this.addShip(board, ship, doc.row, doc.col)
      }
    });

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

    if (ship) {
      ship.selected = true;
      // if ship is selected make sure placed is false in database
    }

    this._selected.next(ship);
    this._previous = ship;
  }
}
