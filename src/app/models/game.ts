import { DbItem } from "./db-item";

export class Game extends DbItem {
    player1: string = "";
    p1ready: boolean = false;
    
    player2: string = "";
    p2ready: boolean = false;
    
    key: string;
    shipArgs: number[];

    get p2open(): boolean {
        return this.player2 === "";
    }
    
    constructor(public name?: string, public boardWidth?: number, public totalCells?: number) {
        super();
    }

    getPlayerNum(key: string): number {
        const p1 = this.player1 === key;
        const p2 = this.player2 === key || this.p2open;

        if (!p1 && !p2) {
            return 0;
        }

        return p1 ? 1 : 2;
    }

}
