import { AngularFireList } from "@angular/fire/database";
import { DbItem } from "./db-item";


export class ConnectionStatus {
    constructor(public playerNum: number, public otherConnected: boolean, public otherReady: boolean) {}
  }

export class Game extends DbItem {
    player1: string = "";
    p1ready: boolean = false;
    
    player2: string = "";
    p2ready: boolean = false;
    
    key: string;
    shipArgs: number[] = [5, 4, 3, 3, 2];

    random: boolean = false;
    seed?: string;

    get p2open(): boolean {
        return this.player2 === "";
    }
    
    constructor(
        public name?: string, 
        public boardWidth?: number, 
        public totalCells?: number) {
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

    getConnectionStatus(key: string): ConnectionStatus {
        const n = this.getPlayerNum(key);

        const getStatus = (k: string, ready: boolean) => {
            return new ConnectionStatus(n, k !== "", ready)
        }
        
        const status = [
            getStatus(this.player1, this.p1ready),
            getStatus(this.player2, this.p2ready)
        ]

        return status[n === 1 ? 1 : 0]
    }

    otherKey(key: string): string | null {
        const n = this.getPlayerNum(key);

        return [
            this.player1, this.player2
        ][n === 1 ? 1 : 0]
    }

    getReady(key: string): boolean {
        const n = this.getPlayerNum(key);
        const ready = [
            this.p1ready, this.p2ready
        ]
        return ready[n === 1 ? 0 : 1]
    }

    otherReady(key: string): boolean {
        return this.getReady(this.otherKey(key));
    }

    setReady(key: string, collection: AngularFireList<Game>): void {
        const n = this.getPlayerNum(key);

        if (n === 1 && !this.p1ready) {
            this.update(collection, {p1ready: true})
        }

        if (n === 2 && !this.p2ready) {
            this.update(collection, {p2ready: true})
        }
    }
}
