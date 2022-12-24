import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateTaxSettingsRoutingModule } from '../create-tax-settings/create-tax-settings-routing.module';
import { TaxSettingsCreateUpdateModule } from '../create-tax-settings/tax-settings-create-update/tax-settings-create-update.module';
import { CreateTaxSettingsComponent } from '../create-tax-settings/create-tax-settings.component';

@NgModule({
    imports: [
      CommonModule,
      CreateTaxSettingsRoutingModule,
      FormsModule,
      MaterialModule,
      FurySharedModule,
      TaxSettingsCreateUpdateModule,
  
      // Core
      ListModule,
      BreadcrumbsModule
    ],
    declarations: [CreateTaxSettingsComponent],
    exports: [CreateTaxSettingsComponent]
  })
  
  export class CreateTaxSettingsModule {
  }
  