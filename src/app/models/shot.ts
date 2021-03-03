import { DbItem } from "./db-item";

export class Shot extends DbItem {
    constructor(
        public row?: number,
        public col?: number,
        public gameKey?: string,
        public playerKey?: string
    ) {
        super()
    }

    check(other: Shot) {
        return this.row === other.row && this.col === other.col;
    }
}
