import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EstidamadashboardComponent } from './estidamadashboard.component';

const routes: Routes = [
  {
    path: '',
    component: EstidamadashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstidamadashboardRoutingModule { }
