import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateMasterdetailsComponent } from './create-masterdetails.component';

const routes: Routes = [
  {
    path: '', 
    component: CreateMasterdetailsComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateMasterDetailsRoutingModule {
}
