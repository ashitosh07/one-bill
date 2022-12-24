import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    ResetPasswordRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule {
}
