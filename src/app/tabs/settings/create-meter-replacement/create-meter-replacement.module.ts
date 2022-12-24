import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { FuryCardModule } from '../../../../@fury/shared/card/card.module';
import { CreateMeterReplacementComponent } from './create-meter-replacement.component';
import { CreateMeterReplacementRoutingModule } from './create-meter-replacement-routing.module';
import { ShowErrorsModule } from '../../shared/components/show-errors/show-errors.module';
import { MeterReplacementCreateUpdateModule } from './meter-replacement-create-update/meter-replacement-create-update.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    CreateMeterReplacementRoutingModule,
    ShowErrorsModule,
    ReactiveFormsModule,
    FuryCardModule,
    MeterReplacementCreateUpdateModule,

    // Core
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateMeterReplacementComponent],
  exports: [CreateMeterReplacementComponent]
})
export class CreateMeterReplacementModule {
}
