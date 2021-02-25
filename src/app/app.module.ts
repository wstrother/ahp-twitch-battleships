import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BoardViewComponent } from './components/board-view/board-view.component';
import { AppRoutingModule } from './app-routing.module';
import { BoardCellComponent } from './components/board-cell/board-cell.component';
import { BoardUiComponent } from './components/board-ui/board-ui.component';
import { ShipsViewComponent } from './components/ships-view/ships-view.component';
import { NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { PlaceShipsPageComponent } from './pages/place-ships-page/place-ships-page.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    BoardViewComponent,
    BoardCellComponent,
    BoardUiComponent,
    ShipsViewComponent,
    NewGamePageComponent,
    PlaceShipsPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
