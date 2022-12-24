import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateVoucherUpdateRoutingModule } from './create-voucher-update-routing.module';
import { CreateVoucherUpdateComponent } from '../create-voucher-update/create-voucher-update.component';

@NgModule({
  imports: [
    CommonModule,
    
    FormsModule,    
    MaterialModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,  
    CreateVoucherUpdateRoutingModule,
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateVoucherUpdateComponent],
  exports: [CreateVoucherUpdateComponent]
})
export class CreateVoucherUpdateModule {
}
