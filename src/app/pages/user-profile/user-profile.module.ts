import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { FuryCardModule } from 'src/@fury/shared/card/card.module';


@NgModule({
  declarations: [UserprofileComponent],
  imports: [
    CommonModule,
    FuryCardModule,
    UserProfileRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserProfileModule { }
