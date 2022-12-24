import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateVariablePayRoutingModule } from './create-variablepay-routing.module';
import { CreateVariablepayComponent } from './create-variablepay.component';
import { VariablePayCreateUpdateModule } from './variablepay-create-update/variablepay-create-update.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';


@NgModule({
  imports: [
    CommonModule,
    CreateVariablePayRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    VariablePayCreateUpdateModule,
    BreadcrumbsModule
  ],
  providers: [DecimalPipe],
  declarations: [CreateVariablepayComponent],
  exports: [CreateVariablepayComponent]
})
export class CreateVariablePayModule {
}
