import { Cell } from "./cell";
import { DbItem } from "./db-item";

export class Ship extends DbItem {
    cells: Cell[] = [];
    row: number = 0;
    col: number = 0;
    selected: boolean = false;
    placed: boolean = false;
    direction: "x" | "y" = "x";
    _ghost: Ghost;

    get ghost(): Ghost {
        if (!this._ghost) {
            this._ghost = new Ghost(this);
        }

        return this._ghost;
    }
    
    constructor(
        public size?: number, 
        public gameKey?: string, 
        public player?: string) {
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
            player: this.player
        }
    }

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

        this.clear();

        cells.forEach((c) => {
            c.ship = this;
            this.cells.push(c);
        });
        this.placed = true;
    }

    clear(): void {
        this.cells.forEach((c) => {
            c.ship = null;
        })

        console.log("clearing");
        this.placed = false;
        this.cells.length = 0;
    }

    toggleDirection(): void {
        if (this.direction === "x") {
            this.direction = "y";
        } else {
            this.direction = "x";
        }
    }
}

export class Ghost {
    cells: Cell[] = [];

    get ok(): boolean {
        return this.cells.length === this.size;
    }

    constructor(public ship: Ship) {
    }

    get size(): number {
        return this.ship.size;
    }

    get direction(): "x" | "y" {
        return this.ship.direction;
    }

    setShadow(cells: Cell[]): void {
        this.clear();

        cells.forEach((c) => {
            c.ghost = this;
            this.cells.push(c);
        });
    }

    clear(): void {
        this.cells.forEach((c) => {
            c.ghost = null;
        })

        this.cells.length = 0;
    }
}