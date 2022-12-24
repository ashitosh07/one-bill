import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginCredentialsComponent } from './login-credentials.component';

const routes: Routes = [{
  path:'',
  component:LoginCredentialsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginCredentialsRoutingModule { }
