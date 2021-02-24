import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-board-ui',
  templateUrl: './board-ui.component.html',
  styleUrls: ['./board-ui.component.css']
})
export class BoardUiComponent implements OnInit {
  @Output() toggle: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  toggleShips(): void {
    this.toggle.emit(null);
  }
}
