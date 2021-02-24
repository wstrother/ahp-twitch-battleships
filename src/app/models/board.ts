import { Ship } from "./ship";
import { Cell } from "./cell";

class ShipPlacementError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ShipPlacementError"
    }
}

class BoardError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "BoardError";
    }
}

export class Board {
    cells: Cell[] = [];

    constructor(public width: number, public numCells: number) {
        for (let i = 0; i <numCells; i++) {
            this.cells.push(new Cell());
        }
    }

    getCell(row: number, col: number): Cell {
        if (col > this.width - 1) {
            throw new BoardError(`There is no Cell at row: ${row}, col: ${col}`);
        }
        let cell = this.cells[(row * this.width) + col];

        if (!cell) {
            throw new BoardError(`There is no Cell at row: ${row}, col: ${col}`);
        }

        return cell;
    }

    setShipPosition(ship: Ship, row: number, col: number) {
        let cells = [];
        let currentCell = null;

        for (let i = 0; i < ship.size; i++) {
            currentCell = this.getCell(row, col);

            if (currentCell.hasShip && currentCell.ship !== ship) {
                throw new ShipPlacementError(`The Cell at row: ${row}, col: ${col} already has a Ship`);
            }

            cells.push(currentCell);

            if (ship.direction === "x") {
                col++;
            }

            if (ship.direction === "y") {
                row++;
            }
        }

        ship.setPosition(row, col, cells);
    }
}
