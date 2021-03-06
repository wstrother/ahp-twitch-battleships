import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Cell } from 'src/app/models/cell';
import { BoardService } from 'src/app/services/board.service';

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


  handleClick(event: any): void {
    event.preventDefault();
    this.cellClicked.emit(event);
  }
}
