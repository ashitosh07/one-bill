import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummaryChartComponent } from './../summary-chart.component';

const routes: Routes = [{
  path:'',
  component:SummaryChartComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummaryChartRoutingModule { }
