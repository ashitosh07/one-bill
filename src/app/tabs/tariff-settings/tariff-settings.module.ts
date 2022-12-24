import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateTariffSettingsComponent } from '../../tabs/tariff-settings/create-tariff-settings/create-tariff-settings.component';
import { FormWizardRoutingModule } from 'src/app/pages/forms/form-wizard/form-wizard-routing.module';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { CreateSeasonalTariffSettingsComponent } from '../tariff-settings/create-tariff-settings/create-seasonal-tariff-settings/create-seasonal-tariff-settings.component';
import { TableStructureModule } from 'src/app/tabs/shared/components/table-structure/table-structure.module';
import { CreatePeakSettingsComponent } from '../tariff-settings/create-tariff-settings/create-peak-settings/create-peak-settings.component';
import { CreateSlabRateSettingsComponent } from '../tariff-settings/create-tariff-settings/create-slab-rate/create-slab-rate-settings.component';
import { TariffSettingsRoutingModule } from './tariff-settings-routing.module';
import { EditTariffSettingsComponent } from './edit-tariff-settings/edit-tariff-settings.component';
import { EditTariffSettingsDetailsComponent } from './edit-tariff-settings/edit-tariff-settings-details/edit-tariff-settings-details.component';
import { CreateSlabTariffSettingsComponent } from './create-slab-tariff-settings/create-slab-tariff-settings.component';
import { EditSlabTariffSettingsComponent } from './edit-slab-tariff-settings/edit-slab-tariff-settings.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AddTariffItemsComponent } from './add-tariff-items/add-tariff-items.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormWizardRoutingModule,
    FurySharedModule,
    ReactiveFormsModule,
    MaterialModule,
    TariffSettingsRoutingModule,
    TableStructureModule,
    MatDialogModule
  ],
  declarations: [
    CreateTariffSettingsComponent,
    CreateSeasonalTariffSettingsComponent,
    CreatePeakSettingsComponent,
    CreateSlabRateSettingsComponent,
    EditTariffSettingsComponent,
    CreateSlabTariffSettingsComponent,
    EditSlabTariffSettingsComponent,
    EditTariffSettingsDetailsComponent,
    AddTariffItemsComponent],
  exports: []
})
export class TariffSettingsModule {
}
