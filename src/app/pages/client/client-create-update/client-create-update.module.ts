import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ClientCreateUpdateComponent } from './client-create-update.component';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { ScrollbarModule } from '../../../../@fury/shared/scrollbar/scrollbar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MaterialModule,
    ScrollbarModule
  ],
  declarations: [ClientCreateUpdateComponent],
  entryComponents: [ClientCreateUpdateComponent],
  exports: [ClientCreateUpdateComponent]
})
export class ClientCreateUpdateModule {
}
