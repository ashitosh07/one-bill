import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleLineDiagramComponent } from './single-line-diagram.component';

const routes: Routes = [{
  path: '',
  component: SingleLineDiagramComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleLineDiagramRoutingModule { }
