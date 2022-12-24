import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { RolePagePermissionsComponent } from './role-page-permissions/role-page-permissions.component';
import { TableStructureModule } from '../shared/components/table-structure/table-structure.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FurySharedModule,
    ReactiveFormsModule,
    MaterialModule,
    UserRoutingModule,
    TableStructureModule
  ],
  declarations: [
    RolePagePermissionsComponent
  ]
})
export class UserModule {
}
