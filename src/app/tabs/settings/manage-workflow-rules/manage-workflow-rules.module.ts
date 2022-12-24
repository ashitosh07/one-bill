import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { ManageWorkflowRulesComponent } from '../manage-workflow-rules/manage-workflow-rules.component';
import { ManageWorkflowRulesRoutingModule } from '../manage-workflow-rules/manage-workflow-rules-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  imports: [
    CommonModule,
    ManageWorkflowRulesRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    ListModule,
    BreadcrumbsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule
  ],
  declarations: [ManageWorkflowRulesComponent],
  exports: [ManageWorkflowRulesComponent]
})
export class ManageWorkflowRulesModule {
}
