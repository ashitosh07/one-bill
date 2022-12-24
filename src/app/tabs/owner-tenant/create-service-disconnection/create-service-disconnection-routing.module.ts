import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateServiceDisconnectionComponent } from './create-service-disconnection.component';

const routes: Routes = [
  {
    path: '', 
    component: CreateServiceDisconnectionComponent    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateServiceDisconnectionRoutingModule {
}
