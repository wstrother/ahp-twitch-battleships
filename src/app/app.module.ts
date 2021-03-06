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

import { AppComponent } from './app.component';
import { BoardViewComponent } from './components/board-view/board-view.component';
import { AppRoutingModule } from './app-routing.module';
import { BoardCellComponent } from './components/board-cell/board-cell.component';
import { BoardUiComponent } from './components/board-ui/board-ui.component';
import { ShipsViewComponent } from './components/ships-view/ships-view.component';
import { NewGameDialogComponent, NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { PlaceShipsPageComponent, StartGameDialogComponent } from './pages/place-ships-page/place-ships-page.component';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';
import { PlayGamePageComponent } from './pages/play-game-page/play-game-page.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardViewComponent,
    BoardCellComponent,
    BoardUiComponent,
    ShipsViewComponent,
    NewGamePageComponent,
    PlaceShipsPageComponent,
    ConnectionStatusComponent,
    PlayGamePageComponent,
    NewGameDialogComponent,
    StartGameDialogComponent
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
    MatSnackBarModule
  ],
  entryComponents: [
    NewGameDialogComponent,
    StartGameDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
