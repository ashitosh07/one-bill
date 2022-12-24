import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParameterChartComponent } from './parameter-chart.component';

const routes: Routes = [{
  path:'',
  component:ParameterChartComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParameterChartRoutingModule { }
