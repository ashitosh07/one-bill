import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateUserComponent } from '../create-user/create-user.component';
import { CreateUserRoutingModule } from './create-user-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { BreadcrumbsModule } from '../../../../../src/@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../../src/@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateUserFormModule } from './create-user-form/create-user-form.module';
@NgModule({
  imports: [
    CommonModule,
    CreateUserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,    
    CreateUserFormModule,
    BreadcrumbsModule
  ],
  declarations: [
    CreateUserComponent
    
  ],
  // exports:[CreateUserComponent]
})
export class CreateUserModule {
}
