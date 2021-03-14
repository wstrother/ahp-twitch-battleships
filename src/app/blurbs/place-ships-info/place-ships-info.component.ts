import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-place-ships-info',
  templateUrl: './place-ships-info.component.html',
  styleUrls: ['./place-ships-info.component.css']
})
export class PlaceShipsInfoComponent implements OnInit {
  @Input() asDialog: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
