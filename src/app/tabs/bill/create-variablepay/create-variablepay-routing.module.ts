import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVariablepayComponent } from './create-variablepay.component';

const routes: Routes = [
  {
    path: '',
    component: CreateVariablepayComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVariablePayRoutingModule {
}
