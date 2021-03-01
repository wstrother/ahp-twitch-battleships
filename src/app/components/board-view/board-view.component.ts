import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { Board } from 'src/app/models/board';
import { Cell } from 'src/app/models/cell';
import { Ship } from 'src/app/models/ship';
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
export class BoardViewComponent implements OnInit {
  @Input() board: Board;
  showShips: boolean = true;
  gameStarted: boolean = false;
  selected: Ship | null = null;

  private mouseMovement$: Subscription;

  @ViewChild('boardElement') el: any;

  constructor(private bs: BoardService) { }

  getGridStyle(): string {
    return `repeat(${this.board.width}, fit-content(100%))`
  }

  ngOnInit(): void {
    // subscribe to boardService to monitor selected ship and then watch mousemovement
    // to place the ship
    this.bs.selected$.subscribe((ship) => {
      this.selected = ship;

      if (this.mouseMovement$) {
        this.mouseMovement$.unsubscribe();
      }

      if (this.selected) {
        this.mouseMovement$ = fromEvent(this.el.nativeElement, 'mousemove').subscribe(
          (e) => {
            this.placeShip(e, this.selected);
          });
      }
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

  handleClick(event: any, cell: Cell) {
    if (this.gameStarted) {
      //
      // handle click events once the game is active and shots can be fired...
      //    left-click => sends a shot to boardService
      //    right-click => marks the Cell 
      if (event.type === "click") {
        // this.bs.handleShot(cell);
      }
      if (event.type === "contextmenu") {
        cell.handleMark();
      }
    } else {
      //
      // handle click events if a ship is selected for placement currently...
      //    left-click => unselects the ship leaving current placement (or none)
      //    right-click => changes orientation of the ship
      if (this.selected) {
        if (event.type === "click") {
          this.bs.selectShip(null);
          this.mouseMovement$.unsubscribe();
        }
        if (event.type === "contextmenu") {
          this.selected.toggleDirection();
          this.placeShip(event, this.selected);
        }
      } else {
        //
        // handle click events during placement if a ship isn't currently selected...
        //  left-click => select the ship at that cell if it exists
        if (event.type === "click") {
          if (cell.hasShip) {
            this.bs.selectShip(cell.ship);
          }
        }
      }
    }
  }

  // UI hooks
  startGame(): void {
    this.gameStarted = true;
  }

  toggleShips(): void {
    this.showShips = !this.showShips;
  }
}
