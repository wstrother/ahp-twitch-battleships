import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ship } from 'src/app/models/ship';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-test-db-page',
  templateUrl: './test-db-page.component.html',
  styleUrls: ['./test-db-page.component.css']
})
export class TestDbPageComponent implements OnInit {
  game: string = "";
  ships: Observable<Ship[]>;

  constructor(private db: DatabaseService) { }

  ngOnInit(): void {
    this.ships = this.db.getShips();
  }

}
