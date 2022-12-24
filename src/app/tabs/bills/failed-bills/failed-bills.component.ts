import { Component, OnInit } from '@angular/core';
import { ManageParams } from '../../shared/models/manage-params.model';
import { BillMaster } from '../../shared/models/bill-master.model';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { TemplateService } from '../../shared/services/template.service';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BillCancelComponent } from '../bill-history/bill-cancel/bill-cancel.component';
import { AccountHeadDetailsComponent } from '../final-bill-settlement/account-head-details/account-head-details.component';
import { environment } from 'src/environments/environment';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VariablePayService } from '../../shared/services/variablepay.service';
import { VariablePay } from '../../bill/create-variablepay/variablepay-create-update/variablepay.model';
import { ManualBillConsumptionComponent } from './manual-bill-consumption/manual-bill-consumption.component';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { BillType, getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'fury-failed-bills',
  templateUrl: './failed-bills.component.html',
  styleUrls: ['./failed-bills.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class FailedBillsComponent implements OnInit {


  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  billPeriods: any[] = [];
  selectedRows: BillMaster[] = [];
  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  visibleButtons: ListColumn[] = [];
  billMasterDetails: BillMaster[] = [];
  manageParams: ManageParams = {};

  clientId: number;

  billAmount = '';
  receivedAmount = '';
  buttonName: string = 'Manual Bill';
  billNumberConsumptionColumnName = 'Bill No';
  buildingColumnName = 'Building';
  unitNumberColumnName = 'Unit Number';

  smsColumnName = 'SMS';
  emailColumnName = 'Email';
  watsappColumnName = 'Watsapp';
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff');
  dateFormat = '';
  currency = '';
  roundFormat = '';

  billNumberColumnName = 'Bill Number';
  accountNumberColumnName = 'Account Number';
  billDateColumnName = 'BillDate';
  tenantNameColumnName = 'Tenant Name';
  entityTypeColumnName = 'Owner/Tenant';
  unitColumnName = 'Unit';
  fromDateColumnName = 'From Date';
  toDateColumnName = 'To Date';
  dueDateColumnName = 'Due Date';
  billAmountColumnName = 'Bill Amount';
  paidColumnName = 'Paid';
  failedReasonColumnName = 'Failed Reason';
  cancelColumnName = 'Cancel';

  utilityTypeCoulmnNmae = 'Utility Type';
  meterNumberCoulmnNmae = 'Meter Number';
  previousReadingColumnName = 'Previous';
  presentReadingColumnName = 'Present';
  currentConsumptionColumnName = 'Cur-Consumption';


  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private variablePayService: VariablePayService,
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {

    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.getBillPeriods();
    this.createColumnNames();
    this.createGridColumns();
    this.createInnerGridColumns();
    this.addVisibleButtons();
  }

  createGridColumns() {
    this.columns = [
      'select',
      'accountNumber',
      'billNumber',
      'ownerName',
      'entityType',
      'unitNumber',
      'fromDateLocal',
      'toDateLocal',
      'dueDateLocal',
      'billAmountLocal',
      'paidLocal',
      'reasonForFailed',
      'button',
      'action'];
  }

  createInnerGridColumns() {
    this.innerColumns = [
      'utilityType',
      'deviceName',
      'previousReadingLocal',
      'presentReadingLocal',
      'consumptionLocal',
      'billAmountLocal'];
  }


  addVisibleButtons() {
    this.visibleButtons = [
      { property: 'modify' },
      { property: 'print' }
      //,{ property: 'cancel' }
    ] as ListColumn[];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.billNumberColumnName, property: 'billNumber' },
      { name: this.accountNumberColumnName, property: 'accountNumber' },
      { name: this.billDateColumnName, property: 'billDate' },
      { name: this.tenantNameColumnName, property: 'ownerName' },
      { name: this.entityTypeColumnName, property: 'entityType' },
      { name: this.unitColumnName, property: 'unitNumber' },
      { name: this.fromDateColumnName, property: 'fromDateLocal' },
      { name: this.toDateColumnName, property: 'toDateLocal' },
      { name: this.dueDateColumnName, property: 'dueDateLocal' },
      { name: this.billAmountColumnName, property: 'billAmountLocal', columnAlign: { 'text-align': 'right' } },
      { name: this.paidColumnName, property: 'paidLocal', columnAlign: { 'text-align': 'right' } },
      { name: this.failedReasonColumnName, property: 'reasonForFailed' },
      { name: this.utilityTypeCoulmnNmae, property: 'utilityType' },
      { name: this.meterNumberCoulmnNmae, property: 'deviceName' },
      { name: this.previousReadingColumnName, property: 'previousReadingLocal' },
      { name: this.presentReadingColumnName, property: 'presentReadingLocal' },
      { name: this.currentConsumptionColumnName, property: 'consumptionLocal' },
      { name: this.billAmountColumnName, property: 'amountLocal', columnAlign: { 'text-align': 'right' } }] as ListColumn[];
  }

  onGetBillsHistory(manageParams: ManageParams,manualBill: BillMaster = null) {
    this.manageParams = manageParams;
    this.billMasterDetails = [];
    this.billAmount = '';
    this.receivedAmount = '';
    let billAmount = 0;
    let receivedAmount = 0;
    manageParams.fromDate = manageParams.fromDate === '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate === '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');
    manageParams.clientId = this.clientId;
    this.billService.getBillHistory(manageParams).subscribe(
      response => {
        if (response) {
          const billMasterDetails = response.filter(x => x.isBillFailed === true);
          this.dateFormat = getClientDataFormat('DateFormat');
          this.roundFormat = getClientDataFormat('RoundOff');
          this.currency = getClientDataFormat('Currency');
          billMasterDetails.forEach(x => {
            x.billDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
            x.fromDateLocal = this.date.transform(x.fromDate.toString(), this.dateFormat.toString());
            x.toDateLocal = this.date.transform(x.toDate.toString(), this.dateFormat.toString());
            x.dueDateLocal = this.date.transform(x.toDate.toString(), this.dateFormat.toString());
            x.billAmountLocal = this.currencyPipe.transform(x.billAmount, this.currency.toString(), true, this.roundFormat);
            x.paidLocal = this.currencyPipe.transform(x.paid, this.currency.toString(), true, this.roundFormat);
            x.bills.forEach(bill => {
              this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId);
              bill.previousReadingLocal = this.decimalPipe.transform(bill.previousReading, this.consumptionRoundOffFormat);
              bill.presentReadingLocal = this.decimalPipe.transform(bill.presentReading, this.consumptionRoundOffFormat);
              bill.consumptionLocal = this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat);
              bill.billAmountLocal = this.currencyPipe.transform(bill.billAmount, this.currency.toString(), true, this.roundFormat);
            });
            billAmount = billAmount + x.billAmount;
            receivedAmount = receivedAmount + x.paid;

          });
          this.billMasterDetails = billMasterDetails;
          this.billAmount = this.currencyPipe.transform(billAmount, this.currency.toString(), true, this.roundFormat);
          this.receivedAmount = this.currencyPipe.transform(receivedAmount, this.currency.toString(), true, this.roundFormat);
          if(manualBill != null)
          {
            let failedBillMaster = this.billMasterDetails.find(x => x.billNumber == manualBill.billNumber);
            if(failedBillMaster != null)
            {
              if(failedBillMaster.isBillFailed) 
              {
                this.notificationMessage('Manual Bill save failed. Please check the consumption entered.', 'red-snackbar');
              }
            }
            else {
              this.notificationMessage('Manual Bill saved successfully', 'green-snackbar');
            }
          }
        }
      });
  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }

  getBillPeriods() {
    this.billPeriods = [{ label: 'Select', value: 0 }];
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id });
      });
    });
  }


  onViewDataRow(row: BillMaster) {
    this.dialog.open(AccountHeadDetailsComponent, { data: row }).afterClosed().subscribe();
  }

  onDeleteDataRow(row: BillMaster) {
    row.type = 'Cancel';
    this.dialog.open(BillCancelComponent, { data: row }).afterClosed().subscribe(() => {
      if (row) {
        this.onGetBillsHistory(this.manageParams);
      }
    });
  }

  onForceVerify() {
    if (this.selectedRows && this.selectedRows.length) {
      this.selectedRows.forEach(x => {
        x.isBillFailed = false;
      });
      this.billSettlementService.updateFaileBillsStatus(this.selectedRows).subscribe(response => {
        if (response) {
          this.notificationMessage('Failed bills status updated successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Failed bills status update failed', 'red-snackbar');
        }
        this.onGetBillsHistory(this.manageParams);
      });
    } else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
      this.onGetBillsHistory(this.manageParams);
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  onAverageConsumptionSave() {
    let variablePays: VariablePay[] = [];
    if (this.selectedRows && this.selectedRows.length) {
      this.selectedRows.forEach(billMaster => {
        if (billMaster.bills && billMaster.bills.length) {
          billMaster.billTypeId = BillType.AverageBill;
          billMaster.bills.forEach(bill => {
            const variablePay: VariablePay = {
              billPeriodId: billMaster.billPeriodId,
              tenantId: billMaster.ownerId,
              unitId: billMaster.unitId,
              clientId: billMaster.clientId,
              isDeduction: false,
              utilityTypeId: bill.utilityTypeId
            }
            variablePays.push(variablePay);
          });
        }
      });
      this.variablePayService.createOtherTypeConsumptionVariablePay(variablePays, 'average').subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.onSaveAverageConsumptionBills();
          } else {
            if (response.message) {
              this.notificationMessage(response.message, 'red-snackbar');
            } else {
              this.notificationMessage('No consumption to save', 'red-snackbar');
            }
            this.onGetBillsHistory(this.manageParams);
          }
        },
        error: (err) => {
          this.notificationMessage('Average consumption save failed', 'red-snackbar');
          this.onGetBillsHistory(this.manageParams);
        }
      });
    } else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }


  onSaveAverageConsumptionBills() {
    this.billSettlementService.updateOtherTypeConsumption(this.selectedRows).subscribe({
      next: response => {
        if (response) {
          this.notificationMessage('Average consumption saved successfully', 'green-snackbar');
        } else {
          this.notificationMessage('Average consumption save failed', 'red-snackbar');
        }
        this.onGetBillsHistory(this.manageParams);
      },
      error: (err) => {
        this.notificationMessage('Average consumption save failed', 'red-snackbar');
        this.onGetBillsHistory(this.manageParams);
      }
    });
  }

  onUpdateRow(row: BillMaster) {
    this.dialog.open(ManualBillConsumptionComponent, { data: row }).afterClosed().subscribe(
      (response: boolean) => {
        if (response) {
          this.onGetBillsHistory(this.manageParams,row);
        }
      });
  }

  async downloadReport(row: BillMaster) {
    const invoices: BillMaster[] = [row];
    this.invoiceView(invoices);
  }

  invoiceView(billMasters: BillMaster[]) {
    this.billService.invoiceView(billMasters).subscribe({
      next: data => {
        if (data) {
          this.downloadFile(data);
        } else {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('No data to print', 'red-snackbar');
      }
    });
  }

  async downloadFile(data: any[]) {
    const mergedPdf = await PDFDocument.create();
    for (const pdfCopyDoc of data) {
      const pdf = await PDFDocument.load(pdfCopyDoc);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }
    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }


}
