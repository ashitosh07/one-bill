import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientsettingsComponent } from './clientsettings.component';

const routes: Routes = [
  {
    path:'',
    component:ClientsettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsettingsRoutingModule { }
