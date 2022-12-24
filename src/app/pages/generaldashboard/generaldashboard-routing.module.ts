import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneraldashboardComponent } from './generaldashboard.component';


const routes: Routes = [
  {
    path: '',
    component: GeneraldashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneraldashboardRoutingModule { }
