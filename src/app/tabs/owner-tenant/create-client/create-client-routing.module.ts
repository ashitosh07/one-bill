import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateClientComponent } from './create-client.component';

const routes: Routes = [
  {
    path: '',
    component: CreateClientComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateClientRoutingModule {
}
