import { Component, Input, OnInit } from '@angular/core';
import { ConnectionStatus } from 'src/app/models/game';

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.css']
})
export class ConnectionStatusComponent implements OnInit {
  @Input() status: ConnectionStatus;

  constructor() { }

  ngOnInit(): void {
  }

}
