import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateServiceDisconnectionRoutingModule } from '../create-service-disconnection/create-service-disconnection-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateServiceDisconnectionComponent } from '../create-service-disconnection/create-service-disconnection.component';
import { ServiceDisconnectionCreateUpdateModule } from './service-disconnection-create-update/service-disconnection-create-update.module'

@NgModule({
  imports: [
    CommonModule,
    CreateServiceDisconnectionRoutingModule,
    FormsModule,    
    MaterialModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,  
    ServiceDisconnectionCreateUpdateModule,
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateServiceDisconnectionComponent],
  exports: [CreateServiceDisconnectionComponent]
})
export class CreateServiceDisconnectionModule {
}
