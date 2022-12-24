import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeterGroupComponent } from './meter-group.component';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { MeterGroupRoutingModule } from './meter-group-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [MeterGroupComponent ],
  imports: [
    CommonModule,
    MeterGroupRoutingModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbsModule
  ],
  exports:[MeterGroupComponent]
})
export class MeterGroupModule { }
