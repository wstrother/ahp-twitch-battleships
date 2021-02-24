import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Cell } from 'src/app/models/cell';
import { Ship } from 'src/app/models/ship';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-ships-view',
  templateUrl: './ships-view.component.html',
  styleUrls: ['./ships-view.component.css']
})
export class ShipsViewComponent implements OnInit {
  ships: Ship[] = [];
  selected: Ship | null = null;

  constructor(private boardService: BoardService) { }

  ngOnInit(): void {
    this.boardService.selected$.subscribe((ship) => {
      this.selected = ship;
    });

    this.ships.push(
      new Ship(5),
      new Ship(4),
      new Ship(3),
      new Ship(3),
      new Ship(2),
    )
  }

  getCells(ship: Ship): any[] {
    let arr = Array.from({"length": ship.size}, x => new Cell());
    arr.forEach((c) => {c.ship = ship});
    return arr;
  }

  selectShip(ship: Ship): void {
    if (ship !== this.selected) {
      this.boardService.selectShip(ship);
    } else {
      this.boardService.selectShip(null);
    }
  }

}
