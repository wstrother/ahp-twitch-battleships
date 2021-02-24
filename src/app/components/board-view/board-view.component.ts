import { Component, OnInit, ViewChild } from '@angular/core';
import { fromEvent, interval, Observable, Subscription } from 'rxjs';
import { sample, filter } from 'rxjs/operators';
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
  board: Board;
  showShips: boolean = true;
  gameStarted: boolean = false;
  selected: Ship | null = null;
  cellSize: number = 25;

  private mouseMovement$: Subscription;

  @ViewChild('boardElement') el: any;

  constructor(private boardService: BoardService) { }

  ngOnInit(): void {
    this.boardService.selected$.subscribe((ship) => {
      this.selected = ship;

      if (this.mouseMovement$) {
        this.mouseMovement$.unsubscribe();
      }

      this.mouseMovement$ = fromEvent(document, 'mousemove').pipe(
        // sample(interval(20)),
        filter((e) => this.mouseInbound(e))
      ).subscribe((e) => {
        console.log("listening...");
        if (this.selected) {
          this.placeShip(e, this.selected);
        }
      });
    });

    this.board = this.boardService.getBoard(10, 100);
  }

  mouseInbound(event: any): boolean {
    let box = new boundingBox(this.el.nativeElement);

    if (event.x > box.left && event.x < box.right) {
      if (event.y > box.top && event.y < box.bottom) {
        return true
      }
    }

    return false;
  }

  getCoordinates(x: number, y: number): any {
    let box = new boundingBox(this.el.nativeElement);
    let oX = x - box.left;
    let oY = y - box.top;

    return {
      col: Math.floor(oX / this.cellSize), 
      row: Math.floor(oY / this.cellSize)
    }
  }

  toggleShips(): void {
    this.showShips = !this.showShips;
  }

  placeShip(event: any, ship: Ship): void {
    let coords = this.getCoordinates(event.x, event.y);
    
    try {
      this.boardService.addShip(this.board, ship, coords.row, coords.col);
    } catch(err) {
      console.log(err.name);
    }
  }

  handleClick(event: any, cell: Cell) {
    if (this.gameStarted) {
      // handle click events once the game is active and shots can be fired...
      if (event.type === "click") {
        this.boardService.handleShot(cell);
      }
      if (event.type === "contextmenu") {
        cell.handleMark();
      }
    } else {
      // handle click events a ship is selected for placement currently...
      if (this.selected) {
        if (event.type === "click") {
          this.boardService.selectShip(null);
          this.mouseMovement$.unsubscribe();
        }
        if (event.type === "contextmenu") {
          this.selected.toggleDirection();
          this.placeShip(event, this.selected);
        }
      } else {
        // handle click events during placement if a ship isn't currently selected...
        if (event.type === "click") {
          if (cell.hasShip) {
            this.boardService.selectShip(cell.ship);
          }
        }
      }
    }
  }
}
