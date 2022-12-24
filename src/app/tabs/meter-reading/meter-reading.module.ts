import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { MeterReadingRoutingModule } from './meter-reading-routing.module';
import { MeterReadingComponent } from './meter-reading.component';
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
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SelectDropDownModule } from 'ngx-select-dropdown'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [MeterReadingComponent],
  imports: [
    CommonModule,
    MeterReadingRoutingModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatDividerModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    TreeViewModule,
    MatPaginatorModule,
    SelectDropDownModule,
    NgMultiSelectDropDownModule
  ],
  providers: [DecimalPipe]
})
export class MeterReadingModule { }
