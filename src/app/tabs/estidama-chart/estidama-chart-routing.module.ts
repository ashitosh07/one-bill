import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EstidamaChartComponent } from './estidama-chart.component';

const routes: Routes = [{
  path:'',
  component:EstidamaChartComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstidamaChartRoutingModule { }
