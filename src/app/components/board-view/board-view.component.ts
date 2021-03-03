import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { Board } from 'src/app/models/board';
import { Ghost, Ship } from 'src/app/models/ship';
import { BoardService } from 'src/app/services/board.service';


class boundingBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;

  constructor(element: any) {
    this.top = element.offsetTop;
    this.left = element.offsetLeft;
    this.right = element.offsetLeft + element.offsetWidth;
    this.bottom = element.offsetTop + element.offsetHeight;
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
  }
}


@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.css']
})
export class BoardViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() board: Board;

  showShips: boolean = true;
  gameStarted: boolean = false;
  
  @Input() placeable: boolean = true;
  @Input() fireable: boolean = false;

  private selectedSub: Subscription;
  private rightClick$: Subscription;
  private mouseMovement$: Subscription;
  private click$: Subscription;

  @ViewChild('boardElement') el: any;

  constructor(private bs: BoardService) { }

  getGridStyle(): string {
    return `repeat(${this.board.width}, fit-content(100%))`
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.placeable) {
      this.setUpPlacement();
    }
  }

  ngOnDestroy(): void {
    if (this.selectedSub) {
      this.selectedSub.unsubscribe();
    }
    this.cancelEventSubs();
  }

  cancelEventSubs(): void {
    [
      this.mouseMovement$,
      this.rightClick$,
      this.click$
    ].forEach(sub => {
      if (sub) { sub.unsubscribe(); }
    });
  }

  // get a set of coordinates {row: number, col: number} for a cell
  // associated with a mouseclick event
  getCoordinates(x: number, y: number): any {
    let box = new boundingBox(this.el.nativeElement);
    let oX = x - box.left;
    let oY = y - box.top;

    return {
      col: Math.floor(oX / this.bs.cellSize), 
      row: Math.floor(oY / this.bs.cellSize)
    }
  }

  // try to place a ship on the board based on a mousemove event
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

  setUpPlacement(): void {
    this.click$ = fromEvent(this.el.nativeElement, 'click')
      .subscribe((e) => { 
        this.clickToSelectShip(e); 
      }
    );

    this.selectedSub = this.bs.selected$.subscribe(
      (ship) => {      
        this.cancelEventSubs();
        
        if (ship !== null) {
          let ghost = ship.ghost;

          this.mouseMovement$ = fromEvent(this.el.nativeElement, 'mousemove')
            .subscribe((e) => { this.placeShadow(e, ghost); }
          );
          
          this.rightClick$ = fromEvent(this.el.nativeElement, 'contextmenu')
            .subscribe((e) => { this.toggleSelectedDirection(e, ship); }
          );

          this.click$ = fromEvent(this.el.nativeElement, 'click')
            .subscribe((e) => { this.placeSelectedShip(e, ship); }
          );

        } else {

          this.click$ = fromEvent(this.el.nativeElement, 'click')
            .subscribe((e) => { 
              this.clickToSelectShip(e); 
            }
          );
        }

      }
    );
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
