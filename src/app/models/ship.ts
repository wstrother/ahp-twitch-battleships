import { SnapshotAction } from "@angular/fire/database";
import { Cell } from "./cell";
import { DbItem } from "./db-item";

export class Ship extends DbItem {
    cells: Cell[] = [];
    row: number = 0;
    col: number = 0;
    selected: boolean = false;
    placed: boolean = false;
    direction: "x" | "y" = "x";
    
    constructor(public size: number, public gameKey: string, public playerKey: string) {
        super();
    }

    getAsData(): any {
        return {
            row: this.row,
            col: this.col,
            size: this.size,
            direction: this.direction,
            placed: this.placed,
            gameKey: this.gameKey,
            playerKey: this.playerKey
        }
    }

    // static getFromData(key: string, data: any) {
    //     delete data.placed;
    //     return super.getFromData(key, data);
    // }

    get isSunk(): boolean {
        if (this.getHits().length === this.size) {
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
