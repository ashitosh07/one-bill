import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginreportComponent } from './loginreport.component';

const routes: Routes = [
  {
    path: '',
    component:LoginreportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginreportRoutingModule { }
