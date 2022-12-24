import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateDeviceDataDetailsComponent } from '../create-device-data-details/create-device-data-details.component';

const routes: Routes = [
  {
    path:'',
    component: CreateDeviceDataDetailsComponent
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeterDeviceDataDetailsRoutingModule { }
