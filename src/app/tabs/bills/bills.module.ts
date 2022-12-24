import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinalBillSettlementComponent } from '../../tabs/bills/final-bill-settlement/final-bill-settlement.component';
import { FinalBillSettlementToolbarComponent } from '../../tabs/bills/final-bill-settlement/final-bill-settlement-toolbar/final-bill-settlement-toolbar.component';
import { OutstandingBillsComponent } from '../../tabs/bills/final-bill-settlement/outstanding-bills/outstanding-bills.component';
import { UnbilledConsumptionComponent } from '../../tabs/bills/final-bill-settlement/unbilled-consumption/unbilled-consumption.component';
import { TableStructureModule } from '../../tabs/shared/components/table-structure/table-structure.module';
import { ExpandableTableStructureModule } from '../../tabs/shared/components/expandable-table-structure/expandable-table-structure.module';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { BillsRoutingModule } from './bills-routing.module'
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentDetailsComponent } from '../../tabs/bills/final-bill-settlement/payment-details/payment-details.component';
import { BillAmountDetailsComponent } from '../../tabs/bills/final-bill-settlement/bill-amount-details/bill-amount-details.component';
import { AddNewAccountHeadComponent } from '../../tabs/bills/final-bill-settlement/add-new-account-head/add-new-account-head.component';
import { CreateBillComponent } from '../../tabs/bills/create-bill/create-bill.component';
import { CreateBillToolbarComponent } from '../../tabs/bills/create-bill/create-bill-toolbar/create-bill-toolbar.component';
import { CreateBillPaymentComponent } from './create-bill-payment/create-bill-payment.component';
import { CreateBillFooterToolbarComponent } from './create-bill/create-bill-footer-toolbar/create-bill-footer-toolbar.component';
import { FinalBillSettlementFooterToolbarComponent } from './final-bill-settlement/final-bill-settlement-footer-toolbar/final-bill-settlement-footer-toolbar.component';
import { BillHistoryComponent } from './bill-history/bill-history.component';
import { BillHistoryToolbarComponent } from './bill-history/bill-history-toolbar/bill-history-toolbar.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { PaymentHistoryToolbarComponent } from './payment-history/payment-history-toolbar/payment-history-toolbar.component';
import { AccountHeadDetailsComponent } from './final-bill-settlement/account-head-details/account-head-details.component';
import { BillHistoryFooterToolbarComponent } from './bill-history/bill-history-footer-toolbar/bill-history-footer-toolbar.component';
import { EmailPdfReportComponent } from './email-pdf-report/email-pdf-report.component';
import { BillCancelComponent } from './bill-history/bill-cancel/bill-cancel.component';
import { BillHistoryCancelComponent } from "./bill-history-cancel/bill-history-cancel.component";
import { BillHistoryCancelFooterToolbarComponent } from "./bill-history-cancel/bill-history-cancel-footer-toolbar/bill-history-cancel-footer-toolbar.component";
import { PaymentHistoryFooterToolbarComponent } from "./payment-history/payment-history-footer-toolbar/payment-history-footer-toolbar.component";
import { PaymentCancelComponent } from "./payment-history/payment-cancel/payment-cancel.component";
import { PaymentHistoryCancelComponent } from "./payment-history-cancel/payment-history-cancel.component";
import { BillConsumptionComponent } from './bill-consumption/bill-consumption.component';
import { BillConsumptionToolbarComponent } from './bill-consumption/bill-consumption-toolbar/bill-consumption-toolbar.component';
import { BillConsumptionDetailsComponent } from './bill-consumption/bill-consumption-details/bill-consumption-details.component';
import { FailedBillsComponent } from './failed-bills/failed-bills.component';
import { FailedBillsToolbarComponent } from './failed-bills/failed-bills-toolbar/failed-bills-toolbar.component';
import { FailedBillsFooterToolbarComponent } from './failed-bills/failed-bills-footer-toolbar/failed-bills-footer-toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CreatePaymentdueComponent } from './create-paymentdue/create-paymentdue.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateRefundComponent } from './create-refund/create-refund.component';
import { ManualBillConsumptionComponent } from './failed-bills/manual-bill-consumption/manual-bill-consumption.component';
import { TenantPaymentComponent } from './tenant-payment/tenant-payment.component';
import { TenantOutstandingBillsComponent } from './final-bill-settlement/tenant-outstanding-bills/tenant-outstanding-bills.component';
import { InvoiceAgingReportComponent } from "./invoice-aging-report/invoice-aging-report.component";
import { InvoiceAgingReportFooterToolbarComponent } from "./invoice-aging-report/invoice-aging-report-footer-toolbar/invoice-aging-report-footer-toolbar.component";
import { CreateConsolidatedComponent } from './create-consolidated/create-consolidated.component';
import { CreateMeterErrorDetailsComponent } from '../meter/create-meter-error-details/create-meter-error-details.component';
import { DynamicTableStructureModule } from '../shared/components/dynamic-table-structure/dynamic-table-structure.module';
import { CreditNoteDetailsComponent } from './final-bill-settlement/credit-note-details/credit-note-details.component';
import { CreditNoteHistoryComponent } from './credit-note-history/credit-note-history.component';
import { CreditNoteHistoryDetailsComponent } from './credit-note-history/credit-note-history-details/credit-note-history-details.component';
import { CreditNoteHistoryToolbarComponent } from './credit-note-history/credit-note-history-toolbar/credit-note-history-toolbar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AccountStatementComponent } from './account-statement/account-statement.component';
import { AccountStatementFooterToolbarComponent } from './account-statement/account-statement-footer-toolbar/account-statement-footer-toolbar.component';
import { AccountStatementToolbarComponent } from './account-statement/account-statement-toolbar/account-statement-toolbar.component';
import { NotificationsSendDialogModule } from '../shared/components/notifications-send-dialog/notifications-send-dialog.module';
import { DirectivesModule } from '../shared/custom-directives/custom-directives.module';
import { PipesModule } from '../shared/custom-pipes/pipes-module';

