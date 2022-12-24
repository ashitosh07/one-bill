import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcceptanceReportComponent } from './acceptance-report.component';

const routes: Routes = [
  {
    path: '',
    component:AcceptanceReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcceptanceReportRoutingModule { }
