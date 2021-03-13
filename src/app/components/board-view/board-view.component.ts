import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, fromEvent, Subscription } from 'rxjs';
import { switchMapTo, tap } from 'rxjs/operators';
import { Board } from 'src/app/models/board';
import { Ghost, Ship } from 'src/app/models/ship';
import { BoardService } from 'src/app/services/board.service';
import { DatabaseService } from 'src/app/services/database.service';
 

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.css']
})
export class BoardViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() board: Board;

  @Input() showShips: boolean = true;
  gameStarted: boolean = false;
  
  @Input() placeable: boolean = true;
  @Input() fireable: boolean = false;

  private selectedSub: Subscription;
  private eventSubs: Subscription[] = [];

  @ViewChild('boardElement') el: any;

  constructor(private bs: BoardService, private db: DatabaseService) { }

  getGridStyle(): string {
    return `repeat(${this.board.width}, fit-content(100%))`
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.placeable) {
      this.setUpPlacement();
    }

    if (this.fireable) {
      combineLatest([
        this.db.userId$,
        this.db.currentGame$
      ]).subscribe(
        ([uid, game]) => {
          if (game.otherReady(uid)) { this.setUpFiring(); }
        }
      );
    }
      
  }

  ngOnDestroy(): void {
    if (this.selectedSub) {
      this.selectedSub.unsubscribe();
    }
    this.cancelEventSubs();
  }

  cancelEventSubs(): void {
    this.eventSubs.forEach(sub => {
      sub.unsubscribe();
    });
    this.eventSubs.length = 0;
  }

  // // get a set of coordinates {row: number, col: number} for a cell
  // // associated with a mouseclick event
  getCoordinates(x: number, y: number): any {
    let box = this.el.nativeElement.getBoundingClientRect();
    let oX = x - box.left;
    let oY = y - box.top;

    return {
      col: Math.floor(oX / this.bs.cellSize), 
      row: Math.floor(oY / this.bs.cellSize)
    }
  }

  // // try to place a ship on the board based on a mousemove event
  placeShip(event: any, ship: Ship): void {
    let coords = this.getCoordinates(event.x, event.y);
    
    try {
      this.board.setShipPosition(ship, coords.row, coords.col);
    } catch(err) {
      console.log(err.name);  // currently logs error name, could implement 
      //                      // collision resolution in the future
      console.log(err.message);
    }
  }

  placeShadow(event: any, ghost: Ghost): void {
    let {row, col} = this.getCoordinates(event.x, event.y);

    this.board.setShadow(ghost, row, col);
  }

  setEventMethod(name: string, method: (e: any) => void) {
    const getEvent = (name: string) => fromEvent(this.el.nativeElement, name);

    this.eventSubs.push(getEvent(name).subscribe(method));
  }

  setUpPlacement(): void {
    this.setEventMethod('click', (e: any) => this.clickToSelectShip(e));

    this.selectedSub = this.bs.selected$.subscribe(
      (ship) => {      
        this.cancelEventSubs();
        
        if (ship !== null) {
          let ghost = ship.ghost;

          this.setEventMethod(
            'mousemove', (e: any) => this.placeShadow(e, ghost)
          );
          this.setEventMethod(
            'contextmenu', (e: any) => this.toggleSelectedDirection(e, ship)
          );
          this.setEventMethod(
            'click', (e: any) => this.placeSelectedShip(e, ship)
          );

        } else {
          this.setEventMethod(
            'click', (e: any) => this.clickToSelectShip(e)
          );
        }

      }
    );
  }

  setUpFiring(): void {

    this.setEventMethod(
      'click', (e) => { this.clickToFire(e) }
    );

    this.setEventMethod(
      'contextmenu', (e) => { this.clickToMark(e) }
    );
  }

  clickToFire(event: any): void {
    this.cancelEventSubs();
    this.board.disableAll();
    
    let {row, col} = this.getCoordinates(event.x, event.y);
    let pending$ = this.bs.fireShot(this.board, row, col);
    
    const onClick = fromEvent(document, 'click');
    const resetEvents = () => {
      this.cancelEventSubs();
      this.setUpFiring();
      this.board.enableAll();
    }
    
    
    this.eventSubs.push(
      
      pending$.pipe(
        tap((p) => {
          if (p.time === 0) { resetEvents(); }
        }),
        switchMapTo(onClick)
      ).subscribe(resetEvents)

    );
  }

  clickToMark(event: any): void {

    let {row, col} = this.getCoordinates(event.x, event.y);
    let cell = this.board.getCell(row, col);

    if (cell) {
      cell.handleMark();
    }
  }

  placeSelectedShip(event: any, ship: Ship): void {
    this.placeShip(event, ship);
    this.bs.selectShip(null);
  }

  toggleSelectedDirection(event: any, ship: Ship): void {
    ship.toggleDirection();
    this.placeShadow(event, ship.ghost);
  }

  clickToSelectShip(event: any): void {
    let {row, col} = this.getCoordinates(event.x, event.y);
    let cell = this.board.getCell(row, col);

    if (cell.ship) {
      let ship = cell.ship;
      this.bs.selectShip(ship);
      this.board.setShadow(ship.ghost, ship.row, ship.col);
    }
  }

}
