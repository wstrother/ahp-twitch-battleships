import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BoardViewComponent } from './components/board-view/board-view.component';
import { AppRoutingModule } from './app-routing.module';
import { BoardCellComponent } from './components/board-cell/board-cell.component';
import { BoardUiComponent } from './components/board-ui/board-ui.component';
import { ShipsViewComponent } from './components/ships-view/ships-view.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardViewComponent,
    BoardCellComponent,
    BoardUiComponent,
    ShipsViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
