import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-game-info',
  templateUrl: './new-game-info.component.html',
  styleUrls: ['./new-game-info.component.css']
})
export class NewGameInfoComponent implements OnInit {
  @Input() asDialog: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
