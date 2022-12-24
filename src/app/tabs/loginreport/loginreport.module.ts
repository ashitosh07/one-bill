import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginreportComponent } from './loginreport.component';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { LoginreportRoutingModule } from './loginreport-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';

@NgModule({
  declarations: [LoginreportComponent ],
  imports: [
    CommonModule,
    LoginreportRoutingModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    BreadcrumbsModule
  ],
  exports:[LoginreportComponent]
})
export class LoginreportModule { }
