import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvanceInHandComponent } from './advance-in-hand.component';


const routes: Routes = [
  {
    path: '',
    component: AdvanceInHandComponent
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvanceInHandRoutingModule {
}
