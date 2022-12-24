import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmsGroupwiseEnergycostComponent } from './ems-groupwise-energycost.component';

const routes: Routes = [
{
  path: '',
  component: EmsGroupwiseEnergycostComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmsGroupwiseEnergyCostRoutingModule { }
