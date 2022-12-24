import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreatenewsRoutingModule } from './createnews-routing.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill';
import { CreatenewsComponent } from './createnews/createnews.component';
import { MaterialModule } from '../../../@fury/shared/material-components.module';

@NgModule({
  declarations: [CreatenewsComponent],
  imports: [
    CommonModule,
    CreatenewsRoutingModule,
    QuillModule.forRoot(),
    FurySharedModule,
    ReactiveFormsModule,
    
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,

    MaterialModule,

  ]
})
export class CreatenewsModule { }
