import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { ConfirmEmailRoutingModule } from './confirm-email-routing.module';
import { ConfirmEmailComponent } from './confirm-email.component';

@NgModule({
  imports: [
    CommonModule,
    ConfirmEmailRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [ConfirmEmailComponent]
})
export class ConfirmEmailModule {
}
