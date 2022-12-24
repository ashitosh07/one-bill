import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OpenTicketsDashboardComponent } from './open-tickets-dashboard.component';

const routes: Routes = [
  {
    path:'',
    component:OpenTicketsDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpenTicketsDashboardRoutingModule { }
