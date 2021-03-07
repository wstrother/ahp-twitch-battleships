import { Ghost, Ship } from "./ship";

export class Cell {
    marked: boolean = false;
    shot: boolean = false;
    ship: Ship | null = null;
    ghost: Ghost | null = null;
    disabled: boolean = false;
    
    get hasShip(): boolean {
        if (this.ship) {
            return true;
        } else {
            return false;
        }
    }

    get selected(): boolean {
        if (this.ship && this.ship.selected) {
            return true;
        } else {
            return false;
        }
    }

    get shipSunk(): boolean {
        if (this.ship && this.ship.isSunk) {
            return true;
        } else {
            return false;
        }
    }

    constructor() {
        
    }

    handleMark(): void {
        this.marked = !this.marked;
    }
}
