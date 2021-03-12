import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { PlaceShipsPageComponent } from './pages/place-ships-page/place-ships-page.component';
import { PlayGamePageComponent } from './pages/play-game-page/play-game-page.component';
import { TestDbPageComponent } from './pages/test-db-page/test-db-page.component';

const routes: Routes = [
  {path: 'place', component: PlaceShipsPageComponent},
  {path: 'play', component: PlayGamePageComponent},
  {path: 'new', component: NewGamePageComponent},
  {path: '', redirectTo: '/new', pathMatch: 'full'},
  {path: 'home', component: HomePageComponent},
  {path: 'test', component: TestDbPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }