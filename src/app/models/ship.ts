import { Cell } from "./cell";

export class Ship {
    cells: Cell[] = [];
    row: number = 0;
    col: number = 0;
    selected: boolean = false;
    
    constructor(public size: number, public key: string, public direction: "x" | "y") {}

    get isSunk(): boolean {
        if (this.getHits().length === this.size) {
            return true;
        } else {
            return false;
        }
    }

    get placed(): boolean {
        if (this.cells.length === this.size && !this.selected) {
            return true;
        } else {
            return false;
        }
    }

    getHits(): Cell[] {
        return this.cells.filter(c => c.shot)
    }

    setPosition(row: number, col: number, cells: Cell[]): void {
        this.row = row;
        this.col = col;

        this.cells.forEach((c) => {
            c.ship = null;
        })
        this.cells.length = 0;

        cells.forEach((c) => {
            c.ship = this;
            this.cells.push(c);
        });
    }

    toggleDirection(): void {
        if (this.direction === "x") {
            this.direction = "y";
        } else {
            this.direction = "x";
        }

        this.setPosition(this.row, this.col, this.cells);
    }
}
