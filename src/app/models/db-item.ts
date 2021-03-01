import { AngularFireList, SnapshotAction } from "@angular/fire/database";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

export class DbItem {
    key: string;

    static getFromSnapshot(action: SnapshotAction<any>): any {
        if (action.key === null) {
            throw Error("Database error ocurred!");
        }

        return this.getFromData(action.key, action.payload.val());
    }

    static getFromData(key: string, data: any): any {
        let g = new this();
        g.key = key;
        Object.assign(g, data);

        return g;
    }

    getAsData(): any {
        return this;
    }

    create(collection: AngularFireList<any>) {
        return from(collection.push(this.getAsData()).then(r => r.key))
            .pipe(map(key => {
                this.key = key;
                return this;
            }));
    }

    update(collection: AngularFireList<any>, data: any) {
        return from(collection.update(this.key, data).then(
            () => {
                Object.assign(this, data);
                return this
            }
        ));
    }
}