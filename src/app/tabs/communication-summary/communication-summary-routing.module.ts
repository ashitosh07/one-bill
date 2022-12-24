import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommunicationSummaryComponent } from './communication-summary.component';

const routes: Routes = [
  {
    path: '',
    component:CommunicationSummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunicationSummaryRoutingModule { }
