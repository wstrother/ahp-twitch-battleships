import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatDialogModule } from '@angular/material/dialog'; 
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatSelectModule } from '@angular/material/select'; 
import { MatCheckboxModule } from '@angular/material/checkbox'; 

import { AppComponent } from './app.component';
import { BoardViewComponent } from './components/board-view/board-view.component';
import { AppRoutingModule } from './app-routing.module';
import { BoardCellComponent } from './components/board-cell/board-cell.component';
import { ShipsViewComponent } from './components/ships-view/ships-view.component';
import { NewGameDialogComponent, NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { PlaceShipsPageComponent, StartGameDialogComponent } from './pages/place-ships-page/place-ships-page.component';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';
import { PlayGamePageComponent } from './pages/play-game-page/play-game-page.component';
import { ShipContainerComponent } from './components/ship-container/ship-container.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { BattleshipsInfoComponent } from './blurbs/battleships-info/battleships-info.component';
import { NewGameInfoComponent } from './blurbs/new-game-info/new-game-info.component';
import { PlaceShipsInfoComponent } from './blurbs/place-ships-info/place-ships-info.component';
import { PlayGameInfoComponent } from './blurbs/play-game-info/play-game-info.component';
import { RandomizeInfoComponent } from './blurbs/randomize-info/randomize-info.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardViewComponent,
    BoardCellComponent,
    ShipsViewComponent,
    NewGamePageComponent,
    PlaceShipsPageComponent,
    ConnectionStatusComponent,
    PlayGamePageComponent,
    NewGameDialogComponent,
    StartGameDialogComponent,
    ShipContainerComponent,
    HomePageComponent,
    BattleshipsInfoComponent,
    NewGameInfoComponent,
    PlaceShipsInfoComponent,
    PlayGameInfoComponent,
    RandomizeInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  entryComponents: [
    NewGameDialogComponent,
    StartGameDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
