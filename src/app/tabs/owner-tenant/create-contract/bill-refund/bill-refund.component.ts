import { Component, OnInit, Inject } from '@angular/core';
import { Contract } from '../contract-create-update/contract.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { Refund } from 'src/app/tabs/shared/models/refund.model';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Payment } from 'src/app/tabs/shared/models/payment.model';
import { DatePipe } from '@angular/common';
import { RefundTransaction } from 'src/app/tabs/shared/models/refund-transaction.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';

@Component({
  selector: 'fury-bill-refund',
  templateUrl: './bill-refund.component.html',
  styleUrls: ['./bill-refund.component.scss']
})
export class BillRefundComponent implements OnInit {

  refundDate = new Date;
  amount: number = 0;
  remarks: string = '';
  paymentModeId: number = 0;
  clientId: string = '';
  paymentModes: ListItem[] = [{ label: 'Select', value: 0 }];
  form: FormGroup;
  refundAmount: number = 0;
  errorMessage: string = '';
  refundableAmount: number = 0;
  title: string = 'Refund';
  maxDate: Date = new Date();
  currency = getClientDataFormat('Currency');
  roundFormat = getClientDataFormat('RoundOff');

  constructor(@Inject(MAT_DIALOG_DATA) private data: Contract,
    private dialogRef: MatDialogRef<BillRefundComponent>,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar, private fb: FormBuilder,
    private cookieService: CookieService, private date: DatePipe) {
    this.title = this.data.type;
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.clientId = this.cookieService.get('globalClientId');
    this.onGetPaymentModes();
    this.form = this.fb.group({
      amount: ['']
    });
    if (this.data && this.data.type === 'Refund') {
      this.refundAmount = this.data.refundAmount;
      this.refundableAmount = this.data.receivedAmount - this.data.refundAmount;
      this.amount = this.refundableAmount;
    } else {
      this.amount = this.data.remainingAmount;
    }
  }

  calculateRefundableAmount(value) {
    if (this.title === 'Refund') {
      this.errorMessage = '';
      if (this.refundableAmount < parseInt(value)) {
        this.errorMessage = "Refund Amount should not be greater than " + this.refundableAmount;
      }
      this.amount = value;
    }
  }


  onGetPaymentModes() {
    this.paymentModes = [{ label: 'Select', value: 0 }];
    this.billSettlementService.getPaymentModes().subscribe(paymentModes => {
      paymentModes.forEach(x => {
        this.paymentModes.push({ label: x.description, value: x.id });
      });
    });
  }


  onSave() {
    if (this.amount && this.paymentModeId && this.remarks) {
      if (this.title === 'Refund') {
        let refundAmount: number = Number(this.amount == 0 ? 0 : this.amount);
        const refund: Refund = {
          ownerId: this.data.tenantId,
          billType: 3,
          modeOfPayment: this.paymentModeId,
          clientId: Number(this.clientId),
          refundDate: this.refundDate,
          refundAmount: refundAmount,
          remarks: this.remarks
        }
        let refundTransactions: RefundTransaction[] = [];
        if (this.data.billMasters && this.data.billMasters.length) {
          let refundTransactionAmount: number = 0;
          const billMasters = this.data.billMasters.filter(x => x.billNumber == null);
          if (billMasters && billMasters.length) {
            billMasters.sort((a, b) => b.paymentId - a.paymentId).forEach(x => {
              if (x.billAmount != x.previousDueAmount) {
                if (refundAmount > 0) {
                  const balanceAmount = Number(refundAmount) - Number(x.paid);
                  if (balanceAmount >= 0) {
                    refundTransactionAmount = x.paid;
                    refundAmount = balanceAmount;
                  } else {
                    refundTransactionAmount = refundAmount;
                    refundAmount = 0;
                  }
                  if (refundTransactionAmount > 0) {
                    const refundTransaction: RefundTransaction = {
                      paymentId: x.paymentId,
                      refundAmount: refundTransactionAmount
                    }
                    refundTransactions.push(refundTransaction);
                    refundTransactionAmount = 0;
                  }
                }
              }
            });
          }
        }
        if (refundTransactions && refundTransactions.length) {
          refund.refundTransactions = refundTransactions;
        }
        this.dialogRef.close(refund);
      } else {
        if (this.amount && this.paymentModeId && this.remarks) {
          const payment: Payment = {
            paymentDate: this.date.transform(this.refundDate, 'yyyy-MM-dd'),
            paymentAmount: Number(this.amount),
            clientId: Number(this.cookieService.get('globalClientId')),
            billType: 3,
            ownerId: this.data.tenantId,
            modeofPayment: this.paymentModeId,
            remarks: this.remarks,
            paymentTransactions: [{
              billId: 0,
              paidAmount: Number(this.amount),
              advanceAmount: 0,
              isAdvanceAmount: false
            }]
          };
          this.dialogRef.close(payment);
        }
      }
    }
  }

  onChangePaymentMode(value) {
    this.paymentModeId = value;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  close() {
    this.dialogRef.close();
  }

}
