import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeterReadingComponent } from './meter-reading.component';

const routes: Routes = [
  {
    path:'',
    component: MeterReadingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterReadingRoutingModule { }
