import { Component, OnInit, Input, ViewChild } from '@angular/core'
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation'
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation'
import { BillSettlementService } from '../../shared/services/billsettlement.service'
import { ManageParams } from '../../shared/models/manage-params.model'
import { Tenant } from '../../shared/models/tenant.model'
import { BillSettlement } from '../../shared/models/bill-settlement.model'
import { Bill } from '../../shared/models/bill.model'
import { MatSnackBar } from '@angular/material/snack-bar'
import { FinalBill } from '../../shared/models/final-bill.model'
import { PaymentDetailsComponent } from './payment-details/payment-details.component'
import { BillAmountDetailsComponent } from './bill-amount-details/bill-amount-details.component'
import { UnbilledConsumptionComponent } from './unbilled-consumption/unbilled-consumption.component'
import { OutstandingBillsComponent } from './outstanding-bills/outstanding-bills.component'
import { Payment } from '../../shared/models/payment.model'
import { BillMaster } from '../../shared/models/bill-master.model'
import { PaymentTransaction } from '../../shared/models/payment-transaction.model'
import { BillService } from '../../shared/services/bill.service'
import { CookieService } from 'ngx-cookie-service'
import { ListItem } from '../../shared/models/list-item.model'
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { ResponseDetails } from '../../shared/models/response-details.model'
import { TemplateContent } from '../../shared/models/template-content.model'
import { AlertSetting } from '../../shared/models/alert-setting.model'
import { TemplatesService } from 'src/app/pages/templates/templates.service'
import { TemplateService } from '../../shared/services/template.service'
import { environment } from 'src/environments/environment'
import {
  BillType,
  getClientDataFormat,
  stringIsNullOrEmpty,
} from '../../shared/utilities/utility'
import { ListData } from '../../shared/models/list-data.model'
import { ImageProperty } from '../../shared/models/imageProperty.model'
import jsPDF from 'jspdf'
import { ActivatedRoute } from '@angular/router'
import * as moment from 'moment'
import { ClientSelectionService } from '../../shared/services/client-selection.service'
import { EnvService } from 'src/app/env.service'
import { PDFDocument } from 'pdf-lib'

