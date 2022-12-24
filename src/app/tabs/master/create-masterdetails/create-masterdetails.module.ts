import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateMasterDetailsRoutingModule } from '../create-masterdetails/create-masterdetails-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateMasterdetailsComponent } from '../create-masterdetails/create-masterdetails.component';
import { MasterDetailsCreateUpdateModule } from './masterdetails-create-update/masterdetails-create-update.module'

@NgModule({
  imports: [
    CommonModule,
    CreateMasterDetailsRoutingModule,
    FormsModule,    
    MaterialModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,  
    MasterDetailsCreateUpdateModule,
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateMasterdetailsComponent],
  exports: [CreateMasterdetailsComponent]
})
export class CreateMasterDetailsModule {
}
