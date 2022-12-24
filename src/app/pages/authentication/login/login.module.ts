import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

import { ShowErrorsModule } from '../../../tabs/shared/components/show-errors/show-errors.module'
import { LoginCredentialsComponent } from 'src/app/tabs/login-credentials/login-credentials.component';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    ShowErrorsModule
  ],
  declarations: [LoginComponent],
  entryComponents: [LoginCredentialsComponent]
})
export class LoginModule {
}
