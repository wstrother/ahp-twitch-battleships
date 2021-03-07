import { Component, Input, OnInit } from '@angular/core';
import { Cell } from 'src/app/models/cell';
import { Ship } from 'src/app/models/ship';

@Component({
  selector: 'app-ship-container',
  templateUrl: './ship-container.component.html',
  styleUrls: ['./ship-container.component.css']
})
export class ShipContainerComponent implements OnInit {
  @Input() ship: Ship;
  cells: Cell[];

  constructor() { }

  ngOnInit(): void {
    this.cells = Array.from({"length": this.ship.size}, x => new Cell());
    this.cells.forEach((c) => {c.ship = this.ship});
  }

}
