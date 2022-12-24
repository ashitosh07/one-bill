import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBilltagComponent } from './create-billtag.component';
const routes: Routes = [
    {
      path: '',
      component: CreateBilltagComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateBilltagRoutingModule{

}