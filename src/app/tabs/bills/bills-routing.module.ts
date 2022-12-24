import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillComponent } from '../../tabs/bills/create-bill/create-bill.component';
import { FinalBillSettlementComponent } from '../../tabs/bills/final-bill-settlement/final-bill-settlement.component';
import { CreateBillPaymentComponent } from './create-bill-payment/create-bill-payment.component';
import { BillHistoryComponent } from './bill-history/bill-history.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { EmailPdfReportComponent } from './email-pdf-report/email-pdf-report.component';
import { BillHistoryCancelComponent } from "./bill-history-cancel/bill-history-cancel.component";
import { PaymentHistoryCancelComponent } from './payment-history-cancel/payment-history-cancel.component';
import { BillConsumptionComponent } from './bill-consumption/bill-consumption.component';
import { FailedBillsComponent } from './failed-bills/failed-bills.component';
import { CreatePaymentdueComponent } from './create-paymentdue/create-paymentdue.component';
import { CreateRefundComponent } from './create-refund/create-refund.component';
import { TenantPaymentComponent } from './tenant-payment/tenant-payment.component';
import { InvoiceAgingReportComponent } from "./invoice-aging-report/invoice-aging-report.component";
import { CreateConsolidatedComponent } from './create-consolidated/create-consolidated.component';
import { CreditNoteHistoryComponent } from './credit-note-history/credit-note-history.component';
import { AccountStatementComponent } from './account-statement/account-statement.component';

const routes: Routes = [
    {
        path: 'create-bill',
        component: CreateBillComponent
    },
    {
        path: 'create-bill-payment',
        component: CreateBillPaymentComponent
    },
    {
        path: 'final-bill-settlement',
        component: FinalBillSettlementComponent
    },
    {
        path: 'bill-history',
        component: BillHistoryComponent
    },
    {
        path: 'approve-bills',
        component: BillHistoryComponent
    },
    {
        path: 'rejected-bills',
        component: BillHistoryComponent
    },
    {
        path: 'bill-history-cancel',
        component: BillHistoryCancelComponent
    },
    {
        path: 'payment-history',
        component: PaymentHistoryComponent
    },
    {
        path: 'payment-history-cancel',
        component: PaymentHistoryCancelComponent
    },
    {
        path: 'email-pdf-report/:type/:id',
        component: EmailPdfReportComponent
    },
    {
        path: 'bill-consumption',
        component: BillConsumptionComponent
    },
    {
        path: 'failed-bills',
        component: FailedBillsComponent
    },
    {
        path: 'create-paymentdue',
        component: CreatePaymentdueComponent
    },
    {
        path: 'create-refund',
        component: CreateRefundComponent
    },
    {
        path: 'tenant-payment',
        component: TenantPaymentComponent
    },
    {
        path: 'invoice-aging-report',
        component: InvoiceAgingReportComponent
    },
    {
        path: 'create-consolidated',
        component: CreateConsolidatedComponent
    },
    {
        path: 'credit-note-history',
        component: CreditNoteHistoryComponent
    },
    {
        path: 'account-statement',
        component: AccountStatementComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BillsRoutingModule {
}