import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmsAlarmComponent } from './ems-alarm.component';

const routes: Routes = [
  {
    path: '',
    component:EmsAlarmComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmsAlarmRoutingModule { }
