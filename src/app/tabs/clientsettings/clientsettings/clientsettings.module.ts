import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsettingsRoutingModule } from './clientsettings-routing.module';
import { ClientsettingsComponent } from './clientsettings.component';
import { MaterialModule } from '../../../../../src/@fury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FurySharedModule } from '../../../../../src/@fury/fury-shared.module';
import { ClientSettingsMessageComponent } from './client-settings-message/client-settings-message.component';
import { ClientSettingsLedgerRelationComponent } from './client-settings-ledger-relation/client-settings-ledger-relation.component';
import { ClientSettingsLocalisationComponent } from './client-settings-localisation/client-settings-localisation.component';
import { MatTableModule } from '@angular/material/table';
import { GeneralComponent } from './general/general.component';
import { SequencenumberComponent } from './sequencenumber/sequencenumber.component';
import { EmailsettingsComponent } from './emailsettings/emailsettings.component';
import { CopyClientSettingsComponent } from './copy-client-settings/copy-client-settings.component';
 import { UserConfirmationDialogModule } from '../../shared/components/user-confirmation-dialog/user-confirmation-dialog.module';
import { ClientInvoiceTermsComponent } from './client-invoice-terms/client-invoice-terms.component';
import { DirectivesModule } from '../../shared/custom-directives/custom-directives.module';

@NgModule({
  declarations: [ClientsettingsComponent,
    ClientSettingsMessageComponent,
    ClientSettingsLedgerRelationComponent,
    ClientSettingsLocalisationComponent,
    GeneralComponent,
    SequencenumberComponent,
    EmailsettingsComponent,
    CopyClientSettingsComponent,
    ClientInvoiceTermsComponent],
  imports: [
    CommonModule,
    ClientsettingsRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    MatTableModule,
    UserConfirmationDialogModule,
    DirectivesModule
  ]
})
export class ClientsettingsModule { }
