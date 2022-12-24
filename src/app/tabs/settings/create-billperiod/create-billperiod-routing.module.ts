import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillperiodComponent } from './create-billperiod.component';

const routes: Routes = [
  {
    path: '',
    component: CreateBillperiodComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateBillPeriodRoutingModule {
}
