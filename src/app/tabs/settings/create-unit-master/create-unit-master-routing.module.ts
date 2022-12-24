import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUnitMasterComponent } from './create-unit-master.component';

const routes: Routes = [
  {
    path: '', 
    component: CreateUnitMasterComponent  
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateUnitMasterRoutingModule { }
