import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatenewsComponent } from './createnews/createnews.component';

const routes: Routes = [{
  path:'',
  component:CreatenewsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatenewsRoutingModule { }
