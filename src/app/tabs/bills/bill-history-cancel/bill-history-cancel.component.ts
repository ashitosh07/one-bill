import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { Bill } from '../../shared/models/bill.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { Tenant } from '../../shared/models/tenant.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BillMaster } from '../../shared/models/bill-master.model';
import { environment } from 'src/environments/environment';
import { AccountHeadDetailsComponent } from '../final-bill-settlement/account-head-details/account-head-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from '../../shared/models/list-item.model';
import { TemplateService } from '../../shared/services/template.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TemplateContent } from '../../shared/models/template-content.model';
import * as moment from 'moment';
import { MasterService } from '../../shared/services/master.service';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { ListData } from '../../shared/models/list-data.model';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PDFDocument } from 'pdf-lib';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'app-bill-history-cancel',
  templateUrl: './bill-history-cancel.component.html',
  styleUrls: ['./bill-history-cancel.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class BillHistoryCancelComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  tenants: Tenant[] = [];
  billPeriods: any[] = [];
  billTypes: ListItem[] = [];
  selectedRows: BillMaster[] = [];
  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  billMasterDetails: BillMaster[] = [];
  manageParams: ManageParams = {};
  pdfsToMerge: any[] = [];
  clientId: number;

  billAmount = '';
  receivedAmount = '';

  billNumberConsumptionColumnName = 'Bill No';
  buildingColumnName = 'Building';
  unitNumberColumnName = 'Unit Number';

  smsColumnName = 'SMS';
  emailColumnName = 'Email';
  watsappColumnName = 'Watsapp';
  dateFormat = '';
  currency = '';
  roundFormat = '';
  consumptionRoundOffFormat = '';
  filePath = '';

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
  reasonColumnName = 'Reason';
  utilityTypeCoulmnNmae = 'Utility Type';
  meterNumberCoulmnNmae = 'Meter Number';
  previousReadingColumnName = 'Previous';
  presentReadingColumnName = 'Present';
  currentConsumptionColumnName = 'Cur-Consumption';

  @ViewChild('htmlData') htmlData: ElementRef;

  constructor(
    private billService: BillService,
    private masterService: MasterService,
    private billSettlementService: BillSettlementService,
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private dialog: MatDialog,
    private templateService: TemplateService,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private snackbar: MatSnackBar,
    private envService: EnvService) {
    this.filePath = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff') ?? envService.consumptionRoundOffFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.onGetTenants();
    this.getBillPeriods();
    this.getBillTypes();
    this.createColumnNames();
    this.createGridColumns();
    this.createInnerGridColumns();
  }

  createGridColumns() {
    this.columns = [
      'select',
      'accountNumber',
      'ownerName',
      'entityType',
      'unitNumber',
      'fromDateLocal',
      'toDateLocal',
      'dueDateLocal',
      'billAmountLocal',
      'paidLocal',
      'cancelRemarks',
      'button'
    ];
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
      { name: this.reasonColumnName, property: 'cancelRemarks' },
      { name: this.utilityTypeCoulmnNmae, property: 'utilityType' },
      { name: this.meterNumberCoulmnNmae, property: 'deviceName' },
      { name: this.previousReadingColumnName, property: 'previousReadingLocal' },
      { name: this.presentReadingColumnName, property: 'presentReadingLocal' },
      { name: this.currentConsumptionColumnName, property: 'consumptionLocal' },
      { name: this.billAmountColumnName, property: 'amountLocal', columnAlign: { 'text-align': 'right' } }] as ListColumn[];
  }

  onGetBillsHistory(manageParams: ManageParams) {
    this.manageParams = manageParams;
    this.billMasterDetails = [];
    this.billAmount = '';
    let billAmount = 0;
    this.receivedAmount = '';
    let receivedAmount = 0;

    manageParams.fromDate = manageParams.fromDate == '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate == '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');
    manageParams.clientId = this.clientId;

    this.billService.getBillCancelledHistory(manageParams).subscribe(
      billMasterDetails => {
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
            this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
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

  getBillTypes() {
    this.billTypes = [{ label: 'Select', value: 0 }];
    this.masterService.getSystemMasterdata(64, 0).subscribe(billTypes => {
      billTypes.forEach(x => {
        this.billTypes.push({ label: x.description, value: x.id });
      });
    });
  }

  onGetTenants() {
    this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
      this.tenants = data;
    });
  }


  onViewDataRow(row: BillMaster) {
    this.dialog.open(AccountHeadDetailsComponent, { data: row }).afterClosed().subscribe();
  }


  downloadReport(billMaster: BillMaster) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let firstTableCol = [
      'Meter Type',
      'Previous Reading',
      'Present Reading',
      'Measuring Unit',
      'Consumption',
      'Unit Rate',
      'Amount'];

    let thirdTableCol = [
      'Customer Id',
      'Billing Period',
      'Total for current period'
    ]; // initialization for headers

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat))
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat))
      row.push(billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat))
      row.push(billMaster.bills[a].consumptionRate)
      row.push(billMaster.bills[a].billAmountLocal)
      firstTableRows.push(row);
      row = [];
    }

    row.push(billMaster.ownerId);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Bill History';

    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        bill.billTransactions.forEach(transaction => {
          const existingitem = secondTableRows.find(x => x.label === transaction.headDisplay);
          if (existingitem) {
            existingitem.value += transaction.headAmount;
          } else {
            secondTableRows.push({ label: transaction.headDisplay, value: transaction.headAmount });
          }
        });
      }
    });

    billMaster.billCharges.forEach(billCharge => {
      const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
      if (existingitem) {
        existingitem.value += billCharge.headAmount;
      } else {
        secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
      }
    });

    let totalAmount = 0;
    secondTableRows.forEach(x => {
      totalAmount += Number(x.value)
    })
    secondTableRows.push({ label: 'Total', value: totalAmount });


    fourthTableRows.push({
      label: 'Bill No',
      value: billMaster.billNumber
    }, {
      label: 'Date of issue',
      value: billMaster.billDateLocal
    }, {
      label: 'Due Date',
      value: billMaster.dueDateLocal
    }
    );

    fifthTableRows.push(
      {
        label: 'Customer Name',
        value: billMaster.ownerName
      },
      {
        label: 'Customer Id',
        value: billMaster.ownerId
      },
      {
        label: 'Unit No',
        value: billMaster.unitNumber
      },
      {
        label: 'Address',
        value: ''
      },
      {
        label: 'City',
        value: ''
      },
      {
        label: 'P.O Box',
        value: ''
      },
      {
        label: 'Phone number',
        value: ''
      }
    );

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    this.getReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  }

  getReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

    const totalPagesExp = "1";
    var img = new Image()
    img.src = 'assets/img/logo_dark.png'
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 30;
    let startY = 30;
    pdf.setFontSize(14);
    const pdfHeadingText = 'BOULEVARD TOWER';
    pdf.text(pdfHeadingText, pdf.internal.pageSize.width / 2 - startX - 50, startY);
    const textWidth = pdf.getTextWidth(pdfHeadingText);
    pdf.setLineWidth(.1);
    pdf.line(pdf.internal.pageSize.width / 2 - startX - 50, startY + 3, pdf.internal.pageSize.width / 2 - startX - 50 + textWidth, startY + 3);
    pdf.text("Muscat Hills", pdf.internal.pageSize.width / 2 - 2 * (startX), startY + 20);
    pdf.setFontSize(10);

    pdf.setLineWidth(.1);
    pdf.line(5, startY + 25, 607, startY + 25);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 30,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
        },
        1: {
          cellWidth: 245
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

    pdf[autoTable]('', sixthTableRows, {
      startX: 10,
      startY: startY + 85,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
        },
        1: {
          cellWidth: 50
        },
        2: {
          cellWidth: 195
        },
        3: {
          cellWidth: 50
        },
        4: {
          cellWidth: 195
        }
      },
      didParseCell: function (sixthTableRows) {
        const col = sixthTableRows.column.index;
        if (col == 0 || col == 1 || col == 2 || col == 3 || col == 4) {
          sixthTableRows.cell.styles.rowHeight = 1;
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: startY + 102,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
        },
        1: {
          cellWidth: 490
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

    pdf.addImage(img, 'png', 400, 60, 120, 55);
    pdf.setLineWidth(.1);
    pdf.line(5, startY + 235, 607, startY + 235);

    const meterReadingTableHeading = 'Meter Read-Outs';

    pdf.setFont('bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), 10, startY + 260);
    pdf.setFont('none');
    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
      }
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: startY + 280,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'center'
        },
        1: {
          cellWidth: 95,
          halign: 'center'
        },
        2: {
          cellWidth: 95,
          halign: 'center'
        },
        3: {
          cellWidth: 95,
          halign: 'center'
        },
        4: {
          cellWidth: 74,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'center'
        },
        6: {
          cellWidth: 75,
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

    pdf.setLineWidth(.1);
    pdf.line(5, thirdTableEndY + 10, 607, thirdTableEndY + 10);

    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: thirdTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 490,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 100
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFillColor(255, 255, 200);
    pdf.rect(10, fourthTableEndY + 20, 590, 80, 'FD');
    pdf.setFillColor(0, 0, 0);
    pdf.text("Notes :-", startX + 20, fourthTableEndY + 30);
    pdf.text("Payment should be ade within 15 days", startX + 20, fourthTableEndY + 40);
    pdf.text("1. Cash / Cheque", startX + 20, fourthTableEndY + 50);
    pdf.text("2. Tax Registeration Number", startX + 20, fourthTableEndY + 60);
    pdf.text("3. Minimum charges payable", startX + 20, fourthTableEndY + 70);
    pdf.text(`4. Late fee of ${this.currency} 50 /- will be levied, if payments are made by the due date`, startX + 20, fourthTableEndY + 80);
    pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 20, fourthTableEndY + 90);

    pdf.setTextColor(0, 0, 0);
    pdf.line(5, fourthTableEndY + 110, 607, fourthTableEndY + 110);

    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX + 20, fourthTableEndY + 130);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: fourthTableEndY + 150,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 80, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'center'
        },
        1: {
          cellWidth: 340,
          halign: 'center'
        },
        2: {
          cellWidth: 150,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      }
    });

    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var blob = pdf.output("blob");
    window.open(URL.createObjectURL(blob));
  }


  onSendEmail() {
    if (this.selectedRows) {
      const templateContent: TemplateContent = {
        notificationType: 'EMAIL',
        templateType: 'Invoice',
        templateName: 'Custom',
        billMasterDetails: this.selectedRows
      };
      this.templateService.emailInvoiceTemplate(templateContent).subscribe({
        next: response => {
        },
        error: (err) => {
        }
      }
      );
    }
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

  async onPrintPdf() {
    if (this.selectedRows && this.selectedRows.length) {
      this.invoiceView(this.selectedRows);
    }
    else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  downloadBillFormat1LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];


    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit Number:');
        fifthTableRows.splice(itemIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        sixthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }
    sixthTableRows.push(
      {
        label: 'Current Month Total Consumption Charge:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        sixthTableRows.push(
          {
            label: billTaxDetail.taxDisplayName,
            value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
          });
      });
    } else {
      sixthTableRows.push(
        {
          label: 'TAX:',
          value: this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat)
        });
    }

    sixthTableRows.push(
      {
        label: 'Current Month + TAX:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl TAX:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );


    let ninthTableCol = [];
    let isSlabTariff = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getNewBillFormat1LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat1LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf = this.addImage(pdf, billMaster);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("Cambria", 'bold');
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(13);
    pdf.setFont('Cambria', 'normal');
    pdf.text(billMaster.client.clientName.toUpperCase(), startX, startY + 30);
    pdf.setFontSize(10);
    pdf.setFont('Cambria');
    pdf.text("TRN: " + billMaster.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + billMaster.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(billMaster.client.addresses[0].address1 + ',' + billMaster.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + billMaster.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + billMaster.client.email + ',' + ' Web: ' + billMaster.client.website, startX, startY + 80);
    pdf.setFontSize(10);
    const invoiceHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(invoiceHeading.toUpperCase(), startX + 360, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(invoiceHeading);
    let billNumber: string = '';
    if (billMaster?.billNumber) {
      billNumber = billMaster.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 360 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);

    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 360 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 150,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = fifthTableRows.length === 6 ? 1.8 : 2.7;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 5, 607, firstTableEndY + 5);
    pdf.setFont("Cambria");
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 340, firstTableEndY - (startY + 90), 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(billMaster?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + billMaster.trn, startX + 10, startY + 120);
    pdf.text("unit #" + billMaster.unitNumber, startX + 10, startY + 135);
    pdf.setFontSize(10);
    pdf.text(stringIsNullOrEmpty(billMaster?.clientName, ''), startX + 10, startY + 150);
    pdf.text(stringIsNullOrEmpty(billMaster?.client?.buildingName, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.country, ','), startX + 10, startY + 165);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, firstTableEndY + 20);

    var pageContent = function (data) {
      // HEADER

      // FOOTER
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: firstTableEndY + 35,
      showHead: "everyPage",
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    if (seventhTableRows && seventhTableRows.length) {

      const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, secondTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: secondTableEndY + 30,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length == 6 ? 80 : 200,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length == 6 ? 180 : 100,
            halign: 'center'
          },
          2: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          3: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          4: {
            cellWidth: seventhTableCol.length == 6 ? 75 : 90,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }

    let ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let pageHeight = pdf.internal.pageSize.height;
    let fourthTableEndY = ThirdTableEndY;

    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 250,
            halign: 'center'
          },
          1: {
            cellWidth: 120,
            halign: 'center'
          },
          2: {
            cellWidth: 120,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 140,
            halign: 'center'
          },
          1: {
            cellWidth: 100,
            halign: 'center'
          },
          2: {
            cellWidth: 100,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'center'
          },
          4: {
            cellWidth: 75,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    if (pageHeight - fourthTableEndY < 200) {
      pdf.addPage();
      pdf.setTextColor(25, 118, 210);
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      fourthTableEndY = 10;
    }

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, fourthTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountName), startX, fourthTableEndY + 40);
    pdf.text("Account #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountNo), startX, fourthTableEndY + 50);
    pdf.text("IBAN #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.ibanNumber), startX, fourthTableEndY + 60);
    pdf.text("Bank Name: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.bankName), startX, fourthTableEndY + 70);
    pdf.text("Swift Code: " + + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.swiftCode), startX, fourthTableEndY + 80);
    pdf.setFontSize(9);

    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: fourthTableEndY + 20,
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
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1.8;
      }
    });


    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (fifthTableEndY > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 400;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: startX,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }


  downloadBillFormat3LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ];

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + stringIsNullOrEmpty(billMaster.billNumber)
    }, {
      label: 'Date of issue',
      value: spliter + stringIsNullOrEmpty(billMaster.billDateLocal)
    }, {
      label: 'Due Date',
      value: spliter + stringIsNullOrEmpty(billMaster.dueDateLocal)
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + `From: ${stringIsNullOrEmpty(billMaster.fromDateLocal)} To: ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      },
      {
        label: 'Customer Account',
        value: spliter + stringIsNullOrEmpty(billMaster.accountNumber)
      },
      {
        label: 'Customer Name',
        value: spliter + stringIsNullOrEmpty(billMaster.ownerName)
      },
      {
        label: 'Address',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.address1)
      },
      {
        label: 'City',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city)
      },
      {
        label: 'P.O Box',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.zipPostalCode)
      },
      {
        label: 'Phone number',
        value: spliter + stringIsNullOrEmpty(billMaster?.receiverDetails[0]?.phoneNumber)
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.clientName)
      },
      {
        label: 'Client TRN',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.trnNo)
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    let ninthTableCol = [];
    let isSlabTariff = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    let otherCharges: ListItem[] = [];

    billMaster.bills.forEach(bill => {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (bill.billTransactions && bill.billTransactions.length) {
        const restrictArray: string[] = ['consumption', 'consumptioncharge'];
        bill.billTransactions.forEach(transaction => {
          if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
            const existingitem = otherCharges.find(x => x.label === transaction.headDisplay);
            if (existingitem) {
              existingitem.value += transaction.headAmount;
            } else {
              otherCharges.push({ label: transaction.headDisplay, value: transaction.headAmount });
            }
          }
        });
      }
    });

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });
    }

    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      totalAmount += Number(x.value)
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
        totalAmount += Number(billTaxDetail.taxAmount)
      });
    }

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    });

    this.getNewBillFormat3LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat3LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 380,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1.5;
      }
    });


    var pageContent = function (data) {
      // HEADER

      // FOOTER
    };


    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, secondTableEndY + 15);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, ThirdTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: ThirdTableEndY + 30,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length === 6 ? 80 : 200,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length === 6 ? 180 : 100,
            halign: 'center'
          },
          2: {
            cellWidth: seventhTableCol.length === 6 ? 90 : 100,
            halign: 'center'
          },
          3: {
            cellWidth: seventhTableCol.length === 6 ? 90 : 100,
            halign: 'center'
          },
          4: {
            cellWidth: seventhTableCol.length === 6 ? 75 : 90,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }

    let pageHeight = pdf.internal.pageSize.height;
    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let fifthTableEndY = fourthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 250,
            halign: 'center'
          },
          1: {
            cellWidth: 120,
            halign: 'center'
          },
          2: {
            cellWidth: 120,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 140,
            halign: 'center'
          },
          1: {
            cellWidth: 100,
            halign: 'center'
          },
          2: {
            cellWidth: 100,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'center'
          },
          4: {
            cellWidth: 75,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    if (pageHeight - fifthTableEndY < 200) {
      pdf.addPage();
      pdf.setTextColor(25, 118, 210);
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      fifthTableEndY = 10;
    }

    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: fifthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.line(5, sixthTableEndY + 10, 607, sixthTableEndY + 10);

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.line(5, seventhTableEndY + 10, 607, seventhTableEndY + 10);

    pageHeight = pdf.internal.pageSize.height;

    if (seventhTableEndY > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 400;
    }

    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(10, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 20, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  downloadBillFormat2Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Cancelled Bill Report';

    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        eighthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }

    const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    eighthTableRows.push(
      {
        label: 'Total consumption charge for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    billMaster.billTaxDetails.forEach(billTaxDetail => {
      const existingitem = eighthTableRows.find(x => x.label === billTaxDetail.taxDisplayName);
      if (existingitem) {
        const amount = Number(existingitem.value.replace(this.currency, '').trim()) + Number(billTaxDetail.taxAmount);
        existingitem.value = this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat);
      } else {
        eighthTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      }
    });

    eighthTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Amount Due',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );


    fourthTableRows.push({
      label: 'Bill No',
      value: billMaster?.billNumber ?? ''
    }, {
      label: 'Date of issue',
      value: billMaster?.billDateLocal ?? ''
    }, {
      label: 'Due Date',
      value: billMaster?.dueDateLocal ?? ''
    }
    );

    fifthTableRows.push(
      {
        label: 'Customer Name',
        value: billMaster?.ownerName ?? ''
      },
      {
        label: 'Customer AccountNumber',
        value: billMaster?.accountNumber ?? ''
      },
      {
        label: 'Unit No',
        value: billMaster?.unitNumber ?? ''
      },
      {
        label: 'Address',
        value: billMaster?.receiverDetails[0]?.address1 ?? ''
      },
      {
        label: 'City',
        value: billMaster?.receiverDetails[0]?.city ?? ''
      },
      {
        label: 'P.O Box',
        value: billMaster?.receiverDetails[0]?.zipPostalCode ?? ''
      },
      {
        label: 'Phone number',
        value: billMaster?.receiverDetails[0]?.phoneNumber ?? ''
      },
      {
        label: 'Fax Number',
        value: ''
      },
      {
        label: 'Client',
        value: billMaster?.client?.clientName ?? ''
      },
      {
        label: 'Client TRN',
        value: billMaster?.client?.trnNo ?? ''
      }
    );

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    let ninthTableCol = [];
    let isSlabTariff = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getBillFormat2Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 10/09/2021
  getBillFormat2Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    let startX = 30;
    let startY = 15;
    const pdfHeadingText = billMaster?.client?.clientName ?? '';
    const textWidth = pdf.getTextWidth(pdfHeadingText.trim());
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(17);
    pdf.setFont("Cambria");
    pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
    pdf.setFontSize(13);
    // let address: string = '';
    // if (billMaster && billMaster.client && billMaster.client.addresses[0]) {
    //   address = billMaster.client.addresses[0].address1?.toLowerCase() ?? '' + ',' + billMaster.client.addresses[0].city?.toLowerCase() ?? '';
    //   if (address.trim() == ',') {
    //     address = '';
    //   }
    // }
    // pdf.text(address, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + 5, startY + 15);
    pdf.setLineWidth(.1);
    pdf.setFontSize(14);
    pdf.text("Billing Statement", startX, startY + 26);

    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 35,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', sixthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left',
        },
        1: {
          cellWidth: 95,
          halign: 'center'
        },
        2: {
          cellWidth: 95,
          halign: 'center'
        },
        3: {
          cellWidth: 97,
          halign: 'center'
        },
        4: {
          cellWidth: 97,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: secondTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 384,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, thirdTableEndY + 15);


    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: thirdTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 182 : 150),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 95 : (firstTableCol.length == 4 ? 142 : 120),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        4: {
          cellWidth: 74,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, fourthTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: fourthTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length == 6 ? 80 : 215,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length == 6 ? 145 : 85,
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 75,
            halign: 'center'
          },
          4: {
            cellWidth: 74,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let sixthTableEndY = fifthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 200,
            halign: 'center'
          },
          1: {
            cellWidth: 117,
            halign: 'center'
          },
          2: {
            cellWidth: 117,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 130,
            halign: 'center'
          },
          1: {
            cellWidth: 85,
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 85,
            halign: 'center'
          },
          4: {
            cellWidth: 74,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 230 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 235,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 100
        }
      },
      didParseCell: function (eighthTableRows) {
        const col = eighthTableRows.column.index;
        if (col == 1) {
          eighthTableRows.cell.styles.halign = 'right';
        }
        eighthTableRows.cell.styles.cellPadding = 1;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, seventhTableEndY + 20, 535, 80, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      // pdf.text("Notes :-", startX + 30, sixthTableEndY + 30);
      // pdf.text("Payment should be made within 30 days of devitnote to avoid disconnection.", startX + 30, sixthTableEndY + 40);
      // pdf.text("1. Cash / Cheque in favour of " + billMaster.client.clientName, startX + 30, sixthTableEndY + 50);
      // pdf.text("2. Tax Registeration Number : " + billMaster.client.trnNo, startX + 30, sixthTableEndY + 60);
      // pdf.text("3. Minimum charges payable :", startX + 30, sixthTableEndY + 70);
      // pdf.text(`4. Late fee of ${this.currency} 50 / - will be levied, if payments are made by the due date`, startX + 30, sixthTableEndY + 80);
      // pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 30, sixthTableEndY + 90);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, seventhTableEndY + 30);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, seventhTableEndY + 110, 607, seventhTableEndY + 110);

    const pageHeight = pdf.internal.pageSize.height;
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 90);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 80,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 120,
          halign: 'center'
        },
        1: {
          cellWidth: 200,
          halign: 'center'
        },
        2: {
          cellWidth: 100,
          halign: 'right'
        },
        3: {
          cellWidth: 120,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });
    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  downloadBillFormat1Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });


    fifthTableRows.push(
      {
        label: 'Account Number:',
        value: billMaster.accountNumber
      },
      {
        label: 'Meter Number:',
        value: meterNumber.slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: billMaster.unitNumber
      },
      {
        label: 'Billing Date:',
        value: billMaster.billDateLocal
      },
      {
        label: 'Due Date:',
        value: billMaster.dueDateLocal
      },
      {
        label: 'Bill Period',
        value: `${stringIsNullOrEmpty(billMaster.fromDateLocal)} - ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        firstTableCol.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit Number:');
        fifthTableRows.splice(itemIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        sixthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      })
    }
    sixthTableRows.push(
      {
        label: 'Current Month Total Consumption Charge:',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        sixthTableRows.push(
          {
            label: billTaxDetail.taxDisplayName,
            value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat)
          });
      });
    } else {
      sixthTableRows.push(
        {
          label: 'TAX:',
          value: this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat)
        });
    }

    sixthTableRows.push(
      {
        label: 'Current Month + TAX:',
        value: billMaster.billAmountLocal
      },
      {
        label: 'Previous Bill Outstanding Balance:',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Due incl TAX:',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );


    let ninthTableCol = [];
    let isSlabTariff = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }
    this.getNewBillFormat1Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat1Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf = this.addImage(pdf, billMaster);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("Cambria", 'bold');
    pdf.text("Tax Invoice", startX + 250, startY);
    pdf.setFontSize(13);
    pdf.setFont('Cambria', 'normal');
    pdf.text(billMaster.client.clientName.toUpperCase(), startX, startY + 30);
    pdf.setFontSize(10);
    pdf.setFont('Cambria');
    pdf.text("TRN: " + billMaster.client.trnNo, startX, startY + 40);
    pdf.text("PO Box " + billMaster.client.addresses[0].zipPostalCode, startX, startY + 50);
    pdf.text(billMaster.client.addresses[0].address1 + ',' + billMaster.client.addresses[0].country, startX, startY + 60);
    pdf.text("Phone: " + billMaster.client.phoneNo, startX, startY + 70);
    pdf.text("Email: " + billMaster.client.email + ',' + ' Web: ' + billMaster.client.website, startX, startY + 80);
    pdf.setFontSize(10);
    const invoiceHeading = 'Invoice#: ';
    pdf.setFont('bold');
    pdf.text(invoiceHeading.toUpperCase(), startX + 360, startY + 80);
    pdf.setTextColor(25, 118, 210);
    const tableHeadingWidth = pdf.getTextWidth(invoiceHeading);
    let billNumber: string = '';
    if (billMaster?.billNumber) {
      billNumber = billMaster.billNumber?.toUpperCase();
    };
    pdf.text(billNumber, 20 + 360 + tableHeadingWidth, startY + 80);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);


    const autoTable = 'autoTable';
    pdf[autoTable]('', fifthTableRows, {
      startY: startY + 90,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 360 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 150,
          halign: 'right'
        }
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = fifthTableRows.length === 6 ? 1.8 : 2.7;
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


    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 5, 607, firstTableEndY + 5);
    pdf.setFont("Cambria");
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 340, firstTableEndY - (startY + 90), 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(billMaster?.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: " + billMaster.trn, startX + 10, startY + 120);
    pdf.text("unit #" + billMaster.unitNumber, startX + 10, startY + 135);
    pdf.setFontSize(10);
    pdf.text(billMaster.clientName, startX + 10, startY + 150);
    pdf.text(stringIsNullOrEmpty(billMaster?.client?.buildingName, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.country, ','), startX + 10, startY + 165);
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, firstTableEndY + 20);

    var pageContent = function (data) {
      // HEADER

      // FOOTER
      var str = "Page " + data.pageCount;
      pdf.setFontSize(10);
      var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
    };

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: startX,
      startY: firstTableEndY + 35,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 135 : 125),
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    if (seventhTableRows && seventhTableRows.length) {

      const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, secondTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: startX,
        startY: secondTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length == 6 ? 80 : 200,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length == 6 ? 180 : 100,
            halign: 'center'
          },
          2: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          3: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          4: {
            cellWidth: seventhTableCol.length == 6 ? 75 : 90,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });

    }

    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    let fourthTableEndY = ThirdTableEndY;

    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 250,
            halign: 'center'
          },
          1: {
            cellWidth: 120,
            halign: 'center'
          },
          2: {
            cellWidth: 120,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: startX,
        startY: ThirdTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 140,
            halign: 'center'
          },
          1: {
            cellWidth: 100,
            halign: 'center'
          },
          2: {
            cellWidth: 100,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'center'
          },
          4: {
            cellWidth: 75,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Bank Payment Account Details", startX, fourthTableEndY + 20);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Account Title: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountName), startX, fourthTableEndY + 40);
    pdf.text("Account #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.accountNo), startX, fourthTableEndY + 50);
    pdf.text("IBAN #: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.ibanNumber), startX, fourthTableEndY + 60);
    pdf.text("Bank Name: " + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.bankName), startX, fourthTableEndY + 70);
    pdf.text("Swift Code: " + + stringIsNullOrEmpty(billMaster?.client?.bankDetails[0]?.swiftCode), startX, fourthTableEndY + 80);
    pdf.setFontSize(9);


    pdf[autoTable]('', sixthTableRows, {
      startX: 300,
      startY: fourthTableEndY + 20,
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
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1.8;
      }
    });


    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let pageHeight = pdf.internal.pageSize.height;

    if (fifthTableEndY > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      var str = "Page " + pdf.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.text(str, 10, pageHeight - 10); // showing current page number
      pageHeight = 230;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: startX,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  downloadBillFormat3Report(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    const spliter: string = ': ';
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: ListData[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ];

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push({
      label: 'Bill No',
      value: spliter + stringIsNullOrEmpty(billMaster.billNumber)
    }, {
      label: 'Date of issue',
      value: spliter + stringIsNullOrEmpty(billMaster.billDateLocal)
    }, {
      label: 'Due Date',
      value: spliter + stringIsNullOrEmpty(billMaster.dueDateLocal)
    }
    );

    fifthTableRows.push(
      {
        label: 'Billing period',
        value: spliter + `From: ${stringIsNullOrEmpty(billMaster.fromDateLocal)} To: ${stringIsNullOrEmpty(billMaster.toDateLocal)} `
      },
      {
        label: 'Customer Account',
        value: spliter + stringIsNullOrEmpty(billMaster.accountNumber)
      },
      {
        label: 'Customer Name',
        value: spliter + stringIsNullOrEmpty(billMaster.ownerName)
      },
      {
        label: 'Unit No',
        value: spliter + stringIsNullOrEmpty(billMaster.unitNumber)
      },
      {
        label: 'Address',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.address1)
      },
      {
        label: 'City',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.city)
      },
      {
        label: 'P.O Box',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.addresses[0]?.zipPostalCode)
      },
      {
        label: 'Phone number',
        value: spliter + stringIsNullOrEmpty(billMaster?.receiverDetails[0]?.phoneNumber)
      },
      {
        label: 'Fax Number',
        value: spliter
      },
      {
        label: 'Client',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.clientName)
      },
      {
        label: 'Client TRN',
        value: spliter + stringIsNullOrEmpty(billMaster?.client?.trnNo)
      });

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }

      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      const bill = billMaster.bills[a];
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title: string = 'Invoice';

    let meterNumber = '';
    billMaster.bills.forEach(x => {
      meterNumber += x.deviceName + ','
    });

    let ninthTableCol = [];
    let isSlabTariff = false;
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount,this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    let otherCharges: ListItem[] = [];

    billMaster.bills.forEach(bill => {
      if (bill.billTransactions && bill.billTransactions.length) {
        const restrictArray: string[] = ['consumption', 'consumptioncharge'];
        bill.billTransactions.forEach(transaction => {
          if (!restrictArray.includes(transaction.headDisplay.toLowerCase())) {
            const existingitem = otherCharges.find(x => x.label === transaction.headDisplay);
            if (existingitem) {
              existingitem.value += transaction.headAmount;
            } else {
              otherCharges.push({ label: transaction.headDisplay, value: transaction.headAmount });
            }
          }
        });
      }
    });
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = otherCharges.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            otherCharges.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });
    }
    otherCharges.forEach(x => {
      secondTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
      totalAmount += Number(x.value)
    });

    if (billMaster.billTaxDetails && billMaster.billTaxDetails.length) {
      billMaster.billTaxDetails.forEach(billTaxDetail => {
        secondTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
        totalAmount += Number(billTaxDetail.taxAmount)
      });
    }

    eighthTableRows.push({
      label: 'Total for Current Period',
      value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
    })

    this.getNewBillFormat3Report(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  addImage(pdf: jsPDF, data: BillMaster) {
    try {
      if (data && data.client && data.client.imageProperties && data.client.imageProperties.length) {
        const imageProperty: ImageProperty = data.client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + data?.client?.photo; //'assets/img/' + data.client.photo
          img.onload = function () {
            pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
          };
          //pdf.addImage(img, imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
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



  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  // New Bill Print Format added 27/05/2021
  getNewBillFormat3Report(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("Cambria");
    pdf.text("Billing Statement".toUpperCase(), 10, startY + 5);
    this.addImage(pdf, billMaster);
    pdf.setLineWidth(.1);
    const autoTable = 'autoTable';
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1.5;
      }
    });

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 15 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 100,
          halign: 'left'
        },
        1: {
          cellWidth: 380,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1.5;
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


    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, secondTableEndY + 15);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: secondTableEndY + 30,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 180, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 120 : (firstTableCol.length == 4 ? 200 : 155),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 100 : firstTableCol.length == 4 ? 135 : 125,
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 6 ? 100 : firstTableCol.length == 4 ? 135 : 125,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 120 : 100,
          halign: 'center'
        },
        4: {
          cellWidth: 85,
          halign: 'center'
        },
        5: {
          cellWidth: 85,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });


    const ThirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, ThirdTableEndY + 15);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: ThirdTableEndY + 30,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length == 6 ? 80 : 200,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length == 6 ? 180 : 100,
            halign: 'center'
          },
          2: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          3: {
            cellWidth: seventhTableCol.length == 6 ? 90 : 100,
            halign: 'center'
          },
          4: {
            cellWidth: seventhTableCol.length == 6 ? 75 : 90,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let fifthTableEndY = fourthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 250,
            halign: 'center'
          },
          1: {
            cellWidth: 120,
            halign: 'center'
          },
          2: {
            cellWidth: 120,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fourthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 10 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 140,
            halign: 'center'
          },
          1: {
            cellWidth: 100,
            halign: 'center'
          },
          2: {
            cellWidth: 100,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'center'
          },
          4: {
            cellWidth: 75,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });

      fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }
    pdf[autoTable]('', secondTableRows, {
      startX: 10,
      startY: fifthTableEndY + 10,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.line(5, sixthTableEndY + 10, 607, sixthTableEndY + 10);

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'plain',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 250,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 90
        }
      },
      didParseCell: function (secondTableRows) {
        const col = secondTableRows.column.index;
        if (col == 1) {
          secondTableRows.cell.styles.halign = 'right';
        }
        secondTableRows.cell.styles.cellPadding = 1.5;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    const seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    pdf.line(5, seventhTableEndY + 10, 607, seventhTableEndY + 10);

    let pageHeight = pdf.internal.pageSize.height;

    if (secondTableEndY > pageHeight - 190) {
      pdf.addPage();
      pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
      pageHeight = 400;
    }
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(10, pageHeight - 190, 590, 90, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 20, pageHeight - 175);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, pageHeight - 95, 607, pageHeight - 95);
    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);

    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 65,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'center'
        },
        1: {
          cellWidth: 210,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'right'
        },
        3: {
          cellWidth: 140,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });
    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  downloadBillFormat2LargeReport(billMaster: BillMaster) {
    const conversionValueTRHR: number = 0.284345;
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListItem[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: any[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: any[] = [];
    let seventhTableRows: any[] = [];
    let eighthTableRows: any[] = [];
    let ninthTableRows: any[] = [];
    let firstTableCol = [
      'Unit No',
      'Meter No',
      'Previous Reading',
      'Present Reading',
      'Consumption'];

    let thirdTableCol = [
      'Customer AccountNumber',
      'Billing Period',
      'Previous Due',
      'Total for current period'
    ]; // initialization for headers

    let seventhTableCol = [
      'Bill No',
      'Charges',
      'Consumption',
      'Measuring Unit',
      'Tariff',
      'Total'];

    fourthTableRows.push(
      {
        label: 'Bill No',
        value: billMaster?.billNumber ?? ''
      },
      {
        label: 'Date of issue',
        value: billMaster?.billDateLocal ?? ''
      },
      {
        label: 'Due Date',
        value: billMaster?.dueDateLocal ?? ''
      }
    );

    fifthTableRows.push(
      {
        label: 'Customer Name',
        value: billMaster?.ownerName ?? ''
      },
      {
        label: 'Customer AccountNumber',
        value: billMaster?.accountNumber ?? ''
      },
      {
        label: 'Unit No',
        value: billMaster?.unitNumber ?? ''
      },
      {
        label: 'Address',
        value: billMaster?.receiverDetails[0]?.address1 ?? ''
      },
      {
        label: 'City',
        value: billMaster?.receiverDetails[0]?.city ?? ''
      },
      {
        label: 'P.O Box',
        value: billMaster?.receiverDetails[0]?.zipPostalCode ?? ''
      },
      {
        label: 'Phone number',
        value: billMaster?.receiverDetails[0]?.phoneNumber ?? ''
      },
      {
        label: 'Fax Number',
        value: ''
      },
      {
        label: 'Client',
        value: billMaster?.client?.clientName ?? ''
      },
      {
        label: 'Client TRN',
        value: billMaster?.client?.trnNo ?? ''
      }
    );

    let isMultipleBillNumber = false;
    let isMultipleUnitNumber = false;

    if (billMaster && billMaster.bills && billMaster.bills.length) {
      const uniqueBillNumber = Array.from(new Set(billMaster.bills.map(x => x.billNumber)));
      const uniqueUnitNumber = Array.from(new Set(billMaster.bills.map(x => x.unitNumber)));
      isMultipleBillNumber = uniqueBillNumber && uniqueBillNumber.length > 1 ? true : false;
      isMultipleUnitNumber = uniqueUnitNumber && uniqueUnitNumber.length > 1 ? true : false;
      if (!isMultipleBillNumber) {
        seventhTableCol.splice(0, 1);
      } else {
        fourthTableRows.splice(0, 1);
      }
      if (!isMultipleUnitNumber) {
        firstTableCol.splice(0, 1);
      } else {
        const itemIndex = fifthTableRows.findIndex(x => x.label === 'Unit No');
        fifthTableRows.splice(itemIndex, 1);
      }
    }

    for (let a = 0; a < billMaster.bills.length; a++) {
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      if (isMultipleUnitNumber) {
        row.push(billMaster.bills[a].unitNumber)
      }
      row.push(billMaster.bills[a].deviceName)
      row.push(this.decimalPipe.transform(billMaster.bills[a].previousReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      row.push(this.decimalPipe.transform(billMaster.bills[a].presentReading, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      if (billMaster.bills[a].isDifferentiateBill) {
        const previousReading: number = billMaster.bills[a].previousReading;
        const presentReading: number = billMaster.bills[a].presentReading;
        const consumption: number = presentReading - previousReading;
        row.push(this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      } else {
        row.push(this.decimalPipe.transform(billMaster.bills[a].consumption, this.consumptionRoundOffFormat) + ' ' + billMaster.bills[a].measuringUnit)
      }
      if (billMaster.bills[a].utilityType === 'BTU' && billMaster.bills[a].billTransactions && billMaster.bills[a].billTransactions.length && billMaster.bills[a].billTransactions.findIndex(x => x.measuringUnitId && x.measuringUnitId === 2) > -1) {
        if (a == 0) {
          firstTableCol.push('Consumption TR-HR');
        }
        const consumptionTRHR: number = billMaster.bills[a].consumption * conversionValueTRHR;
        row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
      }
      firstTableRows.push(row);
      row = [];
    }

    let totalAmount = 0;
    for (let a = 0; a < billMaster.bills.length; a++) {
      const bill = billMaster.bills[a];
      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', billMaster.bills[a].utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
      for (let b = 0; b < bill.billTransactions.length; b++) {
        if (isMultipleBillNumber) {
          row.push(bill.billNumber);
        }
        row.push(bill.billTransactions[b].headDisplay)
        if (bill.utilityType === "BTU" && bill.billTransactions && bill.billTransactions.length && bill.billTransactions[b] && bill.billTransactions[b].measuringUnitId && bill.billTransactions[b].measuringUnitId === 2) {
          const consumptionTRHR: number = bill.consumption * conversionValueTRHR;
          row.push(this.decimalPipe.transform(consumptionTRHR, this.consumptionRoundOffFormat))
          row.push('TR-HR')
          row.push(bill.billTransactions[b].rate)
        } else {
          row.push(this.decimalPipe.transform(bill.consumption, this.consumptionRoundOffFormat))
          row.push(bill.measuringUnit)
          row.push(bill.billTransactions[b].rate)
        }
        row.push(this.currencyPipe.transform(bill.billTransactions[b].headAmount, this.currency.toString(), true, this.roundFormat))
        seventhTableRows.push(row);
        row = [];
        totalAmount += bill.billTransactions[b].headAmount;
      }
    }

    row.push(billMaster.accountNumber);
    row.push(billMaster.fromDateLocal + '-' + billMaster.toDateLocal);
    row.push(this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat));
    row.push(billMaster.billAmountLocal);
    thirdTableRows.push(row);

    const title = 'Sample Report';
    if (billMaster.billCharges && billMaster.billCharges.length) {
      billMaster.billCharges.sort((a, b) => a.position - b.position).forEach(billCharge => {
        if (billCharge.headDisplay !== 'VAT') {
          const existingitem = secondTableRows.find(x => x.label === billCharge.headDisplay);
          if (existingitem) {
            existingitem.value += billCharge.headAmount;
          } else {
            secondTableRows.push({ label: billCharge.headDisplay, value: billCharge.headAmount });
          }
        }
      });

      secondTableRows.forEach(x => {
        eighthTableRows.push({ label: x.label, value: this.currencyPipe.transform(x.value, this.currency.toString(), true, this.roundFormat) });
        totalAmount += x.value
      })
    }
    //const vatItem = billMaster.billCharges.find(billCharge => billCharge.headDisplay === 'VAT');

    eighthTableRows.push(
      {
        label: 'Total Charges for Current Period',
        value: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat)
      });

    billMaster.billTaxDetails.forEach(billTaxDetail => {
      const existingitem = eighthTableRows.find(x => x.label === billTaxDetail.taxDisplayName);
      if (existingitem) {
        const amount = Number(existingitem.value.replace(this.currency, '').trim()) + Number(billTaxDetail.taxAmount);
        existingitem.value = this.currencyPipe.transform(amount, this.currency.toString(), true, this.roundFormat);
      } else {
        eighthTableRows.push({ label: billTaxDetail.taxDisplayName, value: this.currencyPipe.transform(billTaxDetail.taxAmount, this.currency.toString(), true, this.roundFormat) });
      }
    });

    eighthTableRows.push(
      {
        label: 'Previous Outstanding Amount',
        value: this.currencyPipe.transform(billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Total Amount Due',
        value: this.currencyPipe.transform(billMaster.billAmount + billMaster.previousDueAmount, this.currency.toString(), true, this.roundFormat)
      }
    );

    sixthTableRows.push({
      firstItem: 'Billing period',
      secondItem: 'From:',
      thirdItem: billMaster.fromDateLocal,
      fourthItem: 'To:',
      fifthItem: billMaster.toDateLocal
    });

    let ninthTableCol = [];
    let isSlabTariff: boolean = false;
    let unitMeterNumbers: string[] = [];
    row = [];
    if (billMaster && billMaster.bills && billMaster.bills.length) {
      billMaster.bills.forEach(bill => {
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', bill.utilityTypeId) ?? this.envService.consumptionRoundOffFormat;
        unitMeterNumbers = [];
        let unitMeterNumber: string = 'Unit Number : ' + bill.unitNumber + ' - Meter Number : ' + bill.deviceName;
        if (bill.billTariffDetails && bill.billTariffDetails.length) {
          for (let b = 0; b < bill.billTariffDetails.length; b++) {
            if (bill.billTariffDetails[b].slabSettingsId && bill.billTariffDetails[b].slabSettingsId > 0) {
              let season: string = bill.billTariffDetails[b].season;
              if (Number(bill.billTariffDetails[b].peakType) < Number(bill.billTariffDetails[b].consumption)) {
                const consumptionMax = bill.billTariffDetails[b].consumption;
                const consumptionMin = bill.billTariffDetails[b].peakType;
                season = consumptionMin + ' - ' + consumptionMax;
              }
              if (b == 0) {
                isSlabTariff = true;
                ninthTableCol = [
                  'Slab',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              if (unitMeterNumbers && unitMeterNumbers.length) {
                const itemExists = unitMeterNumbers.find(x => x === unitMeterNumber);
                if (!itemExists) {
                  this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
                }
              } else {
                unitMeterNumbers.push(unitMeterNumber);
                this.createUnitMeterNumberRow(unitMeterNumber, ninthTableCol.length, ninthTableRows);
              }

              row.push(season);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(),true,this.roundFormat));
            } else if (bill.billTariffDetails[b].slabSettingsId == 0) {
              if (b == 0) {
                ninthTableCol = [
                  'Season',
                  'Week Type',
                  'Peak Type',
                  'Consumption',
                  'Rate',
                  'Amount'];
              }
              row.push(bill.billTariffDetails[b].season);
              row.push(bill.billTariffDetails[b].weekType);
              row.push(bill.billTariffDetails[b].peakType);
              row.push(this.decimalPipe.transform(bill.billTariffDetails[b].consumption,this.consumptionRoundOffFormat));
              row.push(bill.billTariffDetails[b].rate);
              row.push(this.currencyPipe.transform(bill.billTariffDetails[b].amount, this.currency.toString(),true,this.roundFormat));
            }
            ninthTableRows.push(row);
            row = [];
          };
        }
      });
    }

    this.getBillFormat2LargeReport(firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title, seventhTableCol, seventhTableRows, billMaster, eighthTableRows, ninthTableCol, ninthTableRows, isSlabTariff);
  }

  getBillFormat2LargeReport(firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string, seventhTableCol: any[], seventhTableRows: any[], billMaster: BillMaster, eighthTableRows: any[], ninthTableCol: any[], ninthTableRows: any[], isSlabTariff: boolean = false) {


    var img = new Image()
    img.src = this.filePath + '/uploads/' + billMaster?.client?.photo //'assets/img/' + data.client.photo

    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    let startX = 35;
    let startY = 20;
    const autoTable = 'autoTable';

    const pdfHeadingText = billMaster?.client?.clientName ?? '';
    const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 4;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(17);
    pdf.setFont("Cambria");
    pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
    pdf.setFont("Cambria", 'normal');
    pdf.setFontSize(14);
    pdf.text("Billing Statement", startX, startY + 26);
    this.addImage(pdf, billMaster);
    pdf[autoTable]('', fourthTableRows, {
      startX: 10,
      startY: startY + 35,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 190,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center'
      },
      didParseCell: function (fourthTableRows) {
        fourthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const firstTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf[autoTable]('', sixthTableRows, {
      startX: 10,
      startY: firstTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left',
        },
        1: {
          cellWidth: 95,
          halign: 'center'
        },
        2: {
          cellWidth: 95,
          halign: 'center'
        },
        3: {
          cellWidth: 97,
          halign: 'center'
        },
        4: {
          cellWidth: 97,
          halign: 'center'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (sixthTableRows) {
        sixthTableRows.cell.styles.cellPadding = 1;
      }
    });

    const secondTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf[autoTable]('', fifthTableRows, {
      startX: 10,
      startY: secondTableEndY,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 150,
          halign: 'left'
        },
        1: {
          cellWidth: 384,
          halign: 'left'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      didParseCell: function (fifthTableRows) {
        fifthTableRows.cell.styles.cellPadding = 1;
      }
    });

    let headerAdded: ListItem[] = [{ value: 1, selected: true }];

    var pageContent = function (data) {
      // HEADER
      // const pageNumber = pdf.getNumberOfPages();
      // let added = false;
      // if (headerAdded) {
      //   const item: ListItem = headerAdded.find(x => x.value === pageNumber);
      //   if (item) {
      //     added = item.selected;
      //   }
      // }
      // if (!added) {
      //   const pdfHeadingText = billMaster?.client?.clientName ?? '';
      //   const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 20;
      //   pdf.setTextColor(0, 0, 0);
      //   pdf.setFontSize(17);
      //   pdf.setFont("Cambria");
      //   pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
      //   pdf.setDrawColor(0, 0, 0);
      //   pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
      //   pdf.setFont("Cambria", 'normal');
      //   pdf.setFontSize(14);
      //   pdf.text("Billing Statement", startX, startY + 26);
      //   if (img && billMaster && billMaster.client && billMaster.client.imageProperties && billMaster.client.imageProperties.length) {
      //     const imageProperty: ImageProperty = billMaster?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
      //     if (imageProperty) {
      //       pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
      //     }
      //   }
      //   pdf[autoTable]('', fourthTableRows, {
      //     startX: 10,
      //     startY: startY + 35,
      //     styles: {
      //       overflow: 'linebreak',
      //       cellWidth: 'wrap',
      //       fontSize: 9,
      //       cellPadding: 4,
      //       overflowColumns: 'linebreak',
      //       lineColor: [0, 0, 0]
      //     },
      //     margin: { left: startX },
      //     theme: 'grid',
      //     tableWidth: 'auto',
      //     cellWidth: 'wrap',
      //     columnStyles: {
      //       0: {
      //         cellWidth: 150,
      //         halign: 'left'
      //       },
      //       1: {
      //         cellWidth: 190,
      //         halign: 'left'
      //       }
      //     },
      //     headStyles: {
      //       lineWidth: 0.1,
      //       lineColor: [0, 0, 0],
      //       halign: 'center'
      //     },
      //     didParseCell: function (fourthTableRows) {
      //       fourthTableRows.cell.styles.cellPadding = 1;
      //     }
      //   });
      //   const thirdTableEndY = Math.round(pdf[autoTable].previous.finalY);
      //   data.settings.margin.top = thirdTableEndY + 20;
      //   headerAdded.push({ value: pageNumber, selected: true });
      // } else {
      //   data.settings.margin.top = firstTableEndY + 20;
      // }
      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number plugin only available in jspdf v1.0+
      if (typeof pdf.putTotalPages === 'function') {
        str = str;
      }
      pdf.setFontSize(9);
    };

    const thirdTableEndY = Math.round(pdf[autoTable].previous.finalY);

    pdf.setFont("Cambria");
    pdf.setFontSize(10);
    const meterReadingTableHeading = 'Meter Read-Outs';
    pdf.text(meterReadingTableHeading.toUpperCase(), startX, thirdTableEndY + 20);

    pdf[autoTable](firstTableCol, firstTableRows, {
      startX: 10,
      startY: thirdTableEndY + 40,
      showHead: "everyPage",
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: firstTableCol.length == 6 ? 100 : (firstTableCol.length == 4 ? 182 : 150),
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCol.length == 6 ? 95 : (firstTableCol.length == 4 ? 142 : 120),
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        3: {
          cellWidth: firstTableCol.length == 4 ? 105 : 95,
          halign: 'center'
        },
        4: {
          cellWidth: 74,
          halign: 'center'
        },
        5: {
          cellWidth: 75,
          halign: 'right'
        }
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (firstTableRows) {
        firstTableRows.cell.styles.cellPadding = 1;
      }
    });

    const fourthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    if (seventhTableRows && seventhTableRows.length) {
      pdf.setFontSize(10);
      const chargesBreakDownTableHeading = 'Charges Breakdown';
      pdf.text(chargesBreakDownTableHeading.toUpperCase(), startX, fourthTableEndY + 20);

      pdf[autoTable](seventhTableCol, seventhTableRows, {
        startX: 10,
        startY: fourthTableEndY + 40,
        showHead: "everyPage",
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { left: startX },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: seventhTableCol.length == 6 ? 80 : 215,
            halign: 'center'
          },
          1: {
            cellWidth: seventhTableCol.length == 6 ? 145 : 85,
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 75,
            halign: 'center'
          },
          4: {
            cellWidth: 74,
            halign: 'right'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (seventhTableRows) {
          seventhTableRows.cell.styles.cellPadding = 1;
        }
      });
    }
    const fifthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    let sixthTableEndY = fifthTableEndY;
    if (isSlabTariff) {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 200,
            halign: 'center'
          },
          1: {
            cellWidth: 117,
            halign: 'center'
          },
          2: {
            cellWidth: 117,
            halign: 'center'
          },
          3: {
            cellWidth: 100,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    } else {
      pdf[autoTable](ninthTableCol, ninthTableRows, {
        startX: 10,
        startY: fifthTableEndY + 10,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { top: 180, left: 30 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: 130,
            halign: 'center'
          },
          1: {
            cellWidth: 85,
            halign: 'center'
          },
          2: {
            cellWidth: 85,
            halign: 'center'
          },
          3: {
            cellWidth: 85,
            halign: 'center'
          },
          4: {
            cellWidth: 74,
            halign: 'center'
          },
          5: {
            cellWidth: 75,
            halign: 'right'
          }
        },
        headStyles: {
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center',
          fillColor: [25, 118, 210]
        },
        didParseCell: function (ninthTableRows) {
          ninthTableRows.cell.styles.cellPadding = 1;
        }
      });
      sixthTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    }

    let pageHeight = pdf.internal.pageSize.height;

    if (pageHeight - sixthTableEndY < 200) {
      pdf.addPage();
      // const pdfHeadingText = billMaster?.client?.clientName ?? '';
      // const textWidth = pdf.getTextWidth(pdfHeadingText.trim()) + 20;
      // pdf.setTextColor(0, 0, 0);
      // pdf.setFontSize(17);
      // pdf.setFont("Cambria");
      // pdf.text(pdfHeadingText, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 3);
      // pdf.setDrawColor(0, 0, 0);
      // pdf.line(Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0), startY + 6, Number(pdf.internal.pageSize.width / 2) - Number(textWidth != 0 ? textWidth / 2 : 0) + textWidth, startY + 6);
      // pdf.setFont("Cambria", 'normal');
      // pdf.setFontSize(14);
      // pdf.text("Billing Statement", startX, startY + 26);
      // if (img && billMaster && billMaster.client && billMaster.client.imageProperties && billMaster.client.imageProperties.length) {
      //   const imageProperty: ImageProperty = billMaster?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'invoice');
      //   if (imageProperty) {
      //     pdf.addImage(img, 'png', imageProperty.imgX, imageProperty.imgY, imageProperty.imgW, imageProperty.imgH);
      //   }
      // }
      // const autoTable = 'autoTable';
      // pdf[autoTable]('', fourthTableRows, {
      //   startX: 10,
      //   startY: startY + 35,
      //   styles: {
      //     overflow: 'linebreak',
      //     cellWidth: 'wrap',
      //     fontSize: 9,
      //     cellPadding: 4,
      //     overflowColumns: 'linebreak',
      //     lineColor: [0, 0, 0]
      //   },
      //   margin: { left: startX },
      //   theme: 'grid',
      //   tableWidth: 'auto',
      //   cellWidth: 'wrap',
      //   columnStyles: {
      //     0: {
      //       cellWidth: 150,
      //       halign: 'left'
      //     },
      //     1: {
      //       cellWidth: 190,
      //       halign: 'left'
      //     }
      //   },
      //   headStyles: {
      //     lineWidth: 0.1,
      //     lineColor: [0, 0, 0],
      //     halign: 'center'
      //   },
      //   didParseCell: function (fourthTableRows) {
      //     fourthTableRows.cell.styles.cellPadding = 1;
      //   }
      // });
      sixthTableEndY = firstTableEndY;
      pageHeight = 370 + firstTableEndY;
    }

    pdf[autoTable]('', eighthTableRows, {
      startX: 10,
      startY: sixthTableEndY + 20,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { bottom: startY + 20, left: 250 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 244,
          fontStyle: "italic"
        },
        1: {
          cellWidth: 75
        }
      },
      didParseCell: function (eighthTableRows) {
        const col = eighthTableRows.column.index;
        if (col == 1) {
          eighthTableRows.cell.styles.halign = 'right';
        }
        eighthTableRows.cell.styles.cellPadding = 1;
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    });

    let seventhTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));
    if (billMaster?.client?.termsConditions[0]?.termsAndCondition) {
      pdf.setFillColor(241, 241, 244);
      pdf.rect(startX, seventhTableEndY + 20, 535, 80, 'FD');
      pdf.setFillColor(0, 0, 0);
      pdf.setFontSize(9);
      // pdf.text("Notes :-", startX + 30, seventhTableEndY + 30);
      // pdf.text("Payment should be made within 30 days of devitnote to avoid disconnection.", startX + 30, seventhTableEndY + 40);
      // pdf.text("1. Cash / Cheque in favour of " + billMaster.client.clientName, startX + 30, seventhTableEndY + 50);
      // pdf.text("2. Tax Registeration Number : " + billMaster.client.trnNo, startX + 30, seventhTableEndY + 60);
      // pdf.text("3. Minimum charges payable :", startX + 30, seventhTableEndY + 70);
      // pdf.text(`4. Late fee of ${this.currency} 50 / - will be levied, if payments are made by the due date`, startX + 30, seventhTableEndY + 80);
      // pdf.text("5. Late payment fee of 1 % per month will be calculated on the over due amount from the origional date of payment", startX + 30, seventhTableEndY + 90);
      pdf.text(billMaster?.client?.termsConditions[0]?.termsAndCondition.replace('{{ClientName}}', billMaster.client.clientName).replace('{{TRNNumber}}', billMaster.client.trnNo).replace('{{Currency}}', this.currency), startX + 30, seventhTableEndY + 30);
    }
    pdf.setTextColor(0, 0, 0);
    pdf.line(5, seventhTableEndY + 110, 607, seventhTableEndY + 110);

    pdf.text("Notice :- Please tear and attach the slip  along with your payment", startX, pageHeight - 80);


    pdf[autoTable](thirdTableCol, thirdTableRows, {
      startX: 10,
      startY: pageHeight - 70,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 120,
          halign: 'center'
        },
        1: {
          cellWidth: 200,
          halign: 'center'
        },
        2: {
          cellWidth: 100,
          halign: 'right'
        },
        3: {
          cellWidth: 120,
          halign: 'right'
        },
      },
      headStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'center',
        fillColor: [25, 118, 210]
      },
      didParseCell: function (thirdTableRows) {
        thirdTableRows.cell.styles.cellPadding = 1;
      }
    });

    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  createUnitMeterNumberRow(unitMeterNumber: string, columnCount: number, insertTable: any[]) {
    let row = [];
    for (let i = 0; i < columnCount - 1; i++) {
      if (i === 0) {
        row.push(unitMeterNumber);
      } else {
        row.push('');
      }
    }
    insertTable.push(row);
  }
}
