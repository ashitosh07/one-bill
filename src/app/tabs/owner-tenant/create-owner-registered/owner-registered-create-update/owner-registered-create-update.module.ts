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
import { OwnerRegisteredCreateUpdateComponent } from './owner-registered-create-update.component';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { ToolbarModule } from "../../../../layout/toolbar/toolbar.module";
import { FurySharedModule } from '../../../../../@fury/fury-shared.module';
import { UserConfirmationModule } from '../../../shared/components/user-confirmation-popup/user-confirmation-popup.module';
import { UserMasterModule } from '../../../shared/components/create-user-master/create-user-master.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FuryCardModule,
    FurySharedModule,
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
    ShowErrorsModule,
    ToolbarModule,
    UserConfirmationModule,
    UserMasterModule
  ],
  declarations: [OwnerRegisteredCreateUpdateComponent],
  entryComponents: [OwnerRegisteredCreateUpdateComponent],
  exports: [OwnerRegisteredCreateUpdateComponent]
})
export class OwnerRegisteredCreateUpdateModule {
}
