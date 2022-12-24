import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SendsmsComponent } from './sendsms/sendsms.component';
import { SendemailComponent } from './sendemail/sendemail.component';

const routes: Routes = [
  {
    path:'sms',
    component:SendsmsComponent
  },
  {
    path:'email',
    component:SendemailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendsmsRoutingModule { }
