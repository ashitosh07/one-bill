import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageWorkflowRulesComponent } from './manage-workflow-rules.component';

const routes: Routes = [
  {
    path: '',
    component: ManageWorkflowRulesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageWorkflowRulesRoutingModule {
}
