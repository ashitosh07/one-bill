import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreditNote } from 'src/app/tabs/shared/models/credit-note.model';
import { BillMaster } from 'src/app/tabs/shared/models/bill-master.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { environment } from 'src/environments/environment';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TableStructureComponent } from 'src/app/tabs/shared/components/table-structure/table-structure.component';
import { CreditNoteTransaction } from 'src/app/tabs/shared/models/credit-note-transaction.model';
import { BillSettlementService } from 'src/app/tabs/shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'app-credit-note-details',
  templateUrl: './credit-note-details.component.html',
  styleUrls: ['./credit-note-details.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreditNoteDetailsComponent implements OnInit {


  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;


  creditNoteTransactions: CreditNoteTransaction[] = [];
  columns: ListColumn[] = [];

  identifierColumnName = '#';
  accountHeadColumnName = 'Account Head';
  amountColumnName = 'Amount';
  creditNoteAmountColumnName = 'Credit Note Amount';

  accountHeadAmount: string = '';
  creditNoteAmount: string = '';
  viewMode: string = 'Edit';
  format = '';
  currency = '';
  roundFormat = getClientDataFormat('RoundOff'); //?? environment.roundOffFormat;

  clientId: number = 0;

  disableSave = false;

  @ViewChild(TableStructureComponent, { static: true }) tableStructureComponent: TableStructureComponent;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CreditNote,
    private dialogRef: MatDialogRef<CreditNoteDetailsComponent>,
    private currencyPipe: CurrencyPipe,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private decimalPipe: DecimalPipe,
    private envService: EnvService
  ) {
    this.format = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
  }

  ngOnInit(): void {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.createGridColumns();
    this.onGetAccountHeads(this.data);
  }

  createGridColumns(): any {
    this.columns = [
      { name: this.identifierColumnName, property: 'rowNumber', visible: true, isModelProperty: true },
      { name: this.accountHeadColumnName, property: 'headDisplay', visible: true, isModelProperty: true },
      { name: this.amountColumnName, property: 'fixedAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.creditNoteAmountColumnName, property: 'creditNoteAmountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } }
    ] as ListColumn[];
    if (this.data.transactionMode === 'View') {
      this.viewMode = this.data.transactionMode;
      this.columns.splice(-1, 1);
      this.columns.push({ name: this.creditNoteAmountColumnName, property: 'creditNoteAmountLocal', visible: true, isModelProperty: true });
    }
  }

  onGetAccountHeads(data: CreditNote) {
    this.creditNoteTransactions = data.creditNoteTransactions;
    let accountHeadAmount = 0;
    let creditNoteAmount = 0;
    this.creditNoteTransactions.forEach(creditNoteTransaction => {
      accountHeadAmount += Number(creditNoteTransaction.fixedAmount);
      creditNoteAmount += Number(creditNoteTransaction.creditNoteAmount);
      creditNoteTransaction.creditNoteAmountLocal = this.decimalPipe.transform(creditNoteTransaction.creditNoteAmount, this.roundFormat.toString()).replace(/,/g, '');
      creditNoteTransaction.fixedAmountLocal = this.currencyPipe.transform(creditNoteTransaction.fixedAmount, this.currency.toString(), true, this.roundFormat.toString()) //.replace(/[^0-9.-]+/g,"") //.replace(/,/g, '')
    });

    this.accountHeadAmount = this.currencyPipe.transform(accountHeadAmount, this.currency.toString(), true, this.roundFormat);
    this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currency.toString(), true, this.roundFormat);
  }

  onSave() {
    const dataSource = this.tableStructureComponent.dataSource;
    let creditNoteAmount: number = 0;
    let creditNoteTransactions: CreditNoteTransaction[] = [];
    let vat = 0;
    if (dataSource && dataSource.filteredData && dataSource.filteredData.length) {
      dataSource.filteredData.forEach(x => {
        if (Number(x.creditNoteAmountLocal.replace(/,/g, '')) > 0) {
          const creditNoteTransaction: CreditNoteTransaction = {
            billHeadId: Number(x.billHeadId),
            headDisplay: x.headDisplay,
            creditNoteAmount: Number(x.creditNoteAmountLocal.replace(/,/g, '')),
            taxId: Number(x.taxId)
          }
          // if (x.isVAT) {
          //   vat += Number(x.creditNoteAmount) * Number(this.data.vat) / 100;
          // }
          creditNoteTransactions.push(creditNoteTransaction);
        }
        creditNoteAmount += Number(x.creditNoteAmountLocal.replace(/,/g, ''));
        // if (vat > 0) {
        //   if (creditNoteTransactions && creditNoteTransactions.length) {
        //     const existingVAT = this.creditNoteTransactions.find(x => x.headDisplay === 'VAT');
        //     if (existingVAT) {
        //       existingVAT.creditNoteAmount += vat;
        //     } else {
        //       const creditNoteTransaction: CreditNoteTransaction = {
        //         billHeadId: Number(this.data.vatAccountHeadId),
        //         headDisplay: 'VAT',
        //         creditNoteAmount: Number(vat)
        //       }
        //       creditNoteTransactions.push(creditNoteTransaction);
        //     }
        //   } else {
        //     const creditNoteTransaction: CreditNoteTransaction = {
        //       billHeadId: Number(this.data.vatAccountHeadId),
        //       headDisplay: 'VAT',
        //       creditNoteAmount: Number(vat)
        //     }
        //     creditNoteTransactions.push(creditNoteTransaction);
        //   }
        //   creditNoteAmount += vat;
        //   vat = 0;
        // }
      });
    }
    if (creditNoteTransactions && !creditNoteTransactions.length) {
      this.notificationMessage('Credit note save failed', 'red-snackbar');
      return;
    }
    const creditNote: CreditNote = {
      clientId: this.clientId,
      ownerId: this.data.ownerId,
      billMasterId: Number(this.data.billMasterId),
      creditNoteAmount: Number(creditNoteAmount),
      creditNoteTransactions: creditNoteTransactions
    };

    this.billSettlementService.saveCreditNote(creditNote).subscribe({
      next:
        response => {
          if (response) {
            this.dialogRef.close(true);
            this.notificationMessage('Credit note saved successfully', 'green-snackbar');
          } else {
            this.notificationMessage('Credit note save failed', 'red-snackbar');
          }
        },
      error: (err) => {
        this.notificationMessage('Credit note save failed', 'red-snackbar');
      }
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onChangedRow() {
    this.disableSave = false;
    let creditNoteAmount = 0;
    const dataSource = this.tableStructureComponent.dataSource;
    if (dataSource) {

      dataSource.filteredData.forEach(
        row => {
          if ((row.creditNoteAmountLocal && row.fixedAmount) && Number(row.creditNoteAmountLocal) > row.fixedAmount) {
            this.notificationMessage('Credit note amount should be less than Head amount', 'yellow-snackbar');
            this.disableSave = true;
            return;
          }
          else if (row.creditNoteAmountLocal === '' || row.fixedAmount === '') {
            this.disableSave = true;
            return;
          }
        }
      );
      if (!this.disableSave) {
        const taxRows = dataSource.filteredData.filter(x => x.disabled && x.value > 0);
        if (taxRows && taxRows.length) {
          taxRows.forEach((taxRow: CreditNoteTransaction) => { taxRow.creditNoteAmountLocal = this.decimalPipe.transform(0, this.roundFormat); });
        }
        dataSource.filteredData.forEach(
          row => {
            creditNoteAmount += Number(this.decimalPipe.transform(row.creditNoteAmountLocal.replace(',', ''), this.roundFormat).replace(',', ''));
            if (row.isVAT) {
              // const rowVAT = dataSource.filteredData.find(x => x.headDisplay === 'VAT');
              // if (rowVAT) {
              //   vatAmount += Number(row.creditNoteAmount) * Number(this.data.vat) / 100;
              //   rowVAT.creditNoteAmount = this.decimalPipe.transform(vatAmount, this.roundFormat);
              // }
              if (taxRows && taxRows.length) {
                taxRows.forEach((taxRow: CreditNoteTransaction) => {
                  if (taxRow.formulaFieldName === 'Percentage') {
                    const taxAmount = Number(this.decimalPipe.transform(row.creditNoteAmountLocal.replace(',', ''), this.roundFormat).replace(',', '')) * Number(this.decimalPipe.transform(taxRow.value, this.roundFormat).replace(',', '')) / 100;
                    taxRow.creditNoteAmount += Number(this.decimalPipe.transform(taxAmount, this.roundFormat).replace(',', ''));
                  }
                  taxRow.creditNoteAmountLocal = this.decimalPipe.transform(taxRow.creditNoteAmount, this.roundFormat);
                });
              }
            }
          }
        )
        this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currency.toString(), true, this.roundFormat);
      }



    }
  }
}
