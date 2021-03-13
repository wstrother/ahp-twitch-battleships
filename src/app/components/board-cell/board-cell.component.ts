import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Cell } from 'src/app/models/cell';
import { BoardService } from 'src/app/services/board.service';

const SPRITES_REPO = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/";

@Component({
  selector: 'app-board-cell',
  templateUrl: './board-cell.component.html',
  styleUrls: ['./board-cell.component.css']
})
export class BoardCellComponent implements OnInit {
  @Input() cell: Cell;
  @Input() hidden: boolean;
  @Input() fireable: boolean = false;
  @Output() cellClicked: EventEmitter<any> = new EventEmitter();

  constructor(private bs: BoardService) { }

  ngOnInit(): void {
  }

  getCellSize(): string {
    return `${this.bs.cellSize}px`;
  }

  getImgSrc(): string {
    if (this.cell.data) {
      let name = this.cell.data.name.toLowerCase();
      name = name.replace(/ /g, '-');
      return `${SPRITES_REPO}${name}.png`;
    } else {
      return 'none';
    }
  }

  getTooltip(): string | null {
    if (this.cell.data) {
      return this.cell.data.name;
    } else {
      return null
    }
  }

  handleClick(event: any): void {
    event.preventDefault();
    this.cellClicked.emit(event);
  }
}
