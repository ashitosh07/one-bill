import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuryCardModule } from '../../../../../@fury/shared/card/card.module';
import { ListModule } from '../../../../../@fury/shared/list/list.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { BillsettingsCreateUpdateComponent } from './billsettings-create-update.component';



@NgModule({
  declarations: [BillsettingsCreateUpdateComponent],
  imports: [
    CommonModule,
    FormsModule,
    FuryCardModule,
    ListModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    ShowErrorsModule
  ],
  entryComponents: [BillsettingsCreateUpdateComponent],
  exports: [BillsettingsCreateUpdateComponent]
})
export class BillsettingsCreateUpdateModule { }
