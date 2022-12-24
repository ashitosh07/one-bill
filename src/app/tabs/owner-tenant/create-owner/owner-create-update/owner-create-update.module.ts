import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { OwnerCreateUpdateComponent } from './owner-create-update.component';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { ToolbarModule } from "../../../../layout/toolbar/toolbar.module";
import { UserConfirmationModule } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.module';
import { UserMasterModule } from '../../../shared/components/create-user-master/create-user-master.module';

@NgModule({
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
    UserMasterModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    ShowErrorsModule,
    ToolbarModule,
    UserConfirmationModule
  ],
  declarations: [OwnerCreateUpdateComponent],
  entryComponents: [OwnerCreateUpdateComponent],
  exports: [OwnerCreateUpdateComponent]
})
export class OwnerCreateUpdateModule {
}
