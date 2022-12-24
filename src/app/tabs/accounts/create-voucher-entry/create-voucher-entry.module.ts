import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateVoucherEntryRoutingModule } from './create-voucher-entry-routing.module';
import { CreateVoucherEntryComponent } from '../create-voucher-entry/create-voucher-entry.component';

@NgModule({
  imports: [
    CommonModule,
    
    FormsModule,    
    MaterialModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,  
    CreateVoucherEntryRoutingModule,
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateVoucherEntryComponent],
  exports: [CreateVoucherEntryComponent]
})
export class CreateVoucherEntryModule {
}
