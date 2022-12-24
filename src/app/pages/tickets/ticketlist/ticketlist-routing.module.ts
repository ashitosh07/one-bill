import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from '../createticket/create/create.component';
import { ViewticketsComponent } from '../viewtickets/viewtickets.component';
import { TicketlistComponent } from './ticketlist.component';

const routes: Routes = [
  {
    path:'list',
    component:TicketlistComponent
  },
  {
    path:'view/:id',
    component:ViewticketsComponent
  },
  {
    path:'createticket',
    component:CreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketlistRoutingModule { }
