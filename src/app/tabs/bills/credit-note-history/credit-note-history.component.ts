import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManageParams } from '../../shared/models/manage-params.model';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlement } from '../../shared/models/bill-Settlement.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { Bill } from '../../shared/models/bill.model';
import { CreditNoteHistoryDetailsComponent } from './credit-note-history-details/credit-note-history-details.component';
import { CreditNoteHistoryToolbarComponent } from './credit-note-history-toolbar/credit-note-history-toolbar.component';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { CreditNote } from '../../shared/models/credit-note.model';
import { MatDialog } from '@angular/material/dialog';
import { CreditNoteDetailsComponent } from '../final-bill-settlement/credit-note-details/credit-note-details.component';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CookieService } from 'ngx-cookie-service';
import { ClientService } from '../../shared/services/client.service';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import * as moment from 'moment';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidateDecimalPlacesDirective } from '../../shared/custom-directives/validate-decimal-places-directive.directive';
import { CreditNoteTransaction } from '../../shared/models/credit-note-transaction.model';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'fury-credit-note-history',
  templateUrl: './credit-note-history.component.html',
  styleUrls: ['./credit-note-history.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreditNoteHistoryComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  tableData: any[] = [];
  clientId: number;
  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  creditNotes: CreditNote[] = [];
  selectedRows: CreditNote[] = [];
  visibleButtons: ListColumn[] = [];
  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  utilityTypes: any[] = [];
  manageParams: ManageParams;
  creditNoteAmount: string = '';
  billAmount: string = '';
  message: string = '';
  billPeriod: string = '';
  imageProperties: ImageProperty[] = [];

  isBillPeriodEnabled: boolean = false;
  roundFormat = '';
  currencyFormat ='';
  dateFormat = '';
  filePath = '';

  creditNoteDateCoulmnName = 'Credit Note Date';
  billNumberCoulmnName = 'Bill No';
  billDateCoulmnName = 'Bill Date';
  accountNumberColumnName = 'Account No';
  ownerNameColumnName = 'Owner Name';
  creditNoteNumberCoulmnName = 'Credit Note No';
  billAmountLocalColumnName = 'Bill Amount';
  creditNoteAmountColumnName = 'Credit Note Amount';

  @ViewChild(CreditNoteHistoryDetailsComponent, { static: true }) creditNoteHistoryDetailsComponent: CreditNoteHistoryDetailsComponent;
  @ViewChild(CreditNoteHistoryToolbarComponent, { static: true }) creditNoteHistoryToolbarComponent: CreditNoteHistoryToolbarComponent;


  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private date: DatePipe,
    private currency: CurrencyPipe,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private clientService: ClientService,
    private envService: EnvService) {
    this.filePath = envService.backendForFiles;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.getBillPeriods();
    this.getUtilities();
    this.createGridColumns();
    this.createColumnNames();
    this.createInnerGridColumns();
    this.addVisibleButtons();
  }


  createGridColumns() {
    this.columns = [
      'select',
      'creditNoteDateLocal',
      'creditNoteNumber',
      'billNumber',
      'billDateLocal',
      'accountNumber',
      'ownerName',
      'billAmountLocal',
      'creditNoteAmountLocal',
      'button',
      'action'];
  }

  createInnerGridColumns() {
    this.innerColumns = [];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.creditNoteDateCoulmnName, property: 'creditNoteDateLocal', visible: true, isModelProperty: true },
      { name: this.creditNoteNumberCoulmnName, property: 'creditNoteNumber', visible: true, isModelProperty: true },
      { name: this.billNumberCoulmnName, property: 'billNumber', visible: true, isModelProperty: true },
      { name: this.billDateCoulmnName, property: 'billDateLocal', visible: true, isModelProperty: true },
      { name: this.accountNumberColumnName, property: 'accountNumber', visible: true, isModelProperty: true },
      { name: this.ownerNameColumnName, property: 'ownerName', visible: true, isModelProperty: true },
      {
        name: this.billAmountLocalColumnName, property: 'billAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' }
      },
      {
        name: this.creditNoteAmountColumnName, property: 'creditNoteAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' }
      }
    ] as ListColumn[];
  }


  addVisibleButtons() {
    this.visibleButtons = [{ property: 'print' }] as ListColumn[];
  }


  onSearch(manageParams: ManageParams) {
    this.manageParams = manageParams;
    this.manageParams.clientId = this.clientId;
    this.creditNotes = [];
    let creditNoteAmount: number = 0;
    let billAmount: number = 0;
    this.message = '';
    this.billSettlementService.getCreditNoteDetails(manageParams).subscribe(
      creditNotes => {
        if (creditNotes && creditNotes.length) {
          this.dateFormat = getClientDataFormat('DateFormat');
          this.roundFormat = getClientDataFormat('RoundOff');
          this.currencyFormat = getClientDataFormat('Currency');
          creditNotes.forEach(element => {
            element.billAmountLocal = this.currencyPipe.transform(element.billAmount, this.currencyFormat.toString(), true, this.roundFormat);
            element.creditNoteAmountLocal = this.currencyPipe.transform(element.creditNoteAmount, this.currencyFormat.toString(), true, this.roundFormat);
            element.billDateLocal = this.datePipe.transform(element.billDate, this.dateFormat);
            element.creditNoteDateLocal = this.datePipe.transform(element.creditNoteDate, this.dateFormat);
            creditNoteAmount += Number(element.creditNoteAmount);
            billAmount += Number(element.billAmount);
          })
          creditNotes.sort((a, b) => a.creditNoteDateLocal.localeCompare(b.creditNoteDateLocal));
          this.creditNotes = creditNotes;
          this.billAmount = this.currencyPipe.transform(billAmount, this.currencyFormat.toString(), true, this.roundFormat);
          this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currencyFormat.toString(), true, this.roundFormat);
          if (manageParams.billPeriodId != '') {
            this.billPeriods.find((item) => {
              if ((item.value == manageParams.billPeriodId) && (item.value != 0)) {
                this.billPeriod = item.label
              }
            })
            if (this.billPeriod != '')
              this.billPeriod = ' for ' + this.billPeriod;
          }

          if ((manageParams.fromDate != '') && (manageParams.toDate != '')) {
            this.message = 'Period : ' + this.datePipe.transform(manageParams.fromDate, this.dateFormat) + ' to ' + this.datePipe.transform(manageParams.toDate, this.dateFormat)
          }
        }
        else {
          this.creditNotes = [];
        }
      });
  }

  toggleBillPeriodEnabled(event) {
    this.isBillPeriodEnabled = event.checked || false;
  }

  getBillPeriods() {
    this.billPeriods = [{ label: 'Select', value: 0, fromDate: '', ToDate: '' }];
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id, fromDate: x.periodStart, toDate: x.periodEnd });
      });
    });
  }

  getUtilities() {
    this.billService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        response.forEach(x => {
          this.utilityTypes.push({ label: x.description, value: x.id });
        });
      }
    });
  }



  onViewDataRow(row: CreditNote) {
    if (row) {
      let rowNumber: number = 1;
      row.transactionMode = 'View';
      row.creditNoteTransactions.forEach(element => {
        element.rowNumber = rowNumber
        element.fixedAmountLocal = this.currencyPipe.transform(element.fixedAmount, this.currencyFormat.toString(), true, this.roundFormat);
        element.creditNoteAmountLocal = this.currencyPipe.transform(element.creditNoteAmount, this.currencyFormat.toString(), true, this.roundFormat);
        rowNumber += 1;
      });
    }
    this.dialog.open(CreditNoteDetailsComponent, { data: row }).afterClosed().subscribe();
  }

  onSelectedRows(selectedRows: CreditNote[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }

  getClientImageProperties() {
    this.imageProperties = [];
    this.clientService.getClientImageProperties(this.clientId).subscribe({
      next: (imageProperties: ImageProperty[]) => {
        if (imageProperties && imageProperties.length) {
          this.imageProperties = imageProperties;
          this.downloadSummary(this.creditNotes);
        }
      },
      error() {
        this.notificationMessage("Image properties not found. To see image on print, please configure image properties ", "green-snackbar");
        this.downloadSummary(this.consolidatedData);
      }
    });
  }

  creditNoteSummaryView(creditNotes: CreditNote[]) {
    this.billSettlementService.creditNoteSummaryView(creditNotes).subscribe({
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

  creditNoteView(creditNote: CreditNote) {
    this.billSettlementService.creditNoteView(creditNote).subscribe({
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
  

  async downloadFile(data: any) {
    const mergedPdf = await PDFDocument.create();
    const pdf = await PDFDocument.load(data);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }


  onPrintSummary() {
    if (this.selectedRows && this.selectedRows.length) {
      this.creditNoteSummaryView(this.selectedRows);
    }
    else {
      this.notificationMessage('Please select Credit Notes.', 'red-snackbar');
    }
  }

  downloadSummary(creditNotes: CreditNote[]) {

    let totalBillAmount = 0;
    let totalCreditNoteAmount = 0;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Date',
      'CreditNoteNo',
      'BillNo',
      'BillDate',
      'AccountNo',
      'OwnerName',
      'BillAmount',
      'CreditNoteAmount'
    ]

    for (let a = 0; a < creditNotes.length; a++) {
      row.push(creditNotes[a].creditNoteDateLocal)
      row.push(creditNotes[a].creditNoteNumber)
      row.push(creditNotes[a].billNumber)
      row.push(creditNotes[a].billDateLocal)
      row.push(creditNotes[a].accountNumber)
      row.push(creditNotes[a].ownerName)
      row.push(creditNotes[a].billAmountLocal)
      row.push(creditNotes[a].creditNoteAmountLocal)
      firstTableRows.push(row);

      totalCreditNoteAmount += Number(creditNotes[a]?.creditNoteAmount);
      totalBillAmount += Number(creditNotes[a]?.billAmount);
      row = [];
    }

    const title = 'Consumption Alert Report';

    secondTableRows.push({ label: 'Total Amount', value0: totalBillAmount, value1: totalCreditNoteAmount });

    for (let a = 0; a < secondTableRows.length; a++) {
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push(secondTableRows[a]?.label)
      row.push(this.currency.transform(secondTableRows[a]?.value0, this.currencyFormat.toString(), true, this.roundFormat));
      row.push(this.currency.transform(secondTableRows[a]?.value1, this.currencyFormat.toString(), true, this.roundFormat));
      firstTableRows.push(row);
      row = [];
    }

    this.getSummaryReport(creditNotes, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: CreditNote[], firstTableCol: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = "1";
    var img = new Image()
    img.src = this.filePath + '/uploads/' + this.imageProperties[0]?.photo //'assets/img/' + data.client.photo
    let pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter"
    });

    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    if (img && data && this.imageProperties && this.imageProperties.length) {
      const imageProperty: ImageProperty = this.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'landscape');
      if (imageProperty) {
        img.onload = function () {
          pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
        };
        //pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
      }
    }
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(9);
    pdf.setFont("Cambria");
    // pdf.text("PO Box 127404", startX + 450, startY - 10);
    // pdf.text("Office 201, Al Zarouni Business Centre", startX + 450, startY);
    // pdf.text("Al Barsha 1, Dubai, UAE", startX + 450, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text("Phone:800 Logic (56442)", startX + 650, startY - 10);
    // pdf.text("Email: ", startX + 650, startY);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("enquiry@logicutilities.com", startX + 675, startY);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text("Web: ", startX + 650, startY + 10);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("www.logicutilities.com", startX + 675, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.setFontSize(12);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("Logic Utilities District Cooling Services LLC", startX, startY + 30);
    // pdf.text("TRN: 100567483100003", startX, startY + 50)
    pdf.setTextColor(0, 0, 0);
    pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
    pdf.setFontSize(14);
    pdf.text("Credit Note History " + this.billPeriod, pdf.internal.pageSize.width / 2 - 120, startY + 70); //pdf.internal.pageSize.width/2
    pdf.text(this.message, pdf.internal.pageSize.width / 2 - 120, startY + 90);
    pdf.setFontSize(9);

    const autoTable = 'autoTable';
    const secondTableEndY = Number(pdf[autoTable].previous.finalY);  //Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };
    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: startY + 95,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 280, left: 30 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'center'
        },
        1: {
          cellWidth: 75,
          halign: 'center'
        },
        2: {
          cellWidth: 80,
          halign: 'center'
        },
        3: {
          cellWidth: 80,
          halign: 'center'
        },
        4: {
          cellWidth: 80,
          halign: 'center'
        },
        5: {
          cellWidth: 150,
          halign: 'left'
        },
        6: {
          cellWidth: 80,
          halign: 'right'
        },
        7: {
          cellWidth: 100,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      }
    });
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  onPrintPdf() {
    if (this.selectedRows && this.selectedRows.length) {
      this.selectedRows.forEach(row => {
        this.downloadReport(row);
      })
    }
    else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  downloadReport(creditNote: CreditNote) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [
      'Services Description',
      // 'From',
      // 'To',
      // 'Previous',
      // 'Current',
      // '(KWH)',
      // 'Rate ',
      'Amount'];

    let thirdTableCol = [
      'Customer Id',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers

    let totalAmount = 0;
    let vatAmount = 0;
    for (let a = 0; a < creditNote.creditNoteTransactions.length; a++) {
      if (creditNote.creditNoteTransactions[a] && !creditNote.creditNoteTransactions[a].taxId) {
        const amount = this.currencyPipe.transform(Number(creditNote.creditNoteTransactions[a].creditNoteAmount), this.currencyFormat, true, this.roundFormat);
        row.push(creditNote.creditNoteTransactions[a].headDisplay)
        row.push(amount)
        firstTableRows.push(row);
        totalAmount += Number(creditNote.creditNoteTransactions[a].creditNoteAmount);
        row = [];
      } else {
        vatAmount += Number(creditNote.creditNoteTransactions[a].creditNoteAmount);
      }
    }

    const title = 'Credit Note';

    fourthTableRows.push(
      {
        label: 'Previous Balance:',
        value: this.currencyPipe.transform(Number(creditNote.previousDueAmount), this.currencyFormat.toString(), true, this.roundFormat)
      });


    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: creditNote.accountNumber
      },
      {
        label: 'Unit Number:',
        value: creditNote.unitNumber
      },
      {
        label: 'Billing Date:',
        value: creditNote.creditNoteDateLocal
      },
      {
        label: 'Invoice Number:',
        value: creditNote.billNumber
      },
      {
        label: 'Customer TRN:',
        value: creditNote.trn
      }
    );

    sixthTableRows.push(
      {
        label: 'Credit Note Total:',
        value: this.currencyPipe.transform(totalAmount, this.currencyFormat.toString(), true, this.roundFormat)
      },
      {
        label: 'Tax:',
        value: this.currencyPipe.transform(vatAmount, this.currencyFormat.toString(), true, this.roundFormat)
      },
      {
        label: 'Credit Note Total + Tax:',
        value: this.currencyPipe.transform(Number(creditNote.creditNoteAmount), this.currencyFormat.toString(), true, this.roundFormat)
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(Number(creditNote.previousDueAmount), this.currencyFormat.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl VAT:',
        value: this.currencyPipe.transform(Number(creditNote.previousDueAmount) - Number(creditNote.creditNoteAmount), this.currencyFormat.toString(), true, this.roundFormat)
      }
    );

    this.getReport(creditNote, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  }

  getReport(data: CreditNote, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

    const totalPagesExp = "1";
    var img = new Image()
    img.src = this.filePath + '/uploads/' + data.client.photo //'assets/img/' + data.client.photo
    var img1 = new Image()
    img1.src = 'assets/img/lu.JPG'
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    //pdf.addImage(img, 'png', 5, 5, 190, img.height);
    pdf.addImage(img1, 'png', 547, 10, 56, 56);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria");
    pdf.text("Tax Credit Note", startX + 250, startY);
    pdf.setFontSize(9);
    pdf.setTextColor(25, 118, 210);
    pdf.setFont('Cambria', 'bold');
    pdf.text(data.client.clientName, startX, startY + 30);
    pdf.setFont('Cambria', 'normal');
    pdf.text("TRN: " + data.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + data.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(data.client.addresses[0].address1 + ',' + data.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + data.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + data.client.email + ',' + ' Web: ' + data.client.website, startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 250, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(data?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + data.trn, startX + 10, startY + 125);
    pdf.text("unit #" + data.unitNumber, startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(data.client.clientName, startX + 10, startY + 155);
    pdf.text("Al Barsha 1, Dubai, UAE", startX + 10, startY + 170);
    pdf.setFontSize(9);

    pdf.setLineWidth(.1);
    pdf.line(5, startY + 235, 607, startY + 235);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Credit Note No#: ';
    pdf.setFont('bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), startX + 390, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(meterReadingTableHeading);
    let billNumber: string = '';
    if (data?.billNumber) {
      billNumber = data.creditNoteNumber?.toUpperCase();
    };
    pdf.text(billNumber, 28 + 390 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
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

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      }
      pdf.setFontSize(9);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 190,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: startY + 190, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 515,
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 75,
          fontStyle: 'bold',
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

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: secondTableEndY, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length > 2 ? 100 : 515,
          halign: 'left'
        },
        1: {
          cellWidth: firstTableCol.length > 2 ? 80 : 75,
          halign: firstTableCol.length > 2 ? 'center' : 'right',
        },
        2: {
          cellWidth: 80,
          halign: 'center'
        },
        3: {
          cellWidth: 60,
          halign: 'center'
        },
        4: {
          cellWidth: 60,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'center'
        },
        6: {
          cellWidth: 60,
          halign: 'right'
        },
        7: {
          cellWidth: 75,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      }
    });
    pdf.setTextColor(0, 0, 0);

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, thirdTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: LOGIC UTILITIES DISTRICT COOLING SERVICES L.L.C", startX, thirdTableEndY + 40);
    pdf.text("Account #: 019100074892", startX, thirdTableEndY + 50);
    pdf.text("IBAN #: AE54 0330 0000 1910 0074 892", startX, thirdTableEndY + 60);
    pdf.text("Bank Name: MASHREQ BANK - DUBAI MALL BRANCH", startX, thirdTableEndY + 70);
    pdf.text("Swift Code: BOMLAEAD", startX, thirdTableEndY + 80);
    pdf.setFontSize(9);


    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: thirdTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 310 },
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

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setTextColor(255, 0, 0);
    pdf.text("Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is 45 days or more in arrears.", startX + 310, fourthTableEndY + 10);

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, fourthTableEndY + 10);
    pdf.text("Please Try to:", startX, fourthTableEndY + 30);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, fourthTableEndY + 40);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, fourthTableEndY + 50);
    pdf.text("- Keep vents unblocked", startX + 20, fourthTableEndY + 60);
    pdf.text("- Keep doors and windows closed", startX + 20, fourthTableEndY + 70);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, fourthTableEndY + 80);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, fourthTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, fourthTableEndY + 110);
    pdf.text("- Block vents", startX + 20, fourthTableEndY + 120);
    pdf.text("- Leave doors and windows open", startX + 20, fourthTableEndY + 130);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, fourthTableEndY + 140);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, fourthTableEndY + 30, 280, pageHeight - 80 - (fourthTableEndY + 30), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, fourthTableEndY + 50);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, fourthTableEndY + 55, startX + 350 + boldTextWidth, fourthTableEndY + 55);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, fourthTableEndY + 65);
    pdf.text("800 Logic (56442)", startX + 380, fourthTableEndY + 75);
    pdf.text("enquiry@logicutilities.com", startX + 380, fourthTableEndY + 85);
    pdf.text("www.logicutilities.com", startX + 380, fourthTableEndY + 95);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text("For any enquiries, write to us enquiry@logicutilities.com \nor Logon to www.logicutilites.com", startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 330, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 330, pageHeight - 50);
    pdf.text("You can log onto www.logicutilites.com to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getJsonData() {
    this.tableData = [];
    if ((this.creditNotes != undefined) || (this.creditNotes != null)) {
      this.creditNotes.forEach((item) => {
        let element = {
          Date: this.date.transform(item.creditNoteDate, 'yyyy-MM-dd'),
          CreditNoteNumber: item.creditNoteNumber,
          BillNumber: item.billNumber,
          BillDate: this.date.transform(item.billDate, 'yyyy-MM-dd'),
          AccountNumber: item.accountNumber,
          OwnerName: item.ownerName,
          BillAmount: item.billAmountLocal,
          CreditNoteAmount: item.creditNoteAmountLocal
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    if (this.creditNotes && this.creditNotes.length > 0) {
      this.getJsonData();
      if ((this.tableData != undefined) || (this.tableData != null)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Credit Note History.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }
}
