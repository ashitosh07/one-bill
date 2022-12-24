import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateBenchmarkSettingsRoutingModule } from './create-benchmark-settings-routing.module';
import { CreateBenchmarkSettingsComponent } from './create-benchmark-settings.component';
import { BenchmarkSettingsCreateUpdateComponent } from './benchmark-settings-create-update/benchmark-settings-create-update.component';


@NgModule({
  imports: [
    CommonModule,
    CreateBenchmarkSettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [CreateBenchmarkSettingsComponent, BenchmarkSettingsCreateUpdateComponent],
  exports: [CreateBenchmarkSettingsComponent]
})
export class CreateBenchmarkSettingsModule {
}
