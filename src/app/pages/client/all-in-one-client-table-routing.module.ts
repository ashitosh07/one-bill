import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllInOneClientTableComponent } from './all-in-one-client-table.component';

const routes: Routes = [
  {
    path: '',
    component: AllInOneClientTableComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllInOneClientTableRoutingModule {
}
