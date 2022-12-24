import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummaryChartRoutingModule } from './summary-chart-routing.module';
import { SummaryChartComponent } from '../summary-chart.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [SummaryChartComponent],
  imports: [
    CommonModule,
    SummaryChartRoutingModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatButtonModule
  ]
})
export class SummaryChartModule { }
