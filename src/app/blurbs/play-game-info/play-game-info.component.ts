import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-play-game-info',
  templateUrl: './play-game-info.component.html',
  styleUrls: ['./play-game-info.component.css']
})
export class PlayGameInfoComponent implements OnInit {
  @Input() asDialog: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
