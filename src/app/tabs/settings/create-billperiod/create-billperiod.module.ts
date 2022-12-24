import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateBillPeriodRoutingModule } from './create-billperiod-routing.module';
import { CreateBillperiodComponent } from './create-billperiod.component';
import {BillPeriodCreateUpdateModule } from './billperiod-create-update/billperiod-create-update.module';


@NgModule({
  imports: [
    CommonModule,
    CreateBillPeriodRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    BillPeriodCreateUpdateModule,

    // Core
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateBillperiodComponent],
  exports: [CreateBillperiodComponent]
})
export class CreateBillPeriodModule {
}
