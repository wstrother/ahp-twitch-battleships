import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoardViewComponent } from './components/board-view/board-view.component';

const routes: Routes = [
  {path: '', component: BoardViewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }