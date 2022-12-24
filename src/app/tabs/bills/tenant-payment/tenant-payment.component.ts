import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvancePayment } from '../../shared/models/advance-payment.model';
import { BillMaster } from '../../shared/models/bill-master.model';
import { BillSettlement } from '../../shared/models/bill-Settlement.model';
import { Bill } from '../../shared/models/bill.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { PaymentTransaction } from '../../shared/models/payment-transaction.model';
import { Payment } from '../../shared/models/payment.model';
import { Tenant } from '../../shared/models/tenant.model';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { BillAmountDetailsComponent } from '../final-bill-settlement/bill-amount-details/bill-amount-details.component';
import { OutstandingBillsComponent } from '../final-bill-settlement/outstanding-bills/outstanding-bills.component';
import { PaymentDetailsComponent } from '../final-bill-settlement/payment-details/payment-details.component';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-tenant-payment',
  templateUrl: './tenant-payment.component.html',
  styleUrls: ['./tenant-payment.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class TenantPaymentComponent implements OnInit {

  totAmt: number = 0;
  tenantId: string = '0';

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  billSettlement: BillSettlement = { outstandingBills: [] };
  paymentModes: any[] = [{ label: 'Select', value: 0 }];
  banks: any[] = [{ label: 'Select', value: 0 }];
  tenants: Tenant[] = [];
  manageParams: ManageParams = {};
  billPayment: Payment = {};
  selectedRows: BillMaster[] = [];
  clientId: number;

  bankId: number = 0;
  remarks: string = '';
  paymentModeId: number = 0;
  paymentDate: Date = new Date();
  refNumber: string = '';
  paymentAmount: number = 0;
  excessAmount: number = 0;
  labelName: string = '';

  roundFormat = '';

  @ViewChild(PaymentDetailsComponent, { static: true }) paymentDetailsComponent: PaymentDetailsComponent;
  @ViewChild(OutstandingBillsComponent, { static: true }) outstandingBillsComponent: OutstandingBillsComponent;
  @ViewChild(BillAmountDetailsComponent, { static: true }) billAmountDetailsComponent: BillAmountDetailsComponent;


  constructor(
    private billSettlementService: BillSettlementService,
    private billService: BillService,
    private snackbar: MatSnackBar,
    private decimalPipe: DecimalPipe,
    private date: DatePipe,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.onGetBillDetails();
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

  onGetBillDetails() {

    this.tenantId = this.cookieService.get('ownerId');
    this.billSettlementService.getTenantBillDetails(this.tenantId).subscribe(
      {
        next: (billSettlement: BillSettlement) => {
          this.billSettlement = billSettlement;
        },
        error: (err) => {
          this.notificationMessage('Outstanding Bills Not Found.', 'yellow-snackbar');
        }
      });
  }

  onSaveBillPayment(event: boolean) {
    const billMasterDetails = this.outstandingBillsComponent.selectedRows;
    if (billMasterDetails && billMasterDetails.length) {
      this.onGetValues();
      this.updateBillPayments();
      this.updatePaymentTransactions();
      this.billSettlementService.saveBillPayments(this.billPayment).subscribe({
        next: (response) => {
          if (response) {
            if (this.labelName === 'Excess Amount' && this.excessAmount > 0 && response !== 0) {
              this.saveAdvancePaymentDetails(response);
            } else {
              this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
              this.reset();
            }
          } else {
            this.notificationMessage('Bill payment save failed', 'green - snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Bill payment save failed', 'red-snackbar');
        }
      });
    }
  }


  updatePaymentTransactions() {
    let billMasterDetails: BillMaster[] = [];
    let paymentTransactions: PaymentTransaction[] = [];
    billMasterDetails = this.outstandingBillsComponent.selectedRows;

    billMasterDetails = this.outstandingBillsComponent.selectedRows;
    if (billMasterDetails && billMasterDetails.length) {
      billMasterDetails.forEach(billMaster => {
        const paymentTransaction: PaymentTransaction = {
          billId: billMaster.id,
          paidAmount: billMaster.billAmount,
          advanceAmount: 0
        };
        paymentTransactions.push(paymentTransaction);
      });
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
    this.excessAmount = this.billAmountDetailsComponent.excessAmount;
    this.labelName = this.billAmountDetailsComponent.labelName;
  }

  updateBillPayments() {
    this.billPayment = {
      paymentDate: this.date.transform(this.paymentDate, 'yyyy-MM-dd'),
      paymentAmount: Number(this.paymentAmount),
      clientId: Number(this.cookieService.get('globalClientId')),
      billType: 1,
      ownerId: this.outstandingBillsComponent.selectedRows[0].ownerId,
      modeofPayment: this.paymentModeId,
      paymentReference: this.refNumber,
      remarks: this.remarks
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

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    this.totAmt = 0;
    if (this.selectedRows && this.selectedRows.length) {
      this.selectedRows.forEach(element => {
        this.totAmt += element.toPay;
      })
    } else {
      this.totAmt = 0;
    }
    this.totAmt = Number(this.decimalPipe.transform(this.totAmt, this.roundFormat).replace(',', ''));
  }

  // updateBillsPaymentId(paymentId: number) {
  //   let billMasterDetails: BillMaster[] = [];
  //   let paymentTransactions: PaymentTransaction[] = [];

  //   billMasterDetails = this.outstandingBillsComponent.selectedRows;
  //   if (billMasterDetails && billMasterDetails.length) {
  //     billMasterDetails.forEach(billMaster => {
  //       const paymentTransaction: PaymentTransaction = {
  //         paymentId: paymentId,
  //         billId: billMaster.id,
  //         paidAmount: billMaster.billAmount
  //       };
  //       paymentTransactions.push(paymentTransaction);
  //     });

  //   }
  //   this.billSettlementService.updatePaymentTransactions(paymentTransactions).subscribe(
  //     response => {
  //       if (response) {
  //         if (this.excessAmount > 0 && paymentId !== 0) {
  //           this.saveAdvancePaymentDetails(paymentId);
  //         } else {
  //           this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
  //           this.reset();
  //         }
  //       } else {
  //         this.notificationMessage('Bill payment save failed', 'green - snackbar');
  //       }
  //     });
  // }

  saveAdvancePaymentDetails(paymentId: number) {
    const advancePayment: AdvancePayment = {
      advanceDate: this.paymentDate,
      paymentId: paymentId,
      advanceAmount: Number(this.excessAmount)
    };
    this.billService.saveAdvancePayment(advancePayment).subscribe(
      response => {
        if (response) {
          this.notificationMessage('Bill payment saved successfully', 'green-snackbar');
          this.reset();
        } else {
          this.notificationMessage('Bill payment save failed', 'green - snackbar');
        }
      });
  }

  reset() {
    this.bankId = this.paymentDetailsComponent.bankId = 0;
    this.remarks = this.paymentDetailsComponent.remarks = '';
    this.paymentModeId = this.paymentDetailsComponent.paymentModeId = 0;
    this.paymentDate = new Date(Date.now.toString());
    this.refNumber = this.paymentDetailsComponent.refNumber = '';
    this.paymentAmount = 0;
    this.billAmountDetailsComponent.toPay = '0';
    this.excessAmount = this.billAmountDetailsComponent.excessAmount = 0;
    this.billSettlement = { outstandingBills: [] };
  }


}
