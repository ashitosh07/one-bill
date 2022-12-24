import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SendsmsRoutingModule } from './sendsms-routing.module';
import { SendsmsComponent } from './sendsms/sendsms.component';
import { SendemailComponent } from './sendemail/sendemail.component';
import { QuillModule } from 'ngx-quill';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@NgModule({
  declarations: [SendsmsComponent,SendemailComponent],
  imports: [
    CommonModule,
    SendsmsRoutingModule,
    QuillModule.forRoot(),
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FurySharedModule,
    MaterialModule,
    MatInputModule,
    MatDialogModule
    
  ]
})
export class SendsmsModule { }