@Component({
  selector: 'final-bill-settlement',
  templateUrl: './final-bill-settlement.component.html',
  styleUrls: ['./final-bill-settlement.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class FinalBillSettlementComponent implements OnInit {
  private _gap = 16
  gap = `${this._gap}px`
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`

  billPeriods: any[] = [{ label: 'Select', value: 0 }]
  paymentModes: any[] = [{ label: 'Select', value: 0 }]
  banks: any[] = [{ label: 'Select', value: 0 }]
  tenants: Tenant[] = []
  billSettlement: BillSettlement = {}
  finalBill: FinalBill = {}
  billPayment: Payment = {}
  manageParams: ManageParams = {}
  selectedRows: Bill[] = []
  advanceAmount: number = 0
  openingBalanceAmount: number = 0
  outStandingAmount: number = 0
  advanceAdjusted: number = 0
  isAdjustWithAdvance: boolean = false
  clientId: number
  bankId: number = 0
  remarks: string = ''
  paymentModeId: number = 0
  paymentDate: Date
  payments: Payment[] = []
  refNumber: string = ''
  paymentAmount: number = 0
  tenantId: number = 0
  showSpinner: boolean = false
  isPrintDisable: boolean = true
  searchByTenant: ListItem = { label: 'Search By Tenant', value: 1 }
  searchByUnit: ListItem = { label: 'Search By Unit', value: 2 }
  searchByAccountNumber: ListItem = {
    label: 'Search By Account Number',
    value: 3,
  }
  options: ListItem[] = [
    this.searchByTenant,
    this.searchByUnit,
    this.searchByAccountNumber,
  ]
  isData: boolean = false
  settlementDate: string = ''
  dateFormat = ''
  currencyFormat = ''
  roundOffFormat = ''
  filePath = ''

  @ViewChild(PaymentDetailsComponent, { static: true })
  paymentDetailsComponent: PaymentDetailsComponent
  @ViewChild(BillAmountDetailsComponent, { static: true })
  billAmountDetailsComponent: BillAmountDetailsComponent
  @ViewChild(UnbilledConsumptionComponent, { static: true })
  unbilledConsumptionComponent: UnbilledConsumptionComponent
  @ViewChild(OutstandingBillsComponent, { static: true })
  outstandingBillsComponent: OutstandingBillsComponent

  constructor(
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private billService: BillService,
    private date: DatePipe,
    private cookieService: CookieService,
    private currency: CurrencyPipe,
    private templatesService: TemplatesService,
    private templateService: TemplateService,
    private decimalPipe: DecimalPipe,
    private clientSelectionService: ClientSelectionService,
    private route: ActivatedRoute,
    private envService: EnvService
  ) {
    this.filePath = envService.backendForFiles
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat
    this.currencyFormat =
      getClientDataFormat('Currency') ?? envService.currencyFormat
    this.roundOffFormat =
      getClientDataFormat('RoundOff') ?? envService.roundOffFormat
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true)
    this.clientId = parseInt(this.cookieService.get('globalClientId'))
    this.getBillPeriods()
    let tenantId: string = ''
    this.route.queryParams.subscribe((params) => {
      if (params.id && params.unit && params.settlement_date) {
        tenantId = params.id
        const unitNumber = params.unit
        this.settlementDate = params.settlement_date
        this.manageParams = {
          unitNumber: unitNumber,
          tenantId: params.id,
          billPeriodId: '0',
          settlementDate: params.settlement_date,
          billType: BillType.FinalBill,
          clientId: this.clientId,
        }
        this.onGetBillSettlementDetails(this.manageParams)
      }
    })
    this.onGetTenants(tenantId)
  }

  onGetTenants(tenantId: string) {
    this.billSettlementService
      .getTenantsDetails(this.clientId)
      .subscribe((data) => {
        this.tenants = data
        if (this.tenants && tenantId) {
          this.tenantId = parseInt(tenantId)
        }
      })
  }

  onGetPaymentModes() {
    this.paymentModes = [{ label: 'Select', value: 0 }]
    this.billSettlementService.getPaymentModes().subscribe((paymentModes) => {
      paymentModes.forEach((x) => {
        this.paymentModes.push({ label: x.description, value: x.id })
      })
    })
  }

  onGetBanks(manageParams: ManageParams) {
    this.banks = [{ label: 'Select', value: 0 }]
    this.billSettlementService.getBanks(manageParams).subscribe((data) => {
      data.forEach((x) => {
        this.banks.push({ label: x.description, value: x.id })
      })
    })
  }

  getBillPeriods() {
    this.billPeriods = [
      {
        label: 'Select',
        value: 0,
        fromDate: Date.now.toString(),
        ToDate: Date.now.toString(),
      },
    ]
    this.billService.getBillPeriods(this.clientId).subscribe((billPeriods) => {
      billPeriods.forEach((x) => {
        this.billPeriods.push({
          label: x.periodDescription,
          value: x.id,
          fromDate: x.periodStart,
          toDate: x.periodEnd,
        })
      })
    })
  }

  onGetBillSettlementDetails(manageParams: ManageParams) {
    this.showSpinner = true
    this.manageParams = manageParams
    this.isPrintDisable = true
    this.onGetPaymentModes()
    this.onGetBanks(manageParams)
    this.billSettlementService
      .getBillSettlementDetails(manageParams)
      .subscribe({
        next: (billSettlement) => {
          this.showSpinner = false
          this.billSettlement = billSettlement
          this.isData =
            billSettlement.outstandingBills &&
            billSettlement.outstandingBills.length
              ? true
              : false
        },
        error: (err) => {
          this.showSpinner = false
        },
      })
  }

  onGetOutStandingBillDetails(manageParams: ManageParams) {
    this.isData = false
    this.manageParams = manageParams
    this.billSettlementService
      .getOutStandingBillDetails(manageParams)
      .subscribe((billSettlement) => {
        this.billSettlement = billSettlement
        this.isData =
          billSettlement.outstandingBills &&
          billSettlement.outstandingBills.length
            ? true
            : false
      })
  }

  onSaveUnbilledConsumption(event: boolean) {
    const billMasterDetails: BillMaster[] =
      this.billSettlement.unbBilledConsumptions
    if (billMasterDetails && billMasterDetails.length) {
      billMasterDetails.forEach((x) => (x.isApproved = true))
    }
    this.billSettlementService
      .saveUnBilledConsumptions(billMasterDetails)
      .subscribe({
        next: (response) => {
          if (response) {
            this.notificationMessage(
              'Bill saved successfully',
              'green-snackbar'
            )
            this.unbilledConsumptionComponent.unBilledConsumptions = []
            this.onGetOutStandingBillDetails(this.manageParams)
          } else {
            this.notificationMessage('Bill save failed', 'red-snackbar')
          }
        },
        error: (err) => {
          this.notificationMessage('Bill save failed', 'red-snackbar')
        },
      })
  }

  // updateBillsPaymentId(paymentId: number) {
  //   const bills = this.billSettlement.outstandingBills;
  //   // if (bills && bills.length) {
  //   //   bills.forEach(x => x.paymentId = paymentId);
  //   // }
  //   const paymentTransactions: PaymentTransaction[] = [];
  //   this.billSettlementService.updatePaymentTransactions(paymentTransactions).subscribe(
  //     response => {
  //       if (response) {
  //         this.notificationMessage('Final bill saved successfully', 'green-snackbar');
  //         this.outstandingBillsComponent.outStandingBills = [];
  //         this.billAmountDetailsComponent.accountHeads = [];
  //       } else {
  //         this.notificationMessage('Final bill save failed', 'green - snackbar');
  //       }
  //     });
  // }

  // onSaveFinalBill(event: boolean) {
  //   this.finalBill = {};
  //   this.onGetValues();
  //   this.updateOutstandingBills();
  //   this.billSettlementService.saveOutstandingBills(this.finalBill).subscribe(
  //     response => {
  //       if (response) {
  //         this.onSaveBillPayments();
  //       } else {
  //         this.notificationMessage('Final bill save failed', 'green - snackbar');
  //       }
  //     });
  // }

  // onSaveBillPayments() {
  //   this.billPayment = {};
  //   this.updateBillPayments();
  //   this.billSettlementService.saveBillPayments(this.billPayment).subscribe(
  //     response => {
  //       if (response !== 0) {
  //         this.updateBillsPaymentId(response);
  //       } else {
  //         this.notificationMessage('Final bill save failed', 'green - snackbar');
  //       }
  //     });
  // }

  onSaveBillPayment(event: boolean) {
    const billMasterDetails = this.billSettlement.outstandingBills
    if (billMasterDetails && billMasterDetails.length) {
      this.onGetValues()
      this.updateBillPayments()
      this.updatePaymentTransactions()
      this.billSettlementService.saveBillPayments(this.billPayment).subscribe({
        next: (response) => {
          if (response) {
            this.reset()
            this.onGetPaymentDetail(response)
            this.notificationMessage(
              'Bill payment saved successfully',
              'green-snackbar'
            )
          } else {
            this.notificationMessage('Bill payment save failed', 'red-snackbar')
          }
        },
        error: (err) => {
          this.notificationMessage('Bill payment save failed', 'red-snackbar')
        },
      })
    }
  }

  onGetPaymentDetail(paymentId: number) {
    this.payments = []
    this.isPrintDisable = true
    const clientId = Number(this.cookieService.get('globalClientId'))
    this.dateFormat = getClientDataFormat('DateFormat')
    this.roundOffFormat = getClientDataFormat('RoundOff')
    this.currencyFormat = getClientDataFormat('Currency')
    this.billService
      .getPaymentDetail(paymentId, clientId)
      .subscribe((payments) => {
        payments.forEach((payment) => {
          payment.paymentDateLocal = this.date.transform(
            payment.paymentDate.toString(),
            this.dateFormat.toString()
          )
          payment.referenceDateLocal = this.date.transform(
            payment.referenceDate.toString(),
            this.dateFormat.toString()
          )
          payment.paymentAmountLocal = this.currency.transform(
            payment.paymentAmount,
            this.currencyFormat.toString(),
            true,
            this.roundOffFormat
          )
          payment.advanceAmountLocal = this.currency.transform(
            payment.advanceAmount,
            this.currencyFormat.toString(),
            true,
            this.roundOffFormat
          )
          payment.billMasters.forEach((billMaster) => {
            billMaster.billDateLocal = this.date.transform(
              billMaster.billDate.toString(),
              this.dateFormat.toString()
            )
            billMaster.billAmountLocal = this.currency.transform(
              billMaster.billAmount,
              this.currencyFormat.toString(),
              true,
              this.roundOffFormat
            )
            billMaster.fromDateLocal = this.date.transform(
              billMaster.fromDate.toString(),
              this.dateFormat.toString()
            )
            billMaster.toDateLocal = this.date.transform(
              billMaster.toDate.toString(),
              this.dateFormat.toString()
            )
            billMaster.dueDateLocal = this.date.transform(
              billMaster.dueDate.toString(),
              this.dateFormat.toString()
            )
            billMaster.paidLocal = this.currency.transform(
              billMaster.paid.toString(),
              this.currencyFormat.toString(),
              true,
              this.roundOffFormat
            )
          })
        })
        this.payments = payments
        this.isPrintDisable = false
        this.getClientAlertSettings(paymentId)
      })
  }

  getClientAlertSettings(paymnetId: number) {
    this.templatesService.getClientAlertSettings(this.clientId).subscribe({
      next: (response: AlertSetting[]) => {
        if (response) {
          const autoSendAfterApproval: AlertSetting[] = response.filter(
            (x) =>
              x.notificationCategory &&
              x.notificationCategory.toLowerCase() ===
                'Payments'.toLowerCase() &&
              x.condition &&
              x.condition.toLowerCase() == 'After Payment Made'.toLowerCase() &&
              x.isEnableAutoSend == true
          )
          if (autoSendAfterApproval) {
            this.reset()
            this.notificationMessage(
              'Bill payment saved successfully',
              'green-snackbar'
            )
            autoSendAfterApproval.forEach((x) => {
              this.onSendReceipt(x.notificationType)
            })
          }
        } else {
          this.reset()
          this.notificationMessage(
            'Bill payment saved successfully',
            'green-snackbar'
          )
          this.notificationMessage(
            'No notification found to send.',
            'red-snackbar'
          )
        }
      },
      error: (err) => {
        this.notificationMessage('Notifications send failed', 'red-snackbar')
      },
    })
  }

  onSendReceipt(type: string) {
    if (this.billPayment) {
      let templateContent: TemplateContent = {
        clientId: this.clientId,
        templateName: type,
        notificationType: type,
        payments: this.payments,
      }
      this.templateService.emailCustomTemplate(templateContent).subscribe({
        next: (response: ResponseDetails) => {
          if (response && response.status) {
            const message: string = `Notifications send failed.${response.status}`
            this.notificationMessage(message, 'red-snackbar')
          } else if (response && response.isSuccess) {
            const message: string =
              'Notifications send successfully.' +
              '\n' +
              'Total Requests : ' +
              response?.totalRequests +
              '\n' +
              'Successfull Requests : ' +
              response?.successFullRequests +
              '\n' +
              'Failed Requests : ' +
              response?.failedRequests
            this.notificationMessage(message, 'green-snackbar')
          } else {
            const message: string =
              'Notifications send failed.' +
              '\n' +
              'Total Requests : ' +
              (response ? response.totalRequests : '0') +
              '\n' +
              'Successfull Requests : ' +
              (response ? response.successFullRequests : '0') +
              '\n' +
              'Failed Requests : ' +
              (response ? response.failedRequests : '0')
            this.notificationMessage(message, 'red-snackbar')
          }
        },
        error: (err) => {
          this.notificationMessage('Notifications send failed.', 'red-snackbar')
        },
      })
    } else {
      this.notificationMessage('Notifications send failed.', 'red-snackbar')
    }
  }

  updatePaymentTransactions() {
    let billMasterDetails: BillMaster[] = []
    let paymentTransactions: PaymentTransaction[] = []

    billMasterDetails = this.billSettlement.outstandingBills
    let transactionAmount: number = 0
    let advanceTransactionAmount: number = 0
    if (this.openingBalanceAmount > 0) {
      if (this.isAdjustWithAdvance && this.advanceAmount) {
        const balanceAmount =
          Number(this.advanceAmount) - Number(this.openingBalanceAmount)
        if (balanceAmount >= 0) {
          advanceTransactionAmount = this.openingBalanceAmount
          transactionAmount = 0
          this.advanceAmount = balanceAmount
        } else {
          advanceTransactionAmount = this.advanceAmount
          transactionAmount = this.openingBalanceAmount - this.advanceAmount
          this.advanceAmount = 0
        }
      } else {
        const balanceAmount =
          Number(this.paymentAmount) - Number(this.openingBalanceAmount)
        if (balanceAmount >= 0) {
          transactionAmount = this.openingBalanceAmount
          advanceTransactionAmount = 0
          this.paymentAmount = balanceAmount
        } else {
          transactionAmount = this.paymentAmount
          advanceTransactionAmount = 0
          this.paymentAmount = 0
        }
      }
      const paymentTransaction: PaymentTransaction = {
        billId: 0,
        paidAmount: Number(transactionAmount),
        advanceAmount: Number(advanceTransactionAmount),
      }
      paymentTransactions.push(paymentTransaction)
    }
    if (billMasterDetails && billMasterDetails.length) {
      billMasterDetails.forEach((billMaster) => {
        if (this.isAdjustWithAdvance && this.advanceAmount) {
          const balanceAmount =
            Number(this.advanceAmount) - Number(billMaster.toPay)
          if (balanceAmount >= 0) {
            advanceTransactionAmount = billMaster.toPay
            transactionAmount = 0
            this.advanceAmount = balanceAmount
          } else {
            advanceTransactionAmount = this.advanceAmount
            transactionAmount =
              Number(billMaster.toPay) - Number(this.advanceAmount)
            this.advanceAmount = 0
          }
        } else {
          const balanceAmount =
            Number(this.paymentAmount) - Number(billMaster.toPay)
          if (balanceAmount >= 0) {
            transactionAmount = billMaster.toPay
            advanceTransactionAmount = 0
            this.paymentAmount = balanceAmount
          } else {
            transactionAmount = this.paymentAmount
            advanceTransactionAmount = 0
            this.paymentAmount = 0
          }
        }
        const paymentTransaction: PaymentTransaction = {
          billId: billMaster.id,
          paidAmount: Number(transactionAmount),
          advanceAmount: Number(advanceTransactionAmount),
        }
        paymentTransactions.push(paymentTransaction)
      })
    }
    this.billPayment.paymentTransactions = paymentTransactions
  }

  onGetValues() {
    this.bankId = this.paymentDetailsComponent.bankId
    this.remarks = this.paymentDetailsComponent.remarks
    this.paymentModeId = this.paymentDetailsComponent.paymentModeId
    this.paymentDate = new Date(this.paymentDetailsComponent.paymentDate)
    this.refNumber = this.paymentDetailsComponent.refNumber
    this.paymentAmount = Number(this.billAmountDetailsComponent.toPay)
    //this.excessAmount = Number(this.billAmountDetailsComponent.excessAmount == 0 ? 0 : this.billAmountDetailsComponent.excessAmount);
    //this.labelName = this.billAmountDetailsComponent.labelName;
    this.isAdjustWithAdvance =
      this.billAmountDetailsComponent.isAdjustWithAdvance
    this.advanceAmount = this.billAmountDetailsComponent.previousAdvanceAmount
    this.openingBalanceAmount = this.billAmountDetailsComponent.billAmount
    this.outStandingAmount = this.billAmountDetailsComponent.total
    this.advanceAdjusted = this.billAmountDetailsComponent.advanceAdjusted
  }

  updateBillPayments() {
    this.billPayment = {
      paymentDate: this.date.transform(this.paymentDate, 'yyyy-MM-dd'),
      paymentAmount: Number(this.paymentAmount),
      billType: 2,
      modeofPayment: this.paymentModeId,
      paymentReference: this.refNumber,
      bankId: this.bankId,
      remarks: this.remarks,
      outStandingAmount:
        Number(this.outStandingAmount) - Number(this.advanceAdjusted),
      clientId: Number(this.cookieService.get('globalClientId')),
      ownerId: this.outstandingBillsComponent.outStandingBills[0]?.ownerId,
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    })
  }

  // updateBillPayments() {
  //   if (this.billSettlement.outstandingBills) {
  //     this.billPayment = {
  //       paymentNumber: '1',
  //       paymentDate: this.paymentDate,
  //       paymentAmount: this.paymentAmount,
  //       billType: 2,
  //       modeofPayment: this.paymentModeId,
  //       paymentReference: this.refNumber,
  //       remarks: this.remarks
  //     };
  //   }
  // }

  reset() {
    this.bankId = this.paymentDetailsComponent.bankId = 0
    this.remarks = this.paymentDetailsComponent.remarks = ''
    this.paymentModeId = this.paymentDetailsComponent.paymentModeId = 0
    this.paymentDate = new Date(Date.now.toString())
    this.refNumber = this.paymentDetailsComponent.refNumber = ''
    this.billAmountDetailsComponent.billAmount = 0
    this.billAmountDetailsComponent.total = 0
    this.paymentAmount = 0
    this.billAmountDetailsComponent.toPay = '0'
    this.billSettlement = { unbBilledConsumptions: [], outstandingBills: [] }
    this.isData = false
  }

  updateOutstandingBills() {
    if (this.billSettlement.outstandingBills) {
      this.finalBill = {
        ownerId: this.billSettlement.outstandingBills[0].ownerId,
        unitId: this.billSettlement.outstandingBills[0].unitId,
        bankId: this.bankId,
        billDate: new Date(),
        paymentDate: this.paymentDate,
        paymentAmount: this.paymentAmount,
        remarks: this.remarks,
        modeofPayment: this.paymentModeId,
        paymentReference: this.refNumber,
        finalBillTransactions: [],
      }
    }

    if (this.billAmountDetailsComponent.accountHeads) {
      this.billAmountDetailsComponent.accountHeads.forEach((x) => {
        this.finalBill.finalBillTransactions.push({
          billHeadId: x.id,
          headDisplay: x.accountHeadName,
          headAmount: x.fixedAmount,
        })
      })
    }
  }

  onSelectedRows(selectedRows: Bill[]) {
    this.selectedRows = []
    this.selectedRows = selectedRows
  }

  downloadReport(payment: Payment) {
    let firstTableRows: any[] = []
    let secondTableRows: ListData[] = []
    let thirdTableRows: any[] = []
    let fourthTableRows: ListData[] = []
    let fifthTableRows: any[] = []
    let sixthTableRows: ListData[] = []
    let firstTableCol = []
    let thirdTableCol = []

    const title = 'Receipt'
    let invoiceNumber = ''
    let unitNumber = ''

    const uniqueBillNumbers = Array.from(
      new Set(payment.billMasters.map((x) => x.billNumber))
    )
    const uniqueUnitNumbers = Array.from(
      new Set(payment.billMasters.map((x) => x.unitNumber))
    )

    if (uniqueBillNumbers && uniqueBillNumbers.length) {
      uniqueBillNumbers.forEach((x) => {
        invoiceNumber += x + ','
      })
    }

    if (uniqueUnitNumbers && uniqueUnitNumbers.length) {
      uniqueUnitNumbers.forEach((x) => {
        unitNumber += x + ','
      })
    }

    fifthTableRows.push(
      {
        label: 'Receipt Number:',
        value: payment.paymentNumber,
      },
      {
        label: 'Receipt Date:',
        value: payment.paymentDateLocal,
      },
      {
        label: 'Account Number:',
        value: payment.accountNumber,
      },
      {
        label: 'Invoice Number:',
        value:
          invoiceNumber.trim().indexOf(',') === 0
            ? invoiceNumber.trim().slice(1).slice(0, -1)
            : invoiceNumber.trim().slice(0, -1),
      },
      {
        label: 'Unit Number:',
        value:
          unitNumber.trim().indexOf(',') === 0
            ? unitNumber.trim().slice(1).slice(0, -1)
            : unitNumber.trim().slice(0, -1),
      },
      {
        label: 'Mode of payment:',
        value: payment.paymentMode,
      }
    )

    let paidAmount = 0
    payment.billMasters.forEach((x) => {
      paidAmount += x.paid
    })

    const balanceAmount =
      paidAmount > payment.outStandingAmount
        ? 0
        : payment.outStandingAmount - paidAmount

    secondTableRows.push(
      {
        label: 'Total Outstanding Amount :',
        value: this.currency.transform(
          payment.outStandingAmount,
          this.currencyFormat.toString(),
          true,
          this.roundOffFormat
        ),
      },
      {
        label: 'Received Payments :',
        value: payment.paymentAmountLocal,
      },
      {
        label: '',
        value: '',
      },
      {
        label: 'Balance Outstanding :',
        value: this.currency.transform(
          balanceAmount,
          this.currencyFormat.toString(),
          true,
          this.roundOffFormat
        ),
      }
    )

    this.getReport(payment, secondTableRows, fifthTableRows)
  }

  addImage(pdf: jsPDF, data: Payment) {
    try {
      if (
        data &&
        data.billMasters &&
        data.billMasters.length &&
        data.billMasters[0] &&
        data.billMasters[0].client &&
        data.billMasters[0].client.imageProperties &&
        data.billMasters[0].client.imageProperties.length
      ) {
        const imageProperty: ImageProperty =
          data.billMasters[0].client.imageProperties.find(
            (x) => x.imageType.trim().toLowerCase() === 'receipt'
          )
        if (imageProperty) {
          var img = new Image()
          img.src =
            this.filePath + '/uploads/' + data?.billMasters[0].client?.photo //'assets/img/' + data.client.photo
          img.onload = function () {
            pdf.addImage(
              img,
              imageProperty.imgX,
              imageProperty.imgY,
              imageProperty.imgW,
              imageProperty.imgH
            )
          }
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        } else {
          this.notificationMessage(
            'Image properties not found. To see image on print, please configure image properties ',
            'red-snackbar'
          )
        }
      } else {
        this.notificationMessage(
          'Image properties not found. To see image on print, please configure image properties ',
          'red-snackbar'
        )
      }
    } catch (err) {
      this.notificationMessage('Image not found.', 'red-snackbar')
    }
    return pdf
  }

  onPrintBillPayment(value: any) {
    if (this.payments && this.payments.length) {
      //this.downloadReport(this.payments[0]);
      this.receiptView(this.payments)
    } else {
      this.notificationMessage('No data to print.', 'yellow-snackbar')
    }
  }

  receiptView(payments: Payment[]) {
    this.billService.receiptView(payments).subscribe({
      next: (data) => {
        if (data) {
          this.downloadFile(data)
        } else {
          this.notificationMessage('No data to print', 'red-snackbar')
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar')
      },
    })
  }

  async downloadFile(data: any[]) {
    const mergedPdf = await PDFDocument.create()
    for (const pdfCopyDoc of data) {
      const pdf = await PDFDocument.load(pdfCopyDoc)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }
    const mergedPdfFile = await mergedPdf.save()
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  }

  getReport(data: Payment, secondTableRows: any[], fifthTableRows: any[]) {
    const totalPagesExp = '1'
    let pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    })
    let companyName = stringIsNullOrEmpty(
      data?.billMasters[0]?.client?.website
    ).split('.')[1]
    pdf.rect(
      5,
      5,
      pdf.internal.pageSize.width - 10,
      pdf.internal.pageSize.height - 10,
      'S'
    )
    let startX = 10
    let startY = 30
    pdf.setFontSize(30)
    this.addImage(pdf, data)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont('Cambria', 'bold')
    pdf.text('PAYMENT RECEIPT', startX + 250, startY)
    pdf.setFont('Cambria', 'normal')
    pdf.setFontSize(14)
    pdf.text(
      stringIsNullOrEmpty(
        data?.billMasters[0]?.client?.clientName
      ).toUpperCase(),
      startX,
      startY + 20
    )
    pdf.setFontSize(10)
    pdf.text(
      'TRN: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.trnNo),
      startX,
      startY + 30
    )
    pdf.text(
      'PO Box ' +
        stringIsNullOrEmpty(
          data?.billMasters[0]?.client?.addresses[0]?.zipPostalCode
        ),
      startX,
      startY + 40
    )
    pdf.text(
      stringIsNullOrEmpty(
        data?.billMasters[0]?.client?.addresses[0]?.location,
        ','
      ) +
        stringIsNullOrEmpty(
          data?.billMasters[0]?.client?.addresses[0]?.city,
          ','
        ) +
        stringIsNullOrEmpty(
          data?.billMasters[0]?.client?.addresses[0]?.country,
          ','
        ),
      startX,
      startY + 50
    )
    pdf.text(
      'Phone: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo),
      startX,
      startY + 60
    )
    pdf.text(
      'Email: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.email),
      startX,
      startY + 70
    )
    pdf.text(
      'Web: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.website),
      startX,
      startY + 80
    )
    pdf.setFillColor(241, 241, 244)
    pdf.setDrawColor(206, 203, 203)
    pdf.rect(10, startY + 90, 250, 90, 'FD')
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.text(
      stringIsNullOrEmpty(data?.tenantName).toUpperCase(),
      startX + 10,
      startY + 105
    )
    pdf.text(
      'CUSTOMER TRN: ' + stringIsNullOrEmpty(data?.trn),
      startX + 10,
      startY + 125
    )
    pdf.text(
      'unit #' + stringIsNullOrEmpty(data?.billMasters[0]?.unitNumber),
      startX + 10,
      startY + 140
    )
    pdf.setFontSize(10)
    pdf.text(
      stringIsNullOrEmpty(data?.billMasters[0]?.clientName),
      startX + 10,
      startY + 155
    )
    pdf.text(
      stringIsNullOrEmpty(
        data?.billMasters[0].client?.addresses[0]?.city,
        ','
      ) +
        stringIsNullOrEmpty(
          data?.billMasters[0]?.client?.addresses[0]?.country,
          ','
        ),
      startX + 10,
      startY + 170
    )
    pdf.setFontSize(9)

    const autoTable = 'autoTable'
    pdf[autoTable]('', fifthTableRows, {
      startX: startX + 200,
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0],
      },
      margin: { left: startX + 390 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left',
        },
        1: {
          cellWidth: 100,
          halign: 'right',
        },
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
    })

    const firstTableEndY = Number(
      this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0')
    )

    pdf.setLineWidth(0.1)
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.text(
      'Thank you for using ' + companyName + ' payment services.',
      startX + 10,
      firstTableEndY + 30
    )
    pdf.text(
      'We confirm receipt of your payment.',
      startX + 10,
      firstTableEndY + 40
    )
    pdf.text(
      'Please see the below details for your reference.',
      startX + 10,
      firstTableEndY + 50
    )
    pdf.setTextColor(0, 0, 0)

    pdf[autoTable]('', secondTableRows, {
      startX: 300,
      startY: firstTableEndY + 60,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0],
      },
      margin: { left: startX + 100 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left',
        },
        1: {
          cellWidth: 100,
          halign: 'right',
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
      },
    })

    pdf.setTextColor(0, 0, 0)

    const thirdTableEndY = Number(
      this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0')
    )

    pdf.setTextColor(255, 0, 0)
    pdf.setFontSize(9)
    pdf.text(
      `Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${data?.billMasters[0]?.penaltyAfter} days or more in arrears.`,
      startX + 310,
      thirdTableEndY + 20
    )
    pdf.setTextColor(25, 118, 210)
    pdf.setFontSize(12)
    pdf.text('USAGE TIPS to reduce consumption:', startX, thirdTableEndY + 80)
    pdf.text('Please Try to:', startX, thirdTableEndY + 100)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(9)
    pdf.text('- Keep filters clean', startX + 20, thirdTableEndY + 110)
    pdf.text(
      '- Set thermostats between 23C and 25C',
      startX + 20,
      thirdTableEndY + 120
    )
    pdf.text('- Keep vents unblocked', startX + 20, thirdTableEndY + 130)
    pdf.text(
      '- Keep doors and windows closed',
      startX + 20,
      thirdTableEndY + 140
    )
    pdf.text(
      '- Undertake regular maintenance of the system',
      startX + 20,
      thirdTableEndY + 150
    )
    pdf.setTextColor(25, 118, 210)
    pdf.setFontSize(12)
    pdf.text('Please Do Not:', startX, thirdTableEndY + 170)
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(9)
    pdf.text(
      '- Set thermostats to 20C or lower',
      startX + 20,
      thirdTableEndY + 180
    )
    pdf.text('- Block vents', startX + 20, thirdTableEndY + 190)
    pdf.text(
      '- Leave doors and windows open',
      startX + 20,
      thirdTableEndY + 200
    )
    pdf.text(
      '- Leave heat producing appliances near thermostats',
      startX + 20,
      thirdTableEndY + 210
    )

    pdf.setFillColor(119, 183, 11)
    var pageHeight =
      pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight()
    pdf.rect(
      startX + 310,
      thirdTableEndY + 60,
      280,
      pageHeight - 80 - (thirdTableEndY + 60),
      'FD'
    )
    pdf.setFont('Comic Sans')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    const boldText = 'ADVERTISE WITH US'
    pdf.text(boldText, startX + 350, thirdTableEndY + 80)
    const boldTextWidth = pdf.getTextWidth(boldText)
    pdf.setLineWidth(0.1)
    pdf.line(
      startX + 350,
      thirdTableEndY + 85,
      startX + 350 + boldTextWidth,
      thirdTableEndY + 85
    )
    pdf.setFontSize(9)
    pdf.text('For advertisement, contact at', startX + 380, thirdTableEndY + 95)
    pdf.text(
      stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo),
      startX + 380,
      thirdTableEndY + 105
    )
    pdf.text(
      stringIsNullOrEmpty(data?.billMasters[0]?.client?.email),
      startX + 380,
      thirdTableEndY + 115
    )
    pdf.text(
      stringIsNullOrEmpty(data?.billMasters[0]?.client?.website),
      startX + 380,
      thirdTableEndY + 125
    )

    pdf.setTextColor(0, 0, 0)
    pdf.setLineWidth(0.1)
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70)
    pdf.text(
      'For any enquiries, write to us ' + data?.billMasters[0]?.client?.email ??
        '' + '\n or Logon to ' + data.billMasters[0]?.client?.website ??
        '',
      startX,
      pageHeight - 60
    )
    pdf.setTextColor(255, 0, 0)
    pdf.setFont('bold')
    const footerText = 'Notice:'
    const footerTextWidth = pdf.getTextWidth(footerText)
    pdf.text(footerText, startX + 330, pageHeight - 60)
    pdf.setFont('none')
    pdf.setTextColor(0, 0, 0)
    pdf.text(
      'Pay your bills before due date to avoid late payment surcharge',
      startX + 330 + footerTextWidth,
      pageHeight - 60
    )
    pdf.text('and disconnection.', startX + 330, pageHeight - 50)
    pdf.text(
      'You can log onto ' +
        data?.billMasters[0]?.client?.website +
        ' to pay your invoices \nTerms & Conditions for Supply of Utility Services',
      startX + 330,
      pageHeight - 40
    )

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp)
    }
    var blob = pdf.output('blob')
    window.open(URL.createObjectURL(blob))
  }

  invoiceView(billMaster: BillMaster) {
    this.billService.invoicePreview(billMaster).subscribe({
      next: (data) => {
        if (data) {
          this.downloadFile(data)
        } else {
          this.notificationMessage('No data to print', 'red-snackbar')
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar')
      },
    })
  }
}
