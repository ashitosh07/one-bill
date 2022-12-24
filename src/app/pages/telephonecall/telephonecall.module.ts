import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TelephonecallRoutingModule } from './telephonecall-routing.module';
import { TelephoneCallUpdateComponent } from './telephone-call-update/telephone-call-update.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { TelephoneCallsListComponent } from './telephone-calls-list/telephone-calls-list.component';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { ListModule } from 'src/@fury/shared/list/list.module';
import { BreadcrumbsModule } from 'src/@fury/shared/breadcrumbs/breadcrumbs.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewTextComponent } from './view-text/view-text.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UserMasterModule } from '../../tabs/shared/components/create-user-master/create-user-master.module';

@NgModule({
  declarations: [TelephoneCallUpdateComponent, TelephoneCallsListComponent, ViewTextComponent],
  imports: [
    CommonModule,
    TelephonecallRoutingModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSelectModule,
    MatOptionModule,
    MaterialModule,
    UserMasterModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    BreadcrumbsModule,
    MatDialogModule
  ]
})
export class TelephonecallModule { }
