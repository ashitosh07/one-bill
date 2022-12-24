import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmsGeneralDashboardComponent } from '../ems-dashboard/ems-general-dashboard/ems-general-dashboard.component';

const routes: Routes = [{
  path:'',
  component: EmsGeneralDashboardComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmsDashboardRoutingModule { }
