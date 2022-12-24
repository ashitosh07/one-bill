import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';

const routes: Routes = [
  {
    path:'',
    component:UserprofileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