@NgModule({
  imports: [
    CommonModule,
    BillsRoutingModule,
    FormsModule,
    TableStructureModule,
    ExpandableTableStructureModule,
    DynamicTableStructureModule,
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
    MatTooltipModule,
    MatDialogModule,
    NotificationsSendDialogModule,
    DirectivesModule,
    PipesModule
  ],
  declarations: [
    FinalBillSettlementComponent,
    FinalBillSettlementToolbarComponent,
    OutstandingBillsComponent,
    UnbilledConsumptionComponent,
    PaymentDetailsComponent,
    BillAmountDetailsComponent,
    AddNewAccountHeadComponent,
    AccountHeadDetailsComponent,
    CreateBillComponent,
    CreateBillToolbarComponent,
    CreateBillPaymentComponent,
    CreateBillFooterToolbarComponent,
    FinalBillSettlementFooterToolbarComponent,
    BillHistoryComponent,
    BillHistoryToolbarComponent,
    PaymentHistoryComponent,
    PaymentHistoryToolbarComponent,
    PaymentHistoryFooterToolbarComponent,
    BillHistoryFooterToolbarComponent,
    EmailPdfReportComponent,
    BillCancelComponent,
    BillHistoryCancelComponent,
    BillHistoryCancelFooterToolbarComponent,
    PaymentCancelComponent,
    PaymentHistoryCancelComponent,
    BillConsumptionComponent,
    BillConsumptionToolbarComponent,
    BillConsumptionDetailsComponent,
    FailedBillsComponent,
    FailedBillsToolbarComponent,
    FailedBillsFooterToolbarComponent,
    CreatePaymentdueComponent,
    CreateRefundComponent,
    ManualBillConsumptionComponent,
    TenantPaymentComponent,
    TenantOutstandingBillsComponent,
    InvoiceAgingReportComponent,
    InvoiceAgingReportFooterToolbarComponent,
    CreateConsolidatedComponent,
    CreateMeterErrorDetailsComponent,
    CreditNoteDetailsComponent,
    CreditNoteHistoryComponent,
    CreditNoteHistoryDetailsComponent,
    CreditNoteHistoryToolbarComponent,
    AccountStatementComponent,
    AccountStatementFooterToolbarComponent,
    AccountStatementToolbarComponent
  ],
  providers: [DatePipe, DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class BillsModule { }