import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateOwnerRegisteredRoutingModule } from './create-owner-registered-routing.module';
import { CreateOwnerRegisteredComponent } from './create-owner-registered.component';
import { OwnerRegisteredCreateUpdateModule } from './owner-registered-create-update/owner-registered-create-update.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CreateOwnerRegisteredRoutingModule,
    FormsModule,ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    OwnerRegisteredCreateUpdateModule,
    BreadcrumbsModule
  ],
  declarations: [CreateOwnerRegisteredComponent],
  exports: [CreateOwnerRegisteredComponent]
})
export class CreateOwnerRegisteredModule {
}
