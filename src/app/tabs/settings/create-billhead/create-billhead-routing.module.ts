import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillheadComponent } from './create-billhead.component';
const routes: Routes = [
    {
      path: '',
      component: CreateBillheadComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateBillheadRoutingModule{

}