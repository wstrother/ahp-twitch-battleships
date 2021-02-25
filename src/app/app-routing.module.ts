import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { PlaceShipsPageComponent } from './pages/place-ships-page/place-ships-page.component';

const routes: Routes = [
  {path: 'place', component: PlaceShipsPageComponent},
  {path: '', component: NewGamePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }