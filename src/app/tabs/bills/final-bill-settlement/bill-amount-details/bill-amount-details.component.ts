import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatDialog } from '@angular/material/dialog';
import { AddNewAccountHeadComponent } from '../add-new-account-head/add-new-account-head.component';
import { MatTableDataSource } from '@angular/material/table';
import { AccountHead } from 'src/app/tabs/shared/models/account-head.model';
import { BillSettlement } from 'src/app/tabs/shared/models/bill-Settlement.model';
import { TableStructureComponent } from 'src/app/tabs/shared/components/table-structure/table-structure.component';
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model';
import { DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { convertToNumber, getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';


@Component({
  selector: 'app-bill-amount-details',
  templateUrl: './bill-amount-details.component.html',
  styleUrls: ['./bill-amount-details.component.scss']
})
export class BillAmountDetailsComponent implements OnInit {

  accountHeads: AccountHead[] = [];
  accountHeadData: AccountHead[] = [];
  dateFormat = getClientDataFormat('DateFormat');
  currencyFormat = getClientDataFormat('Currency',0);
  roundFormat = getClientDataFormat('RoundOff'); 
  amountdecimalPlaces = parseInt(this.roundFormat.substring(this.roundFormat.indexOf('-')+1,this.roundFormat.length));
  isAdjustWithAdvance: boolean = true;
  labelName = 'Excess Amount';

  @Input() isDisable = false;
  @Input() isHide = false;
  @Input()
  set dataSource(value: BillSettlement) {
    this.dateFormat = getClientDataFormat('DateFormat');
    this.roundFormat = getClientDataFormat('RoundOff');
    this.currencyFormat = getClientDataFormat('Currency',0);

    if (value && !this.isHide) {
      if (value.accountHeads && value.accountHeads.length) {
        this.accountHeads = value.accountHeads;
        this.accountHeadData = value.accountHeads.filter(x => x.accountHeadName !== 'VAT');
      }
      if (value.outstandingBills && value.outstandingBills.length) {
        this.billAmount = 0;
        
        value.outstandingBills.forEach(x => this.billAmount += Number(x.toPay));
        this.toPay = this.decimalPipe.transform(this.billAmount, this.roundFormat.toString()).replace(/,/g, '');
        this.roundOff = this.total = this.billAmount = Number(this.decimalPipe.transform(this.billAmount, this.roundFormat.toString()).replace(/,/g, ''));
        //this.onCalculateVAT(this.accountHeads);
      } else {
        this.toPay = '0';
        this.advanceAdjusted = this.excessAmount = this.roundOff = this.total = this.billAmount = 0;
      }
    } else {
      this.toPay = '0';
      this.advanceAdjusted = this.excessAmount = this.roundOff = this.total = this.billAmount = 0;
    }
    if (value && value.advance) {
      this.previousAdvanceAmount = value.advance.advanceAmount;
    } else {
      this.previousAdvanceAmount = 0;
    }
    if (value && value.openingBalance) {
      this.billAmount = value.openingBalance.amount;
      this.total += this.billAmount;
      if (this.total > this.previousAdvanceAmount) {
        this.advanceAdjusted = this.previousAdvanceAmount;
        this.toPay = this.decimalPipe.transform(this.total - this.previousAdvanceAmount, this.roundFormat.toString()).replace(/,/g, '');
      } else if (this.total < this.previousAdvanceAmount) {
        this.advanceAdjusted = this.total;
        this.toPay = '0';
      }
    } else {
      this.billAmount = 0;
    }
    if (this.advanceAdjusted > 0 && Number(this.toPay) >= 0) {
      this.isValidPayment.emit(true);
    }
    else if (Number(this.toPay) > 0) {
      this.isValidPayment.emit(true);
    }
    else {
      this.isValidPayment.emit(false);
    }
    this.toPay = this.decimalPipe.transform(this.toPay, this.roundFormat.toString()).replace(/,/g, '');
  }

  @Input()
  set selectedRows(value: BillMaster[]) {
    if (value && value.length) {
      this.total = this.excessAmount = 0;
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundFormat = getClientDataFormat('RoundOff');
      this.currencyFormat = getClientDataFormat('Currency',0);
      value.forEach(x => this.total += Number(x.toPay));
      if (this.total) {
        if (this.previousAdvanceAmount > 0) {
          this.roundOff = this.total = Number(this.decimalPipe.transform(this.total + this.billAmount, this.roundFormat.toString()).replace(/,/g, ''));
          if (this.total > this.previousAdvanceAmount) {
            this.advanceAdjusted = this.previousAdvanceAmount;
            this.toPay = this.decimalPipe.transform(this.total - this.previousAdvanceAmount, this.roundFormat.toString()).replace(/,/g, '');
          } else {
            this.advanceAdjusted = this.total;
            this.toPay = '0';
          }
        } else {
          this.toPay = this.decimalPipe.transform(this.total + this.billAmount, this.roundFormat.toString()).replace(/,/g, '');
          this.roundOff = this.total = Number(this.decimalPipe.transform(this.total + this.billAmount, this.roundFormat.toString()).replace(/,/g, ''));
          this.advanceAdjusted = 0
        }
      }
    } else {
      this.total = this.excessAmount = 0;
      this.total += this.billAmount;
      if (this.total > this.previousAdvanceAmount) {
        this.advanceAdjusted = this.previousAdvanceAmount;
        this.toPay = this.decimalPipe.transform(this.total - this.previousAdvanceAmount, this.roundFormat.toString()).replace(/,/g, '');
      } else if (this.total < this.previousAdvanceAmount) {
        this.advanceAdjusted = this.total;
        this.toPay = '0';
      } else {
        this.advanceAdjusted = 0;
        this.toPay = this.decimalPipe.transform(this.billAmount, this.roundFormat.toString()).replace(/,/g, '');
        this.roundOff = this.total = this.billAmount;
      }
    }
    if (this.advanceAdjusted > 0 && Number(this.toPay) >= 0) {
      this.isValidPayment.emit(true);
    }
    else if (Number(this.toPay) > 0) {
      this.isValidPayment.emit(true);
    }
    else {
      this.isValidPayment.emit(false);
    }
  }

  @Output() isValidPayment = new EventEmitter<boolean>();

  billAmount: number = 0;
  total: number = 0;
  roundOff: number = 0;
  toPay: string = '0';
  vatAmount: number = 0;
  excessAmount: number = 0;
  previousAdvanceAmount: number = 0;
  advanceAdjusted: number = 0;
  columns: ListColumn[] = [];

  identifierColumnNmae = '#';
  accountHeadColumnName = 'Account Head';
  amountColumnName = 'Amount';

  @ViewChild(TableStructureComponent, { static: false }) tableStructureComponent: TableStructureComponent;

  constructor(
    private dialog: MatDialog,
    private decimalPipe: DecimalPipe) { }

  ngOnInit(): void {    
    this.createGridColumns();
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.accountHeadColumnName, property: 'accountHeadName', visible: true, isModelProperty: true },
      { name: this.amountColumnName, property: 'fixedAmount', visible: true, isModelProperty: true }] as ListColumn[];
  }

  addNewItem() {
    this.dialog.open(AddNewAccountHeadComponent, { data: this.accountHeadData }).afterClosed().subscribe((accountHead: AccountHead) => {
      if (accountHead) {
        accountHead.rowNumber = this.accountHeads.length + 1
        this.accountHeads.push(accountHead);
        if (this.accountHeads) {
          this.tableStructureComponent.dataSource = new MatTableDataSource();
          this.tableStructureComponent.dataSource.data = this.accountHeads;
          this.accountHeads.forEach(x => this.total += x.fixedAmount);
          
          this.roundOff = this.total;
          this.toPay = this.decimalPipe.transform(this.total, this.roundFormat.toString()).replace(/,/g, '');
        }
      }
    });
  }

  onAdvanceAdjustedChange(value: number) {
    if (Number(this.toPay) > this.total) {
      this.labelName = 'Excess Amount';
      this.excessAmount = Number(this.decimalPipe.transform(Number(this.toPay) - this.total, this.roundFormat.toString()).replace(/,/g, ''));
    } else {
      this.labelName = 'Balance Amount';
      this.excessAmount = Number(this.decimalPipe.transform(this.total - Number(this.toPay), this.roundFormat.toString()).replace(/,/g, ''));
    }
  }

  onToPayAmountChange(value: number) {
    if (this.advanceAdjusted > 0 && Number(this.toPay) >= 0) {
      this.isValidPayment.emit(true);
    } else if (Number(this.toPay) > 0) {
      this.isValidPayment.emit(true);
    } else {
      this.isValidPayment.emit(false);
    }
    if ((convertToNumber(this.toPay) + convertToNumber(this.advanceAdjusted)) > convertToNumber(this.total)) {
      this.labelName = 'Excess Amount';
      this.excessAmount = Number(this.decimalPipe.transform(convertToNumber(this.toPay) + convertToNumber(this.advanceAdjusted) - convertToNumber(this.total), this.roundFormat.toString()).replace(/,/g, ''));
    } else {
      this.labelName = 'Balance Amount';
      this.excessAmount = Number(this.decimalPipe.transform(convertToNumber(this.total) - convertToNumber(this.toPay) - convertToNumber(this.advanceAdjusted), this.roundFormat.toString()).replace(/,/g, ''));
    }
  }

  onRoundOffAmountChange(value: number) {
    if (value > 0) {
      this.toPay = this.decimalPipe.transform(Number(this.total) + Number(value), this.roundFormat.toString()).replace(/,/g, '');
    } else {
      this.roundOff = 0;
      this.toPay = this.decimalPipe.transform(this.total, this.roundFormat.toString()).replace(/,/g, '');
    }
  }

  onCalculateVAT(accountHeads: AccountHead[]) {
    if (accountHeads && accountHeads.length) {
      const accountHead = accountHeads.find(x => x.accountHeadName === 'VAT');
      if (accountHead) {
        if (accountHead.formulaDescription === 'GrandTotal'
          && accountHead.operatorDescription === 'Percentage') {
          this.vatAmount = Number(this.decimalPipe.transform((Number(this.toPay) * Number(accountHead.fixedAmount)) / 100, this.roundFormat));
        } else if (accountHead.formulaDescription === 'GrandTotal'
          && accountHead.operatorDescription === 'Add') {
          this.vatAmount = Number(this.decimalPipe.transform((Number(this.toPay) + Number(accountHead.fixedAmount)), this.roundFormat));
        }
        if (accountHead.formulaDescription === 'GrandTotal'
          && accountHead.operatorDescription === 'Multiply') {
          this.vatAmount = Number(this.decimalPipe.transform((Number(this.toPay) * Number(accountHead.fixedAmount)), this.roundFormat));
        }
        if (accountHead.formulaDescription === 'GrandTotal'
          && accountHead.operatorDescription === 'Subtract') {
          this.vatAmount = Number(this.decimalPipe.transform((Number(this.toPay) - Number(accountHead.fixedAmount)), this.roundFormat));
        }
        if (accountHead.formulaDescription === 'GrandTotal'
          && accountHead.operatorDescription === 'Divide') {
          this.vatAmount = Number(this.decimalPipe.transform((Number(this.toPay) / Number(accountHead.fixedAmount)), this.roundFormat));
        }
      }
    }
    this.toPay = this.decimalPipe.transform(Number(this.toPay) + this.vatAmount,this.roundFormat);
  }

  onChangeAdjustWithAdvance(event: any) {
    this.isAdjustWithAdvance = event.checked;
    if (this.isAdjustWithAdvance) {
      if (this.total >= this.previousAdvanceAmount) {
        const total: number = Number(this.total);
        const previousAdvanceAmount: number = Number(this.previousAdvanceAmount);
        this.toPay = this.decimalPipe.transform(Number(total - previousAdvanceAmount), this.roundFormat.toString()).replace(/,/g, '');
      } else {
        this.toPay = '0';
      }
    }
    else {
      this.toPay = this.decimalPipe.transform(Number(this.total), this.roundFormat.toString()).replace(/,/g, '');
    }
  }
}
