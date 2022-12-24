import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Master } from '../models/master.model';
import { BillPeriod } from '../../settings/create-billperiod/billperiod-create-update/billperiod.model';
import { BillMaster } from '../models/bill-master.model';
import { ManageParams } from '../models/manage-params.model';
import { AdvancePayment } from '../models/../models/advance-payment.model';
import { Payment } from '../models/payment.model';
import { Refund } from '../models/refund.model';
import { InvoiceAgingReport } from "../../bills/invoice-aging-report/invoice-aging-report.model";
import { EnvService } from 'src/app/env.service';
import { Bill } from '../models/bill.model';
@Injectable({
    providedIn: 'root'
})
export class BillService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getUtilityTypes() {
        return this.http.get<Master[]>(this.baseUrl + '/bills/utilitytypes');
    }

    getBillPeriods(clientId) {
        return this.http.get<BillPeriod[]>(this.baseUrl + '/bills/billperiods/' + clientId);
    }

    saveAdvancePayment(advancePayment: AdvancePayment) {
        return this.http.post<boolean>(this.baseUrl + '/bills/advancepayment', advancePayment);
    }

    getBillHistory(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            //params = params.append('unitNumber', `${manageParams.unitNumber}`);
            if (manageParams.billPeriodId)
                params = params.append('billPeriodId', `${manageParams.billPeriodId}`);
            if (manageParams.billFeeType)
                params = params.append('billFeeType', `${manageParams.billFeeType}`);
            if (manageParams.billType)
                params = params.append('billType', `${manageParams.billType}`);
            if (manageParams.tenantId)
                params = params.append('ownerId', `${manageParams.tenantId}`);
            if (manageParams.clientId)
                params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<BillMaster[]>(this.baseUrl + '/bills/billhistory', { params });
    }

    getAccountStatement(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            if (manageParams.tenantId)
                params = params.append('ownerId', `${manageParams.tenantId}`);
            if (manageParams.clientId)
                params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<BillMaster[]>(this.baseUrl + '/bills/account/statement', { params });
    }

    getPaymentHistory(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            params = params.append('paymentMode', `${manageParams.paymentMode}`);
            params = params.append('paymentId', `${manageParams.paymentId}`);
            params = params.append('ownerId', `${manageParams.tenantId}`);
            params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<Payment[]>(this.baseUrl + '/bills/paymenthistory', { params });
    }

    getPaymentDetail(paymentId: number, clientId: number) {
        let params: HttpParams = new HttpParams();
        if (paymentId) {
            params = params.append('paymentId', `${paymentId}`);
        }
        if (clientId) {
            params = params.append('clientId', `${clientId}`);
        }
        return this.http.get<Payment[]>(this.baseUrl + '/bills/payment/detail', { params });
    }

    cancelBillHistory(billhistory) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: billhistory
        }

        return this.http.delete<boolean>(this.baseUrl + '/billsettlement/CancelBillHistory', options);
    }

    getBillCancelledHistory(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            // params = params.append('tenantId', `${manageParams.tenantId}`);
            // params = params.append('unitNumber', `${manageParams.unitNumber}`);
            params = params.append('billPeriodId', `${manageParams.billPeriodId}`);
            params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<BillMaster[]>(this.baseUrl + '/bills/billcancelhistory', { params });
    }

    cancelPaymentHistory(paymentHistory) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: paymentHistory
        }

        return this.http.delete<boolean>(this.baseUrl + '/billsettlement/CancelPaymentHistory', options);
    }

    getPaymentCancelHistory(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            params = params.append('paymentMode', `${manageParams.paymentMode}`);
            params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<Payment[]>(this.baseUrl + '/bills/paymentcancelhistory', { params });
    }

    getUtilities(clientId) {
        return this.http.get(this.baseUrl + '/dashboard/' + clientId + '/Utilities');
    }

    GetPaymentDue(fromDate: string, toDate: string, billPeriodId: number, ownerId: number, clientId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('fromDate', `${fromDate}`);
        params = params.append('toDate', `${toDate}`);
        params = params.append('billPeriodId', `${billPeriodId}`);
        params = params.append('ownerId', `${ownerId}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get<Payment[]>(this.baseUrl + '/bills/paymentdue', { params });
    }

    GetRefundReport(fromDate: string, toDate: string, ownerId: number, clientId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('fromDate', `${fromDate}`);
        params = params.append('toDate', `${toDate}`);
        params = params.append('ownerId', `${ownerId}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get<Refund[]>(this.baseUrl + '/bills/refund', { params });
    }

    getInvoiceAgingReport(clientId, toDate: string) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        //params = params.append('billPeriodId', `${billPeriodId}`);
        params = params.append('toDate', `${toDate}`);
        return this.http.get<InvoiceAgingReport[]>(this.baseUrl + '/bills/invoiceAging', { params });
    }

    getConsolidatedData(clientId, billPeriodId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        params = params.append('billPeriodId', `${billPeriodId}`);
        return this.http.get<any[]>(this.baseUrl + '/bills/consolidatedReport', { params });
    }

    getAdvancePaymentDetails(manageParams: ManageParams) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            params = params.append('ownerId', `${manageParams.tenantId}`);
            params = params.append('clientId', `${manageParams.clientId}`);
        }
        return this.http.get<AdvancePayment[]>(this.baseUrl + '/bills/advancePaymentDetails', { params });
    }

    adjustBillsWithAdvance(tenantId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('ownerId', `${tenantId}`);
        return this.http.put<number>(`${this.baseUrl}/billsettlement/adjustBillsWithAdvance/${tenantId}`, null);
    }
    
    getAdvanceInHandForOwnerTenant(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get<AdvancePayment[]>(this.baseUrl + '/bills/advanceInHandForOwnerTenant', { params });
    }

    updateIsFailedStatusInBills(bills: Bill[]) {
        return this.http.put<boolean>(this.baseUrl + '/bills/isFailed/update', bills);
    }

    UpdateIsBillFailedStatusInBillMaster(billMaster: BillMaster) {
        return this.http.put<boolean>(this.baseUrl + '/bills/isBillFailed/update/billMaster', billMaster);
    }

    invoiceView(billMasters: BillMaster[]) {
        return this.http.post<any[]>(this.baseUrl + '/file/report/invoice', billMasters);
    }

    receiptView(payments: Payment[]) {
        return this.http.post<any[]>(this.baseUrl + '/file/report/receipt', payments);
    }

    sdReceiptView(payments: Payment[]) {
        return this.http.post<any[]>(this.baseUrl + '/file/report/sdreceipt', payments);
    }

    accountStatementView(billMasters: BillMaster[]) {
        return this.http.post<any>(this.baseUrl + '/file/report/account/statement', billMasters);
    }

    accountStatementSummaryView(billMasters: BillMaster[]) {
        return this.http.post<any>(this.baseUrl + '/file/report/account/statement/summary', billMasters);
    }


    billSummaryView(billMasters: BillMaster[]) {
        return this.http.post<any>(this.baseUrl + '/file/report/bill/summary', billMasters);
    }

    billConsumptionDetails(manageParams: ManageParams, isApproved: boolean = false) {
        let params: HttpParams = new HttpParams();
        if (manageParams) {
            params = params.append('billPeriodId', `${manageParams.billPeriodId}`);
            params = params.append('clientId', `${manageParams.clientId}`);
            params = params.append('fromDate', `${manageParams.fromDate}`);
            params = params.append('toDate', `${manageParams.toDate}`);
            params = params.append('isApproved', `${isApproved}`);
        }
        return this.http.get<any[]>(this.baseUrl + '/bills/consumption/details', { params });
    }

    invoicePreview(billMaster: BillMaster) {
        return this.http.post<any[]>(this.baseUrl + '/file/report/invoice/preview', billMaster);
    }
}
