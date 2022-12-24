import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableStructureModule } from '../../tabs/shared/components/table-structure/table-structure.module';
import { ExpandableTableStructureModule } from '../../tabs/shared/components/expandable-table-structure/expandable-table-structure.module';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { AdvancePaymentComponent } from "./advance-payment.component";
import { AdvancePaymentToolbarComponent } from "../advance-payment/advance-payment-toolbar/advance-payment-toolbar.component";
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule} from '@angular/material/tooltip';
import { AdvancePaymentRoutingModule } from './advance-payment-routing.module';

@NgModule({
 
  imports: [
    CommonModule,
    AdvancePaymentRoutingModule,
    FormsModule,
    TableStructureModule,
    ExpandableTableStructureModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    HighlightModule,
    FuryCardModule,
    ListModule,
    BreadcrumbsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  declarations: [
    AdvancePaymentComponent,
    AdvancePaymentToolbarComponent
  ],
  providers: [DatePipe, DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AdvancePaymentModule { }
