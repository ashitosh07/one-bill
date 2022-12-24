import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOwnerRegisteredComponent } from './create-owner-registered.component';

const routes: Routes = [
  {
    path: '',
    component: CreateOwnerRegisteredComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateOwnerRegisteredRoutingModule {
}
