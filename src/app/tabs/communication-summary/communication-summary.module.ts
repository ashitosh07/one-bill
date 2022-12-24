import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationSummaryComponent } from './communication-summary.component';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { CommunicationSummaryRoutingModule } from './communication-summary-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicTableStructureModule } from '../shared/components/dynamic-table-structure/dynamic-table-structure.module';

@NgModule({
  declarations: [CommunicationSummaryComponent ],
  imports: [
    CommonModule,
    CommunicationSummaryRoutingModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbsModule,
    DynamicTableStructureModule
  ],
  exports:[CommunicationSummaryComponent]
})
export class CommunicationSummaryModule { }
