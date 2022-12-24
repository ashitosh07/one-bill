import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountHead } from 'src/app/tabs/shared/models/account-head.model';
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { environment } from 'src/environments/environment';
import { CurrencyPipe } from '@angular/common';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { BillDiscount } from 'src/app/tabs/shared/models/bill-discount.model';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'app-account-head-details',
  templateUrl: './account-head-details.component.html',
  styleUrls: ['./account-head-details.component.scss']
})
export class AccountHeadDetailsComponent implements OnInit {

  accountHeadData: AccountHead[] = [];
  columns: ListColumn[] = [];

  identifierColumnName = '#';
  accountHeadColumnName = 'Account Head';
  amountColumnName = 'Amount';
  discountAmountColumnName = 'Discount Amount';

  format ='';
  currency = '';
  roundFormat = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: BillMaster,
    private dialogRef: MatDialogRef<AccountHeadDetailsComponent>,
    private currencyPipe: CurrencyPipe,
    private envService: EnvService
  ) {

    this.format = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.createGridColumns();
    this.onGetAccountHeads(this.data);
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.identifierColumnName, property: 'rowNumber', visible: true, isModelProperty: true },
      { name: this.accountHeadColumnName, property: 'accountHeadName', visible: true, isModelProperty: true },
      { name: this.amountColumnName, property: 'fixedAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.discountAmountColumnName, property: 'discountAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } }] as ListColumn[];
  }

  onGetAccountHeads(data: BillMaster) {
    this.accountHeadData = [];
    if (data) {
      if (data.bills && data.bills.length) {
        data.bills.forEach(bill => {
          if (bill.billTransactions && bill.billTransactions.length) {
            bill.billTransactions.forEach(transaction => {
              let accountHeadExist: AccountHead = null;
              if (this.accountHeadData && this.accountHeadData.length) {
                accountHeadExist = this.accountHeadData.find(x => x.accountHeadName.trim().toLowerCase() === transaction.headDisplay.trim().toLowerCase());
              }
              if (accountHeadExist) {
                accountHeadExist.fixedAmount += transaction.headAmount;
                accountHeadExist.fixedAmountLocal = this.currencyPipe.transform(accountHeadExist.fixedAmount, this.currency.toString(), true, this.roundFormat)
              } else {
                const accountHead: AccountHead = {
                  rowNumber: this.accountHeadData.length + 1,
                  accountHeadName: transaction.headDisplay,
                  billHeadId: transaction.billHeadId,
                  fixedAmount: transaction.headAmount,
                  position: transaction.position,
                  fixedAmountLocal: this.currencyPipe.transform(transaction.headAmount, this.currency.toString(), true, this.roundFormat)
                };
                this.accountHeadData.push(accountHead);
              }
            });
          }
        });
      }
      if (data.billCharges && data.billCharges.length) {
        data.billCharges.forEach(billCharge => {
          let accountHeadExist: AccountHead = null;
          if (this.accountHeadData && this.accountHeadData.length) {
            accountHeadExist = this.accountHeadData.find(x => x.accountHeadName.trim().toLowerCase() === billCharge.headDisplay.trim().toLowerCase());
          }
          if (accountHeadExist) {
            accountHeadExist.fixedAmount += billCharge.headAmount;
            accountHeadExist.fixedAmountLocal = this.currencyPipe.transform(accountHeadExist.fixedAmount, this.currency.toString(), true, this.roundFormat);
          } else {
            const accountHead: AccountHead = {
              rowNumber: this.accountHeadData.length + 1,
              accountHeadName: billCharge.headDisplay,
              fixedAmount: billCharge.headAmount,
              billHeadId: billCharge.billHeadId,
              position: billCharge.position,
              fixedAmountLocal: this.currencyPipe.transform(billCharge.headAmount, this.currency.toString(), true, this.roundFormat)
            };
            this.accountHeadData.push(accountHead);
          }
        });
      }
      if (data.billTaxDetails && data.billTaxDetails.length) {
        data.billTaxDetails.forEach(billTaxDetail => {
          let accountHeadExist: AccountHead = null;
          let largest: number = 0;
          if (this.accountHeadData && this.accountHeadData.length) {
            largest = this.accountHeadData.sort((a, b) => a.position - b.position)[this.accountHeadData.length - 1]?.position ?? 0;
          }
          if (this.accountHeadData && this.accountHeadData.length) {
            accountHeadExist = this.accountHeadData.find(x => x.accountHeadName.trim().toLowerCase() === billTaxDetail.taxDisplayName.trim().toLowerCase());
          }
          if (accountHeadExist) {
            accountHeadExist.fixedAmount += billTaxDetail.taxAmount;
            accountHeadExist.fixedAmountLocal = this.currencyPipe.transform(accountHeadExist.fixedAmount, this.currency.toString(), true, this.roundFormat);
          } else {
            const accountHead: AccountHead = {
              rowNumber: this.accountHeadData.length + 1,
              accountHeadName: billTaxDetail.taxDisplayName,
              fixedAmount: billTaxDetail.taxAmount,
              position: largest + 1,
              fixedAmountLocal: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
            };
            this.accountHeadData.push(accountHead);
          }
        });
      }

      if (data.billDiscounts && data.billDiscounts.length) {
        data.billDiscounts.forEach(billDiscount => {
          let accountHeadExist: AccountHead = null;
          if (this.accountHeadData && this.accountHeadData.length) {
            accountHeadExist = this.accountHeadData.find(x => x.billHeadId === billDiscount.billHeadId);
          }
          if (accountHeadExist) {        
            accountHeadExist.discountAmount = (accountHeadExist?.discountAmount ?? 0) + billDiscount.headAmount;
            accountHeadExist.discountAmountLocal = this.currencyPipe.transform(accountHeadExist.discountAmount, this.currency.toString(), true, this.roundFormat);
          }
        });
      }

      if (this.accountHeadData && this.accountHeadData.length) {
        this.accountHeadData = this.accountHeadData.sort((a, b) => a.position - b.position)
        for (let n = 0; n < this.accountHeadData.length; ++n) {
          this.accountHeadData[n].rowNumber = n + 1;
        }
      }
    }
  }
}
