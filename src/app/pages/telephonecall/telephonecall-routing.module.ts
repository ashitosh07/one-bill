import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TelephoneCallUpdateComponent } from './telephone-call-update/telephone-call-update.component';
import { TelephoneCallsListComponent } from './telephone-calls-list/telephone-calls-list.component';

const routes: Routes = [
  {
    path:'create-call-logs',
    component:TelephoneCallUpdateComponent
  },
  {
    path:'view-call-logs',
    component:TelephoneCallsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TelephonecallRoutingModule { }
