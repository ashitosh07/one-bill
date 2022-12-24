import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOwnerComponent } from './create-owner.component';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';

const routes: Routes = [
  {
    path: '',
    component: CreateOwnerComponent

  },
  {
    path: ':ownerId',
    component: OwnerDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateOwnerRoutingModule {
}
