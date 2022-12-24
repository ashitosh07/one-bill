import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';
// import { HammerModule } from '@angular/platform-browser';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateContractRoutingModule } from '../../../../app/tabs/owner-tenant/create-contract/create-contract-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateContractComponent } from '../create-contract/create-contract.component';
import { ContractCreateUpdateModule } from './contract-create-update/contract-create-update.module';
import { BillRefundComponent } from './bill-refund/bill-refund.component';
import { ContractEndDetailsComponent } from './contract-end-details/contract-end-details.component'
import { DirectivesModule } from '../../shared/custom-directives/custom-directives.module';
import { PipesModule } from '../../shared/custom-pipes/pipes-module';

@NgModule({
  imports: [
    CommonModule,
    CreateContractRoutingModule,
    // BrowserModule,
    FormsModule,    
    MaterialModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,  
    ContractCreateUpdateModule,
    ListModule,
    // HammerModule,
    BreadcrumbsModule,
    DirectivesModule,
    PipesModule
  ],
  providers: [DatePipe, DecimalPipe],
  declarations: [CreateContractComponent, BillRefundComponent, ContractEndDetailsComponent],
  exports: [CreateContractComponent]
})
export class CreateContractModule {
}
