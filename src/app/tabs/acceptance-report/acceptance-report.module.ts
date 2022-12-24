import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcceptanceReportComponent } from './acceptance-report.component';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { AcceptanceReportRoutingModule } from './acceptance-report-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';

@NgModule({
  declarations: [AcceptanceReportComponent],
  imports: [
    CommonModule,
    AcceptanceReportRoutingModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    BreadcrumbsModule
  ],
  exports: [AcceptanceReportComponent]
})
export class AcceptanceReportModule { }
