import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { ShowErrorsModule } from '../../../tabs/shared/components/show-errors/show-errors.module';

@NgModule({
  imports: [
    CommonModule,
    RegisterRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    ShowErrorsModule
  ],
  declarations: [RegisterComponent]
})
export class RegisterModule {
}
