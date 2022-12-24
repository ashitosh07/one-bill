import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { AllInOneClientTableRoutingModule } from './all-in-one-client-table-routing.module';
import { AllInOneClientTableComponent } from './all-in-one-client-table.component';
import { ClientCreateUpdateModule } from './client-create-update/client-create-update.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';

@NgModule({
  imports: [
    CommonModule,
    AllInOneClientTableRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,

    // Core
    ListModule,
    ClientCreateUpdateModule,
    BreadcrumbsModule
  ],
  declarations: [AllInOneClientTableComponent],
  exports: [AllInOneClientTableComponent]
})
export class AllInOneClientTableModule {
}
