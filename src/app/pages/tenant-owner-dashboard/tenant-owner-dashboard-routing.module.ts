import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsComponent } from './tenant-owner-dashboard/news/news.component';
import { TenantOwnerDashboardComponent } from './tenant-owner-dashboard/tenant-owner-dashboard.component';

const routes: Routes = [
  {
    path:'',
    component:TenantOwnerDashboardComponent
  },
  // {
  //   path:'',
  //   component:NewsComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantOwnerDashboardRoutingModule { }
