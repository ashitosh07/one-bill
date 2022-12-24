import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVoucherUpdateComponent } from './create-voucher-update.component';

const routes: Routes = [
  {
    path: '', 
    component: CreateVoucherUpdateComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVoucherUpdateRoutingModule {
}
