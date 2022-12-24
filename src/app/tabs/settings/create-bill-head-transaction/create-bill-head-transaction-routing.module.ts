import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillHeadTransactionComponent } from './create-bill-head-transaction.component';
const routes: Routes = [
    {
      path: '',
      component: CreateBillHeadTransactionComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateBillHeadTransactionRoutingModule{

}