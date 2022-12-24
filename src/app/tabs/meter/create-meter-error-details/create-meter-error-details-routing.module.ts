import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateMeterErrorDetailsComponent } from './create-meter-error-details.component';

const routes: Routes = [
  {
    path:'',
    component: CreateMeterErrorDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterErrorDetailsRoutingModule { }
