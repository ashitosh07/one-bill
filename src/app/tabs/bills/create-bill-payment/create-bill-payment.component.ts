import { Component, OnInit, ViewChild } from '@angular/core';
import { BillSettlement } from '../../shared/models/bill-Settlement.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ManageParams } from '../../shared/models/manage-params.model';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tenant } from '../../shared/models/tenant.model';
import { Payment } from '../../shared/models/payment.model';
import { PaymentDetailsComponent } from '../final-bill-settlement/payment-details/payment-details.component';
import { OutstandingBillsComponent } from '../final-bill-settlement/outstanding-bills/outstanding-bills.component';
import { Bill } from '../../shared/models/bill.model';
import { PaymentTransaction } from '../../shared/models/payment-transaction.model';
import { BillAmountDetailsComponent } from '../final-bill-settlement/bill-amount-details/bill-amount-details.component';
import { AdvancePayment } from '../../shared/models/advance-payment.model';
import { BillService } from '../../shared/services/bill.service';
import { BillMaster } from '../../shared/models/bill-master.model';
import { MatTableDataSource } from '@angular/material/table';
import { DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ListData } from '../../shared/models/list-data.model';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CookieService } from 'ngx-cookie-service';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { convertToNumber, getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { TemplateContent } from '../../shared/models/template-content.model';
import { TemplatesService } from 'src/app/pages/templates/templates.service';
import { ResponseDetails } from '../../shared/models/response-details.model';
import { TemplateService } from '../../shared/services/template.service';
import { AlertSetting } from '../../shared/models/alert-setting.model';
import { ListItem } from '../../shared/models/list-item.model';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'app-create-bill-payment',
  templateUrl: './create-bill-payment.component.html',
  styleUrls: ['./create-bill-payment.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateBillPaymentComponent implements OnInit {

  private _gap = 12;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(76% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(24% - ${this._gap / 1}px)`;

  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  billSettlement: BillSettlement = { outstandingBills: [] };
  paymentModes: any[] = [{ label: 'Select', value: 0 }];
  banks: any[] = [{ label: 'Select', value: 0 }];
  tenants: Tenant[] = [];
  manageParams: ManageParams = {};
  billPayment: Payment = {};
  selectedRows: Bill[] = [];
  clientId: number;
  paymentId: number = 0;
  bankId: number = 0;
  remarks: string = '';
  paymentModeId: number = 0;
  paymentDate: Date = new Date();
  refNumber: string = '';
  paymentAmount: number = 0;
  excessAmount: number = 0;
  advanceAmount: number = 0;
  openingBalanceAmount: number = 0;
  outStandingAmount: number = 0;
  advanceAdjusted: number = 0;
  isAdjustWithAdvance: boolean = false;
  payments: Payment[] = [];
  dateFormat = getClientDataFormat('DateFormat'); //?? environment.dateFormat;;
  currencyFormat = getClientDataFormat('Currency'); //?? environment.currencyFormat;
  roundOffFormat = getClientDataFormat('RoundOff'); //??  environment.roundOffFormat;
  filePath = '';
  labelName: string = '';
  isData: boolean = false;
  isValid: boolean = false;
  isValidPayment: boolean = false;
  isPrintDisable: boolean = true;
  isAutoSelect: boolean = false;
  disableCheckBox: boolean = true;
  searchByTenant: ListItem = { label: 'Search By Tenant', value: 1 };
  searchByUnit: ListItem = { label: 'Search By Unit', value: 2 };
  searchByAccountNumber: ListItem = { label: 'Search By Account Number', value: 3 };
  options: ListItem[] = [this.searchByTenant, this.searchByUnit, this.searchByAccountNumber];


  @ViewChild(PaymentDetailsComponent, { static: true }) paymentDetailsComponent: PaymentDetailsComponent;
  @ViewChild(OutstandingBillsComponent, { static: true }) outstandingBillsComponent: OutstandingBillsComponent;
  @ViewChild(BillAmountDetailsComponent, { static: true }) billAmountDetailsComponent: BillAmountDetailsComponent;


  constructor(
    private billSettlementService: BillSettlementService,
    private billService: BillService,
    private snackbar: MatSnackBar,
    private decimalPipe: DecimalPipe,
    private date: DatePipe,
    private currency: CurrencyPipe,
    private cookieService: CookieService,
    private templateService: TemplateService,
    private clientSelectionService: ClientSelectionService,
    private templatesService: TemplatesService,
    private envService: EnvService
  ) {
    this.filePath = envService.backendForFiles;
   }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.onGetTenants();
    //this.getBillPeriods();
  }

  onGetTenants() {
    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
    });
  }

  onGetPaymentModes() {
    this.paymentModes = [{ label: 'Select', value: 0 }];
    this.billSettlementService.getPaymentModes().subscribe(paymentModes => {
      paymentModes.forEach(x => {
        this.paymentModes.push({ label: x.description, value: x.id });
      });
    });
  }

  getBillPeriods() {
    this.billPeriods = [{ label: 'Select', value: 0, fromDate: Date.now.toString(), ToDate: Date.now.toString() }];
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id, fromDate: x.periodStart, toDate: x.periodEnd });
      });
    });
  }

  onGetBanks(manageParams: ManageParams) {
    this.banks = [{ label: 'Select', value: 0 }];
    this.billSettlementService.getBanks(manageParams).subscribe(data => {
      data.forEach(x => {
        this.banks.push({ label: x.description, value: x.id });
      });
    });
  }

  onGetBillDetails(manageParams: ManageParams) {
    this.isAutoSelect = false;
    this.disableCheckBox = false;
    this.manageParams = manageParams;
    this.manageParams.billType = 1;
    this.onGetPaymentModes();
    this.onGetBanks(manageParams);
    this.billSettlement = {};
    this.isPrintDisable = true;
    manageParams.clientId = this.clientId;
    this.billSettlementService.getOutStandingBillDetails(manageParams).subscribe((billSettlement) => {
      this.billSettlement = billSettlement;
      // if (this.billSettlement && this.billSettlement.outstandingBills.length > 0)
      this.isAutoSelect = true;
      this.disableCheckBox = true;
    }
      // ,error: (err) => {
      //   this.isAutoSelect = false;
      //   this.notificationMessage('Outstanding Bills Not Found.', 'yellow-snackbar');
      // }
    );
  }

  onSaveBillPayment(event: boolean) {
    this.onGetValues();
    this.updateBillPayments();
    this.updatePaymentTransactions();
    this.billSettlementService.saveBillPayments(this.billPayment).subscribe({
      next: response => {
        if (response) {
          if (this.labelName === 'Excess Amount' && this.excessAmount > 0 && response !== 0) {
            this.saveAdvancePaymentDetails(response);
          } else {
            this.onGetPaymentDetail(response);
          }
        } else {
          this.notificationMessage('Bill payment save failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Bill payment save failed', 'red-snackbar');
      }
    });
  }

  getClientAlertSettings(paymnetId: number) {
    this.templatesService.getClientAlertSettings(this.clientId).subscribe(
      {
        next: (response: AlertSetting[]) => {
          if (response) {
            const autoSendAfterApproval: AlertSetting[] = response.filter(x => x.notificationCategory && x.notificationCategory.toLowerCase() === 'Payments'.toLowerCase() && x.condition && x.condition.toLowerCase() == 'After Payment Made'.toLowerCase() && x.isEnableAutoSend == true);
            if (autoSendAfterApproval) {
              this.reset();
              this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
              autoSendAfterApproval.forEach(x => {
                this.onSendReceipt(x.notificationType);
              });
            }
          } else {
            this.reset();
            this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
            this.notificationMessage('No notification found to send.', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Notifications send failed', 'red-snackbar');
        }
      });
  }

  onSendReceipt(type: string) {
    if (this.billPayment) {
      let templateContent: TemplateContent = {
        clientId: this.clientId,
        templateName: type,
        notificationType: type,
        payments: this.payments
      };
      this.templateService.emailCustomTemplate(templateContent).subscribe(
        {
          next: (response: ResponseDetails) => {
            if (response && response.status) {
              const message: string = `Notifications send failed.${response.status}`;
              this.notificationMessage(message, 'red-snackbar');
            } else if (response && response.isSuccess) {
              const message: string = 'Notifications send successfully.'
                + '\n'
                + 'Total Requests : ' + response?.totalRequests
                + '\n'
                + 'Successfull Requests : ' + response?.successFullRequests
                + '\n'
                + 'Failed Requests : ' + response?.failedRequests;
              this.notificationMessage(message, 'green-snackbar');
            } else {
              const message: string = 'Notifications send failed.'
                + '\n'
                + 'Total Requests : ' + (response ? response.totalRequests : '0')
                + '\n'
                + 'Successfull Requests : ' + (response ? response.successFullRequests : '0')
                + '\n'
                + 'Failed Requests : ' + (response ? response.failedRequests : '0');
              this.notificationMessage(message, 'red-snackbar');
            }
          },
          error: (err) => {
            this.notificationMessage('Notifications send failed.', 'red-snackbar');
          }
        });
    } else {
      this.notificationMessage('Notifications send failed.', 'red-snackbar');
    }
  }


  updatePaymentTransactions() {
    let billMasterDetails: BillMaster[] = [];
    let paymentTransactions: PaymentTransaction[] = [];
    billMasterDetails = this.outstandingBillsComponent.selectedRows;
    if (this.openingBalanceAmount > 0) {
      let paymentTransactionAmount: number = 0;
      let advanceTransactionAmount: number = 0;
      if (this.advanceAdjusted > 0 && this.paymentAmount == 0) {
        const balanceAmount = Number(this.advanceAdjusted) - Number(this.openingBalanceAmount);
        if (balanceAmount >= 0) {
          advanceTransactionAmount = this.openingBalanceAmount;
          paymentTransactionAmount = 0;
          this.advanceAdjusted = balanceAmount;
        } else {
          advanceTransactionAmount = this.advanceAdjusted;
          paymentTransactionAmount = 0;
          this.advanceAmount = 0;
        }
      } else if (this.advanceAdjusted > 0 && this.paymentAmount > 0) {
        const balanceAmount = Number(this.advanceAdjusted) - Number(this.openingBalanceAmount);
        if (balanceAmount >= 0) {
          advanceTransactionAmount = this.openingBalanceAmount;
          paymentTransactionAmount = 0;
          this.advanceAdjusted = balanceAmount;
        } else {
          const balanceAmount = Number(this.advanceAdjusted) + Number(this.paymentAmount) - Number(this.openingBalanceAmount);
          if (balanceAmount >= 0) {
            advanceTransactionAmount = this.advanceAdjusted;
            paymentTransactionAmount = Number(this.openingBalanceAmount) - Number(this.advanceAdjusted);
            this.advanceAdjusted = 0;
            this.paymentAmount = Number(this.paymentAmount) - Number(paymentTransactionAmount);
          }
          else {
            advanceTransactionAmount = this.advanceAdjusted;
            paymentTransactionAmount = this.paymentAmount;
            this.advanceAmount = 0;
            this.paymentAmount = 0;
          }
        }
      } else if (this.advanceAdjusted == 0 && this.paymentAmount > 0) {
        const balanceAmount = Number(this.paymentAmount) - Number(this.openingBalanceAmount);
        if (balanceAmount >= 0) {
          paymentTransactionAmount = this.openingBalanceAmount;
          advanceTransactionAmount = 0;
          this.paymentAmount = balanceAmount;
        } else {
          paymentTransactionAmount = this.paymentAmount;
          advanceTransactionAmount = 0;
          this.paymentAmount = 0;
        }
      }
      if (paymentTransactionAmount > 0 || advanceTransactionAmount > 0) {
        const paymentTransaction: PaymentTransaction = {
          billId: 0,
          paidAmount: Number(paymentTransactionAmount),
          advanceAmount: Number(advanceTransactionAmount)
        };
        paymentTransactions.push(paymentTransaction);
        paymentTransactionAmount = 0;
        advanceTransactionAmount = 0;
      }
    }

    if (billMasterDetails && billMasterDetails.length > 0) {
      let paymentTransactionAmount: number = 0;
      let advanceTransactionAmount: number = 0;
      billMasterDetails.forEach(billMaster => {
        if (this.advanceAdjusted > 0 && this.paymentAmount == 0) {
          const balanceAmount = Number(this.advanceAdjusted) - Number(billMaster.toPay);
          if (balanceAmount >= 0) {
            advanceTransactionAmount = billMaster.toPay;
            paymentTransactionAmount = 0;
            this.advanceAdjusted = balanceAmount;
          } else {
            advanceTransactionAmount = this.advanceAdjusted;
            paymentTransactionAmount = 0;
            this.advanceAmount = 0;
          }
        }
        else if (this.advanceAdjusted > 0 && this.paymentAmount > 0) {
          const balanceAmount = Number(this.advanceAdjusted) - Number(billMaster.toPay);
          if (balanceAmount >= 0) {
            advanceTransactionAmount = billMaster.toPay;
            paymentTransactionAmount = 0;
            this.advanceAdjusted = balanceAmount;
          } else {
            const balanceAmount = Number(this.advanceAdjusted) + Number(this.paymentAmount) - Number(billMaster.toPay);
            if (balanceAmount >= 0) {
              advanceTransactionAmount = this.advanceAdjusted;
              paymentTransactionAmount = Number(billMaster.toPay) - Number(this.advanceAdjusted);
              this.advanceAdjusted = 0;
              this.paymentAmount = Number(this.paymentAmount) - Number(paymentTransactionAmount);
            }
            else {
              advanceTransactionAmount = this.advanceAdjusted;
              paymentTransactionAmount = this.paymentAmount;
              this.advanceAmount = 0;
              this.paymentAmount = 0;
            }
          }
        }
        else if (this.advanceAdjusted == 0 && this.paymentAmount > 0) {
          const balanceAmount = Number(this.paymentAmount) - Number(billMaster.toPay);
          if (balanceAmount >= 0) {
            paymentTransactionAmount = billMaster.toPay;
            advanceTransactionAmount = 0;
            this.paymentAmount = balanceAmount;
          } else {
            paymentTransactionAmount = this.paymentAmount;
            advanceTransactionAmount = 0;
            this.paymentAmount = 0;
          }
        }
        if (paymentTransactionAmount > 0 || advanceTransactionAmount > 0) {
          const paymentTransaction: PaymentTransaction = {
            billId: billMaster.id,
            paidAmount: Number(paymentTransactionAmount),
            advanceAmount: Number(advanceTransactionAmount)
          };
          paymentTransactions.push(paymentTransaction);
          paymentTransactionAmount = 0;
          advanceTransactionAmount = 0;
        }
      });
    }

    if (this.labelName === 'Excess Amount' && this.excessAmount > 0) {
      const paymentTransaction: PaymentTransaction = {
        billId: 0,
        paidAmount: Number(this.excessAmount),
        advanceAmount: 0,
        isAdvanceAmount: true
      };
      paymentTransactions.push(paymentTransaction);
    }
    this.billPayment.paymentTransactions = paymentTransactions;
  }

  onGetValues() {
    this.bankId = this.paymentDetailsComponent.bankId;
    this.remarks = this.paymentDetailsComponent.remarks;
    this.paymentModeId = this.paymentDetailsComponent.paymentModeId;
    this.paymentDate = new Date(this.paymentDetailsComponent.paymentDate);
    this.refNumber = this.paymentDetailsComponent.refNumber;
    this.paymentAmount = Number(this.billAmountDetailsComponent.toPay);
    this.excessAmount = Number(this.billAmountDetailsComponent.excessAmount == 0 ? 0 : this.billAmountDetailsComponent.excessAmount);
    this.labelName = this.billAmountDetailsComponent.labelName;
    this.isAdjustWithAdvance = this.billAmountDetailsComponent.isAdjustWithAdvance;
    this.advanceAmount = this.billAmountDetailsComponent.previousAdvanceAmount;
    this.openingBalanceAmount = this.billAmountDetailsComponent.billAmount;
    this.outStandingAmount = this.billAmountDetailsComponent.total;
    this.advanceAdjusted = this.billAmountDetailsComponent.advanceAdjusted;
  }

  updateBillPayments() {
    let ownerId: number = 0;
    if (this.outstandingBillsComponent && this.outstandingBillsComponent.selectedRows && this.outstandingBillsComponent.selectedRows.length) {
      ownerId = this.outstandingBillsComponent.selectedRows[0].ownerId;
    } else {
      ownerId = Number(this.manageParams.tenantId);
    }
    this.billPayment = {
      paymentDate: this.date.transform(this.paymentDate, 'yyyy-MM-dd'),
      paymentAmount: Number(this.paymentAmount),
      clientId: Number(this.cookieService.get('globalClientId')),
      billType: 1,
      ownerId: ownerId,
      modeofPayment: this.paymentModeId,
      paymentReference: this.refNumber,
      bankId: this.bankId,
      remarks: this.remarks,
      outStandingAmount: Number(this.outStandingAmount) - Number(this.advanceAdjusted)
    };
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onSelectedRows(selectedRows: Bill[]) {
    this.isData = false;
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    if (this.selectedRows && this.selectedRows.length) {
      this.isData = true;
    }
  }

  // updateBillsPaymentId(paymentId: number) {
  //   this.paymentId = paymentId;
  //   let billMasterDetails: BillMaster[] = [];
  //   let paymentTransactions: PaymentTransaction[] = [];

  //   billMasterDetails = this.outstandingBillsComponent.selectedRows;
  //   let transactionAmount: number = 0;
  //   let advanceTransactionAmount: number = 0;
  //   if (this.openingBalanceAmount > 0) {
  //     if (this.isAdjustWithAdvance && this.advanceAmount) {
  //       const balanceAmount = Number(this.advanceAmount) - Number(this.openingBalanceAmount);
  //       if (balanceAmount >= 0) {
  //         advanceTransactionAmount = this.openingBalanceAmount;
  //         transactionAmount = 0;
  //         this.advanceAmount = balanceAmount;
  //       } else {
  //         advanceTransactionAmount = this.advanceAmount;
  //         transactionAmount = this.openingBalanceAmount - this.advanceAmount;
  //         this.advanceAmount = 0;
  //       }
  //     } else {
  //       const balanceAmount = Number(this.paymentAmount) - Number(this.openingBalanceAmount);
  //       if (balanceAmount >= 0) {
  //         transactionAmount = this.openingBalanceAmount;
  //         advanceTransactionAmount = 0;
  //         this.paymentAmount = balanceAmount;
  //       } else {
  //         transactionAmount = this.paymentAmount;
  //         advanceTransactionAmount = 0;
  //         this.paymentAmount = 0;
  //       }
  //     }
  //     const paymentTransaction: PaymentTransaction = {
  //       paymentId: paymentId,
  //       billId: 0,
  //       paidAmount: Number(transactionAmount),
  //       advanceAmount: Number(advanceTransactionAmount)
  //     };
  //     paymentTransactions.push(paymentTransaction);
  //   }
  //   if (billMasterDetails && billMasterDetails.length) {
  //     billMasterDetails.forEach(billMaster => {
  //       if (this.isAdjustWithAdvance && this.advanceAmount) {
  //         const balanceAmount = Number(this.advanceAmount) - Number(billMaster.toPay);
  //         if (balanceAmount >= 0) {
  //           advanceTransactionAmount = billMaster.toPay;
  //           transactionAmount = 0;
  //           this.advanceAmount = balanceAmount;
  //         } else {
  //           advanceTransactionAmount = this.advanceAmount;
  //           transactionAmount = Number(billMaster.toPay) - Number(this.advanceAmount);
  //           this.advanceAmount = 0;
  //         }
  //       } else {
  //         const balanceAmount = Number(this.paymentAmount) - Number(billMaster.toPay);
  //         if (balanceAmount >= 0) {
  //           transactionAmount = billMaster.toPay;
  //           advanceTransactionAmount = 0;
  //           this.paymentAmount = balanceAmount;
  //         } else {
  //           transactionAmount = this.paymentAmount;
  //           advanceTransactionAmount = 0;
  //           this.paymentAmount = 0;
  //         }
  //       }
  //       const paymentTransaction: PaymentTransaction = {
  //         paymentId: paymentId,
  //         billId: billMaster.id,
  //         paidAmount: Number(transactionAmount),
  //         advanceAmount: Number(advanceTransactionAmount)
  //       };
  //       paymentTransactions.push(paymentTransaction);
  //     });
  //   }
  //   this.billSettlementService.updatePaymentTransactions(paymentTransactions).subscribe({
  //     next: response => {
  //       if (response) {
  //         if (this.labelName === 'Excess Amount' && this.excessAmount > 0 && paymentId !== 0) {
  //           this.saveAdvancePaymentDetails(paymentId);
  //         } else {
  //           this.onGetPaymentDetail();
  //           this.reset();
  //           this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
  //         }
  //       } else {
  //         this.notificationMessage('Bill payment save failed', 'red-snackbar');
  //       }
  //     },
  //     error: (err) => {
  //       this.notificationMessage('Bill payment save failed', 'red-snackbar');
  //     }
  //   });
  // }

  saveAdvancePaymentDetails(paymentId: number) {
    let ownerId: number = 0;
    if (this.outstandingBillsComponent && this.outstandingBillsComponent.selectedRows && this.outstandingBillsComponent.selectedRows.length) {
      ownerId = this.outstandingBillsComponent.selectedRows[0].ownerId;
    } else {
      ownerId = Number(this.manageParams.tenantId);
    }
    const advancePayment: AdvancePayment = {
      advanceDate: this.paymentDate,
      paymentId: paymentId,
      ownerId: ownerId,
      advanceAmount: Number(this.excessAmount)
    };
    this.billService.saveAdvancePayment(advancePayment).subscribe({
      next: response => {
        if (response) {
          this.onGetPaymentDetail(paymentId);
        } else {
          this.notificationMessage('Bill payment save failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('Bill payment save failed', 'red-snackbar');
      }
    });
  }

  reset() {
    this.bankId = this.paymentDetailsComponent.bankId = 0;
    this.remarks = this.paymentDetailsComponent.remarks = '';
    this.paymentModeId = this.paymentDetailsComponent.paymentModeId = 0;
    this.paymentDate = new Date(Date.now.toString());
    this.refNumber = this.paymentDetailsComponent.refNumber = '';
    this.billAmountDetailsComponent.billAmount = 0;
    this.billAmountDetailsComponent.total = 0;
    this.paymentAmount = 0;
    this.billAmountDetailsComponent.toPay = '0';
    this.excessAmount = this.billAmountDetailsComponent.excessAmount = 0;
    this.advanceAdjusted = this.billAmountDetailsComponent.advanceAdjusted = 0;
    this.billSettlement = { outstandingBills: [] };
    this.outstandingBillsComponent.selectedRows = [];
    this.isData = false;
    this.isValid = false;
  }



  onPrintBillPayment(value: any) {
    if (this.payments && this.payments.length) {
      this.receiptView(this.payments);
    } else {
      this.notificationMessage('No data to print', 'yellow-snackbar');
    }
  }

  receiptView(payments: Payment[]) {
    this.billService.receiptView(payments).subscribe({
      next: data => {
        if (data) {
          this.downloadPdfFile(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  downloadPdfFile(data: any[]) {
    if (data) {
      data.forEach(x => {
        var byteArray = this.base64ToArrayBuffer(data);
        var blob = new Blob([byteArray], { type: 'application/pdf' });
        var url = window.URL.createObjectURL(blob);
        window.open(url);
      })
    }
  }

  base64ToArrayBuffer(base64: any): ArrayBuffer {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  onGetPaymentDetail(paymentId: number) {
    this.payments = [];
    this.isPrintDisable = true;
    const clientId = Number(this.cookieService.get('globalClientId'));
    this.billService.getPaymentDetail(paymentId, clientId).subscribe({
      next: payments => {
        payments.forEach(payment => {
          payment.paymentDateLocal = this.date.transform(payment.paymentDate.toString(), this.dateFormat.toString());
          payment.referenceDateLocal = this.date.transform(payment.referenceDate.toString(), this.dateFormat.toString());
          payment.paymentAmountLocal = this.currency.transform(payment.paymentAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
          payment.advanceAmountLocal = this.currency.transform(payment.advanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
          if (payment.billMasters && payment.billMasters.length) {
            payment.billMasters.forEach(billMaster => {
              billMaster.billDateLocal = this.date.transform(billMaster?.billDate?.toString(), this.dateFormat.toString());
              billMaster.billAmountLocal = this.currency.transform(billMaster?.billAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
              billMaster.fromDateLocal = this.date.transform(billMaster?.fromDate?.toString(), this.dateFormat.toString());
              billMaster.toDateLocal = this.date.transform(billMaster?.toDate?.toString(), this.dateFormat.toString());
              billMaster.dueDateLocal = this.date.transform(billMaster?.dueDate?.toString(), this.dateFormat.toString());
              billMaster.paidLocal = this.currency.transform(billMaster?.paid?.toString(), this.currencyFormat.toString(), true, this.roundOffFormat);
            });
          }
        });
        this.payments = payments;
        this.isPrintDisable = false;
        this.getClientAlertSettings(paymentId);
      },
      error: () => {
        this.isPrintDisable = true;
      }
    });
  }

  downloadReport(payment: Payment) {
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [];
    let thirdTableCol = [];

    const title = 'Receipt';
    let invoiceNumber = '';
    let unitNumber = '';

    const uniqueBillNumbers = Array.from(new Set(payment.billMasters.map(x => x.billNumber)));
    const uniqueUnitNumbers = Array.from(new Set(payment.billMasters.map(x => x.unitNumber)));

    if (uniqueBillNumbers && uniqueBillNumbers.length) {
      uniqueBillNumbers.forEach(x => {
        invoiceNumber += x + ',';
      });
    }

    if (uniqueUnitNumbers && uniqueUnitNumbers.length) {
      uniqueUnitNumbers.forEach(x => {
        unitNumber += x + ',';
      });
    }

    fifthTableRows.push(
      {
        label: 'Receipt Number:',
        value: payment.paymentNumber
      },
      {
        label: 'Receipt Date:',
        value: payment.paymentDateLocal
      },
      {
        label: 'Account Number:',
        value: payment.accountNumber
      },
      {
        label: 'Invoice Number:',
        value: invoiceNumber.trim().indexOf(',') === 0 ? invoiceNumber.trim().slice(1).slice(0, -1) : invoiceNumber.trim().slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: unitNumber.trim().indexOf(',') === 0 ? unitNumber.trim().slice(1).slice(0, -1) : unitNumber.trim().slice(0, -1)
      },
      {
        label: 'Mode of payment:',
        value: payment.paymentMode
      }
    );


    let paidAmount = 0;
    payment.billMasters.forEach(x => {
      paidAmount += x.paid;
    })

    const balanceAmount = payment.outStandingAmount - paidAmount;

    secondTableRows.push(
      {
        label: 'Total Outstanding Amount :',
        value: this.currency.transform(payment.outStandingAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
      },
      {
        label: 'Received Payments :',
        value: payment.paymentAmountLocal
      },
      {
        label: '',
        value: ''
      },
      {
        label: 'Balance Outstanding :',
        value: this.currency.transform(balanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
      }
    );

    this.getReport(payment, secondTableRows, fifthTableRows);
  }

  addImage(pdf: jsPDF, data: Payment) {
    try {
      if (data && data.billMasters && data.billMasters.length && data.billMasters[0] && data.billMasters[0].client && data.billMasters[0].client.imageProperties && data.billMasters[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = data.billMasters[0].client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'receipt');
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + data?.billMasters[0].client?.photo; //'assets/img/' + data.client.photo
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        } else {
          this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
        }
      } else {
        this.notificationMessage('Image properties not found. To see image on print, please configure image properties ', 'red-snackbar');
      }
    }
    catch (err) {
      this.notificationMessage('Image not found.', 'red-snackbar');
    }
    return pdf;
  }

  getReport(data: Payment, secondTableRows: any[], fifthTableRows: any[]) {
    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });
    let companyName = stringIsNullOrEmpty(data?.billMasters[0]?.client?.website).split('.')[1];
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    this.addImage(pdf, data);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria", 'bold');
    pdf.text("PAYMENT RECEIPT", startX + 250, startY);
    pdf.setFont('Cambria', 'normal');
    pdf.setFontSize(14);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.clientName).toUpperCase(), startX, startY + 20);
    pdf.setFontSize(10);
    pdf.text("TRN: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.trnNo), startX, startY + 30);
    pdf.text("PO Box " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.zipPostalCode), startX, startY + 40);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX, startY + 50);
    pdf.text("Phone: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX, startY + 60);
    pdf.text("Email: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX, startY + 70);
    pdf.text('Web: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 250, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(stringIsNullOrEmpty(data?.tenantName).toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + stringIsNullOrEmpty(data?.trn), startX + 10, startY + 125);
    pdf.text("unit #" + stringIsNullOrEmpty(data?.billMasters[0]?.unitNumber), startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.clientName), startX + 10, startY + 155);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0].client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX + 10, startY + 170);
    pdf.setFontSize(9);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startX: startX + 200,
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 390 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      didParseCell: function (fourthTableRows) {
        const col = fourthTableRows.column.index;
        if (col == 0 || col == 1) {
          fourthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));




    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Thank you for using " + companyName + " payment services.", startX + 10, firstTableEndY + 30);
    pdf.text("We confirm receipt of your payment.", startX + 10, firstTableEndY + 40);
    pdf.text("Please see the below details for your reference.", startX + 10, firstTableEndY + 50);
    pdf.setTextColor(0, 0, 0);

    pdf[autoTable]('', secondTableRows, {
      startX: 300,
      startY: firstTableEndY + 60,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 100 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 180,
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      }
    });

    pdf.setTextColor(0, 0, 0);

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setTextColor(255, 0, 0);
    pdf.setFontSize(9);
    pdf.text(`Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${data?.billMasters[0]?.penaltyAfter} days or more in arrears.`, startX + 310, thirdTableEndY + 20);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, thirdTableEndY + 80);
    pdf.text("Please Try to:", startX, thirdTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, thirdTableEndY + 110);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, thirdTableEndY + 120);
    pdf.text("- Keep vents unblocked", startX + 20, thirdTableEndY + 130);
    pdf.text("- Keep doors and windows closed", startX + 20, thirdTableEndY + 140);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, thirdTableEndY + 150);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, thirdTableEndY + 170);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, thirdTableEndY + 180);
    pdf.text("- Block vents", startX + 20, thirdTableEndY + 190);
    pdf.text("- Leave doors and windows open", startX + 20, thirdTableEndY + 200);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, thirdTableEndY + 210);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, thirdTableEndY + 60, 280, pageHeight - 80 - (thirdTableEndY + 60), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, thirdTableEndY + 80);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, thirdTableEndY + 85, startX + 350 + boldTextWidth, thirdTableEndY + 85);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, thirdTableEndY + 95);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX + 380, thirdTableEndY + 105);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX + 380, thirdTableEndY + 115);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX + 380, thirdTableEndY + 125);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text("For any enquiries, write to us " + data?.billMasters[0]?.client?.email ?? '' + "\n or Logon to " + data.billMasters[0]?.client?.website ?? '', startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 330, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 330, pageHeight - 50);
    pdf.text("You can log onto " + data?.billMasters[0]?.client?.website + " to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  onValidation(valid: boolean) {
    this.isValid = valid;
  }

  onValidatePayment(valid: boolean) {
    this.isValidPayment = valid;
  }
}
