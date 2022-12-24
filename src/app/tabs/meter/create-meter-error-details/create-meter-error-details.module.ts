import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeterErrorDetailsRoutingModule } from './create-meter-error-details-routing.module';
import { CreateMeterErrorDetailsComponent } from './create-meter-error-details.component';
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
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { HighlightModule } from '../../../../@fury/shared/highlightjs/highlight.module';
import { FuryCardModule } from '../../../../@fury/shared/card/card.module';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
//import { PaymentHistoryToolbarComponent } from '../../bills/payment-history/payment-history-toolbar/payment-history-toolbar.component';

@NgModule({
  //declarations: [CreateMeterErrorDetailsComponent],
  imports: [
    CommonModule,
    MeterErrorDetailsRoutingModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    TreeViewModule,
    MatPaginatorModule,
    SelectDropDownModule,
    FurySharedModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
    //,PaymentHistoryToolbarComponent
  ]
})
export class MeterErrorDetailsModule { }
