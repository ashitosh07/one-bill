import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVoucherEntryComponent } from './create-voucher-entry.component';

const routes: Routes = [
  {
    path: '', 
    component: CreateVoucherEntryComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVoucherEntryRoutingModule {
}
