import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from '../../../../environments/environment'
import { ManageParams } from '../models/manage-params.model'
import { BillSettlement } from '../models/bill-settlement.model'
import { Tenant } from '../models/tenant.model'
import { Master } from '../models/master.model'
import { FinalBill } from '../models/final-bill.model'
import { Payment } from '../models/payment.model'
import { BillMaster } from '../models/bill-master.model'
import { UnitMaster } from '../../settings/create-unit-master/unit-master-create-update/unit-master.model'
import { Bill } from '../models/bill.model'
import { ConsumptionAlertRange } from '../models/consumption-alert-range.model'
import { Refund } from '../models/refund.model'
import { CreditNote } from '../models/credit-note.model'
import { BillGenerateParameter } from '../models/bill-generate-parameter.model'
import { ResponseDetails } from '../models/response-details.model'
import { EnvService } from 'src/app/env.service'
import { ConsumptionAlert } from '../models/consumption-alert.model'
import { root } from 'rxjs/internal/util/root'

@Injectable({
  providedIn: 'root',
})
export class BillSettlementService {
  baseUrl = ''
  constructor(private http: HttpClient, private envService: EnvService) {
    this.baseUrl = envService.backend
  }

  getTenantsDetails(clientId, type = 1) {
    return this.http.get<Tenant[]>(
      `${this.baseUrl}/billsettlement/tenants/${clientId}/${type}`
    )
  }

  getUnits(clientId) {
    return this.http.get<UnitMaster[]>(
      `${this.baseUrl}/billsettlement/units/` + clientId
    )
  }

  getAccountNumbers(clientId) {
    return this.http.get<Master[]>(
      `${this.baseUrl}/billsettlement/AccountNumbers/` + clientId
    )
  }

  getPaymentModes() {
    return this.http.get<Master[]>(
      `${this.baseUrl}/billsettlement/paymentmodes`
    )
  }

