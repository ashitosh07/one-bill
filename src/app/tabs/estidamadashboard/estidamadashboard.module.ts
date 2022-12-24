import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstidamadashboardRoutingModule } from './estidamadashboard-routing.module';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';
import { ChartModule } from 'angular-highcharts';
import { MatCardModule } from '@angular/material/card';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from '../../../../src/@fury/shared/material-components.module';
import { EstidamadashboardComponent } from './estidamadashboard.component';

@NgModule({
  declarations: [EstidamadashboardComponent],
  imports: [
    CommonModule,
    EstidamadashboardRoutingModule,
    HighchartsChartModule,
    ChartModule,
    MatCardModule,
    FurySharedModule,
    MaterialModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class EstidamadashboardModule { }
