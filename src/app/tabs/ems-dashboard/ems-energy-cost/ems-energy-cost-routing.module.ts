import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmsEnergyCostComponent } from './ems-energy-cost.component';

const routes: Routes = [
{
  path: '',
  component: EmsEnergyCostComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmsEnergyCostRoutingModule { }
