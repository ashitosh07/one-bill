import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvancePaymentComponent } from './advance-payment.component';


const routes: Routes = [
  {
    path: '',
    component: AdvancePaymentComponent

  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvancePaymentRoutingModule {
}
