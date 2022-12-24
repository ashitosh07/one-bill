import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateUnitMasterRoutingModule } from './create-unit-master-routing.module';
import { CreateUnitMasterComponent } from './create-unit-master.component';
import {UnitMasterCreateUpdateModule } from './unit-master-create-update/unit-master-create-update.module';


@NgModule({
  imports: [
    CommonModule,
    CreateUnitMasterRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    UnitMasterCreateUpdateModule,

    // Core
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateUnitMasterComponent],
  exports: [CreateUnitMasterComponent]
})
export class CreateUnitMasterModule {
}
