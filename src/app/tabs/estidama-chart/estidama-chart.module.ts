import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';

import { EstidamaChartRoutingModule } from './estidama-chart-routing.module';
import { EstidamaChartComponent } from './estidama-chart.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [EstidamaChartComponent],
  imports: [
    CommonModule,
    EstidamaChartRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatToolbarModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatDividerModule
  ],
  providers: [DatePipe, DecimalPipe]
})
export class EstidamaChartModule { }
