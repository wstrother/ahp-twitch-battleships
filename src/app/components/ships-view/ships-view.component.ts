import { Component, Input, OnInit } from '@angular/core';
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
  @Input() ships: Ship[];
  selected: Ship | null = null;

  constructor(private bs: BoardService) { }

  ngOnInit(): void {
    // subscribes to boardService to update selected ship
    this.bs.selected$.subscribe((ship) => {
      this.selected = ship;
    });
  }

  // returns an array of proxy Cells for use with the ship container
  getCells(ship: Ship): any[] {
    let arr = Array.from({"length": ship.size}, x => new Cell());
    arr.forEach((c) => {c.ship = ship});
    return arr;
  }

  // if a ship is clicked on, toggle whether or not it is selected
  selectShip(ship: Ship): void {
    if (ship !== this.selected) {
      this.bs.selectShip(ship);
    } else {
      this.bs.selectShip(null);
    }
  }

}
