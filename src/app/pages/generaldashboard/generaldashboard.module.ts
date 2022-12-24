import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { GeneraldashboardRoutingModule } from './generaldashboard-routing.module';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';
import { ChartModule } from 'angular-highcharts';
import { MatCardModule } from '@angular/material/card';
import { GeneraldashboardComponent } from './generaldashboard.component';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [GeneraldashboardComponent],
  imports: [
    CommonModule,
    GeneraldashboardRoutingModule,
    HighchartsChartModule,
    ChartModule,
    MatCardModule,
    FurySharedModule,
    MaterialModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatToolbarModule
  ],
  providers: [DecimalPipe]
})
export class GeneraldashboardModule { }