  getBanks(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append('unitNumber', `${manageParams.unitNumber}`)
      params = params.append('tenantId', `${manageParams.tenantId}`)
      params = params.append('phoneNumber', `${manageParams.phoneNumber}`)
    }
    return this.http.get<Master[]>(`${this.baseUrl}/billsettlement/banks`, {
      params,
    })
  }

  getBillSettlementDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append('unitNumber', `${manageParams.unitNumber}`)
      params = params.append('tenantId', `${manageParams.tenantId}`)
      params = params.append('billPeriodId', `${manageParams.billPeriodId}`)
      params = params.append('settlementDate', `${manageParams.settlementDate}`)
      params = params.append('billType', `${manageParams.billType}`)
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<BillSettlement>(
      this.baseUrl + '/billsettlement/finalsettlement/details',
      { params }
    )
  }

  getBillDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append('utilityTypeId', `${manageParams.utilityTypeId}`)
      params = params.append('billPeriodId', `${manageParams.billPeriodId}`)
      params = params.append('clientId', `${manageParams.clientId}`)
      params = params.append('tenantId', `${manageParams.tenantId}`)
    }
    return this.http.get<BillMaster[]>(
      this.baseUrl + '/billsettlement/unbilledconsumption',
      { params }
    )
  }

  generateBillDetails(billGenerateParameter: BillGenerateParameter) {
    return this.http.post<BillMaster[]>(
      this.baseUrl + '/billsettlement/generate/unbilledconsumption',
      billGenerateParameter
    )
  }

  getOutStandingBillDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append('unitNumber', `${manageParams.unitNumber}`)
      params = params.append('tenantId', `${manageParams.tenantId}`)
      params = params.append('billPeriodId', `${manageParams.billPeriodId}`)
      params = params.append('settlementDate', `${manageParams.settlementDate}`)
      params = params.append('billType', `${manageParams.billType}`)
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<BillSettlement>(
      this.baseUrl + '/billsettlement/outstandingbills',
      { params }
    )
  }

  getTenantBillDetails(tenantId) {
    let params: HttpParams = new HttpParams()
    params = params.append('tenantId', `${tenantId}`)
    return this.http.get<BillSettlement>(
      this.baseUrl + '/billsettlement/outstandingbills',
      { params }
    )
  }

  saveUnBilledConsumptions(bills: BillMaster[]) {
    return this.http.post<boolean>(
      this.baseUrl + '/billsettlement/unbilledconsumption',
      bills
    )
  }

  saveOutstandingBills(finalBill: FinalBill) {
    return this.http.post<boolean>(
      this.baseUrl + '/billsettlement/outstandingbills',
      finalBill
    )
  }

  saveBillPayments(billPayment: Payment) {
    return this.http.post<number>(
      this.baseUrl + '/billsettlement/billpayments',
      billPayment
    )
  }

  // updatePaymentTransactions(paymentTransactions: PaymentTransaction[]) {
  //     return this.http.post<boolean>(this.baseUrl + '/billsettlement/update-payment-transactions', paymentTransactions);
  // }

  getInvoiceBillDetails(billMasterId: string) {
    let params: HttpParams = new HttpParams()
    if (billMasterId) {
      params = params.append('billMasterId', `${billMasterId}`)
    }
    return this.http.get<BillMaster>(
      this.baseUrl + '/template/billmasterdetails',
      { params }
    )
  }

  getReceiptDetails(paymentId: string) {
    let params: HttpParams = new HttpParams()
    if (paymentId) {
      params = params.append('paymentId', `${paymentId}`)
    }
    return this.http.get<Payment>(this.baseUrl + '/template/paymentdetails', {
      params,
    })
  }

  saveRefund(refund: Refund) {
    return this.http.post<boolean>(
      this.baseUrl + '/billsettlement/refund',
      refund
    )
  }

  getBillFailDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append(
        'consumptionType',
        `${manageParams.consumptionTypeId}`
      )
      params = params.append('utilityTypeId', `${manageParams.utilityTypeId}`)
      params = params.append('fromDate', `${manageParams.fromDate}`)
      params = params.append('toDate', `${manageParams.toDate}`)
      params = params.append('days', `${manageParams.days}`)
      params = params.append('percentage', `${manageParams.percentage}`)
      params = params.append('billPeriodId', `${manageParams.billPeriodId}`)
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<Bill[]>(
      this.baseUrl + '/billsettlement/failed/bills',
      { params }
    )
  }

  saveConsumptionRange(consumptionRange: ConsumptionAlertRange) {
    return this.http.post<boolean>(
      this.baseUrl + '/billsettlement/consumption/range',
      consumptionRange
    )
  }

  updateFaileBillsStatus(billMasters: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/failed/bills/update',
      billMasters
    )
  }

  updateBillMasterSyncStatus(billMasterDetails: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/sync/bills/update',
      billMasterDetails
    )
  }

  updatePaymentSyncStatus(paymentDetails: Payment[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/sync/payment/update',
      paymentDetails
    )
  }

  updateRefundSyncStatus(refundDetails: Refund[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/sync/refund/update',
      refundDetails
    )
  }

  updateCreditNoteSyncStatus(creditNoteDetails: CreditNote[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/sync/creditnote/update',
      creditNoteDetails
    )
  }

  deleteConsumptionAlert(id: number, consumptionAlert: ConsumptionAlert) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/consumptionAlert/delete/' + id,
      consumptionAlert
    )
  }

  invoiceGeneration(billMasterDetails: BillMaster[]) {
    return this.http.post<ResponseDetails>(
      this.baseUrl + '/file/report/invoice/generate',
      billMasterDetails
    )
  }

  updateBillMasterApprovedStatus(billMasterDetails: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/approved/bills/update',
      billMasterDetails
    )
  }

  regenerateRejectedBillMasters(billMasterDetails: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/regenerate/billmasters',
      billMasterDetails
    )
  }

  generateOtherTypeInvoiceDetail(clientId: number, contractId: number) {
    let params: HttpParams = new HttpParams()
    params = params.append('clientId', `${clientId}`)
    params = params.append('contractId', `${contractId}`)
    return this.http.post<BillMaster>(
      `${this.baseUrl}/billsettlement/contract/invoice/billmaster/${clientId}/${contractId}`,
      null
    )
  }

  updateOtherTypeConsumption(billMasterDetails: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/othertype/consumption/update',
      billMasterDetails
    )
  }

  updatBillMasterRejectedStatus(billMasterDetails: BillMaster[]) {
    return this.http.put<boolean>(
      this.baseUrl + '/billsettlement/rejected/bills/update',
      billMasterDetails
    )
  }

  saveCreditNote(creditNote: CreditNote) {
    return this.http.post<boolean>(
      this.baseUrl + '/billsettlement/creditnote',
      creditNote
    )
  }

  getCreditNoteDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append('fromDate', `${manageParams.fromDate}`)
      params = params.append('toDate', `${manageParams.toDate}`)
      params = params.append('billPeriodId', `${manageParams.billPeriodId}`)
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<CreditNote[]>(
      this.baseUrl + '/bills/creditnote/history',
      { params }
    )
  }

  getConsumptioSavedAlertDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append(
        'consumptionTypeId',
        `${manageParams.consumptionTypeId ?? 0}`
      )
      params = params.append(
        'utilityTypeId',
        `${manageParams.utilityTypeId ?? 0}`
      )
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<ConsumptionAlertRange[]>(
      this.baseUrl + '/billsettlement/saved/consumption/range/details',
      { params }
    )
  }

  getConumptionAlertDetails(manageParams: ManageParams) {
    let params: HttpParams = new HttpParams()
    if (manageParams) {
      params = params.append(
        'consumptionTypeId',
        `${manageParams.consumptionTypeId}`
      )
      params = params.append('utilityTypeId', `${manageParams.utilityTypeId}`)
      params = params.append('fromDate', `${manageParams.fromDate ?? ''}`)
      params = params.append('startDate', `${manageParams.startDate ?? ''}`)
      params = params.append('endDate', `${manageParams.endDate ?? ''}`)
      params = params.append('percentage', `${manageParams.percentage}`)
      params = params.append(
        'fromBillPeriodId',
        `${manageParams.fromBillPeriodId ?? 0}`
      )
      params = params.append(
        'toBillPeriodId',
        `${manageParams.toBillPeriodId ?? 0}`
      )
      params = params.append('clientId', `${manageParams.clientId}`)
    }
    return this.http.get<Bill[]>(
      this.baseUrl + '/billsettlement/consumption/alert',
      { params }
    )
  }

  getRefundAmount(ownerId: number, paymentId: number) {
    let params: HttpParams = new HttpParams()
    if (ownerId) {
      params = params.append('ownerId', `${ownerId}`)
      params = params.append('paymentId', `${paymentId}`)
    }
    return this.http.get<number>(
      this.baseUrl + '/billsettlement/refundAmount',
      { params }
    )
  }

  creditNoteSummaryView(creditNotes: CreditNote[]) {
    return this.http.post<any>(
      this.baseUrl + '/file/report/creditnote/summary',
      creditNotes
    )
  }

  creditNoteView(creditNote: CreditNote) {
    return this.http.post<any>(
      this.baseUrl + '/file/report/creditnote',
      creditNote
    )
  }
}
