import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef, } from "@angular/core";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";
import { BillService } from "../../shared/services/bill.service";
import { environment } from "../../../../environments/environment";
import { InvoiceAgingReport } from "./invoice-aging-report.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, ReplaySubject } from "rxjs";
import * as XLSX from 'xlsx';
import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";
import { JwtHelperService } from '@auth0/angular-jwt';
import jsPDF from 'jspdf';
import { CookieService } from 'ngx-cookie-service';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { ClientService } from '../../shared/services/client.service';
import * as moment from 'moment';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
import { elementAt } from 'rxjs/operators';

@Component({
  selector: "invoice-aging-report",
  templateUrl: "./invoice-aging-report.component.html",
  styleUrls: ["./invoice-aging-report.component.scss"],
  animations: [fadeInUpAnimation, fadeInRightAnimation],
})
export class InvoiceAgingReportComponent implements OnInit {

  role: string = '';

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  invoiceAgingReport: InvoiceAgingReport[] = [];
  selectedRows: InvoiceAgingReport[] = [];
  imageProperties: ImageProperty[] = [];
  tableData: any[];
  columns: any[] = [];
  columnNames: ListColumn[] = [];
  clientId: number;
  billAmount = "";
  billPeriodId: number = 0;
  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  fromDate: string = '';
  toDate: string = '';
  today;

  dateFormat = '';
  currency = '';
  roundFormat = '';
  filePath = '';
  ownerId: number = 0;

  billNumberColumnName = "Account Number";
  //billDateColumnName = "BillDate";
  ownerNameColumnName = "Owner";
  totalBalanceColumnName = "Total Balance";
  balance30ColumnName = "30 Days";
  balance60ColumnName = "60 Days";
  balance90ColumnName = "90 Days";
  balance120ColumnName = "180 Days";
  balanceabove120ColumnName = "Above 180 Days";

  @ViewChild("htmlData") htmlData: ElementRef;

  constructor(
    private billService: BillService,
    private date: DatePipe,
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe,
    private snackbar: MatSnackBar,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private clientService: ClientService,
    private envService: EnvService
  ) {
    this.filePath = envService.backendForFiles;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    
    this.today = new Date();
    this.toDate =  new Date().toISOString().substr(0, 10);
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.ownerId = parseInt(this.cookieService.get('ownerId') ?? '0');
    this.createColumnNames();
    this.createGridColumns();
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    this.getBillPeriods();
    //this.getInvoiceAgingReport();
  }

  createGridColumns() {
    this.columns = [
      "accountNumber",
      //"billDatelocal",
      "owner",
      "totalBalancelocal",
      "balance30Local",
      "balance60Local",
      "balance90Local",
      "balance180Local",
      "balanceAbove180Local",
    ];

  }

  createColumnNames() {
    this.columnNames = [
      { name: this.billNumberColumnName, property: "accountNumber" },
      //{ name: this.billDateColumnName, property: "billDatelocal" },
      { name: this.ownerNameColumnName, property: "owner" },
      { name: this.totalBalanceColumnName, property: "totalBalancelocal", columnAlign: { 'text-align': 'right' } },
      { name: this.balance30ColumnName, property: "balance30Local", columnAlign: { 'text-align': 'right' } },
      { name: this.balance60ColumnName, property: "balance60Local", columnAlign: { 'text-align': 'right' } },
      { name: this.balance90ColumnName, property: "balance90Local", columnAlign: { 'text-align': 'right' } },
      { name: this.balance120ColumnName, property: "balance180Local", columnAlign: { 'text-align': 'right' } },
      { name: this.balanceabove120ColumnName, property: "balanceAbove180Local", columnAlign: { 'text-align': 'right' } }

    ] as ListColumn[];

  }
  ngAfterViewInit() { }

  getInvoiceAgingReport() {

    this.billAmount = "";
    let billAmount = 0;
    if (this.toDate) 
    {      
      let toDate = this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD');
      this.billService
      //.getInvoiceAgingReport(this.clientId, this.billPeriodId)
      .getInvoiceAgingReport(this.clientId, toDate)
      .subscribe(
        invoiceAgingReport => {
          this.dateFormat = getClientDataFormat('DateFormat');
          this.roundFormat = getClientDataFormat('RoundOff');
          this.currency = getClientDataFormat('Currency');
          invoiceAgingReport.forEach((x) => {
            x.billDatelocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
            x.totalBalancelocal = this.currencyPipe.transform(x.totalBalance, this.currency.toString(), true, this.roundFormat);
            x.balance30Local = this.currencyPipe.transform(x.balance30, this.currency.toString(), true, this.roundFormat);
            x.balance60Local = this.currencyPipe.transform(x.balance60, this.currency.toString(), true, this.roundFormat);
            x.balance90Local = this.currencyPipe.transform(x.balance90, this.currency.toString(), true, this.roundFormat);
            x.balance180Local = this.currencyPipe.transform(x.balance180, this.currency.toString(), true, this.roundFormat);
            x.balanceAbove180Local = this.currencyPipe.transform(x.balanceAbove180, this.currency.toString(), true, this.roundFormat);
            billAmount = billAmount + x.totalBalance;
          });

          this.invoiceAgingReport = invoiceAgingReport;

          this.billAmount = this.currencyPipe.transform(billAmount, this.currency.toString(), true, this.roundFormat);
        });
      }
      else {
        this.snackbar.open('Invalid search parameters', null, {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
          panelClass: ['yellow-snackbar'],
        });
      }


  }


  onPrintPdf() {
    this.getClientImageProperties();
  }

  getClientImageProperties() {
    this.imageProperties = [];
    this.clientService.getClientImageProperties(this.clientId).subscribe({
      next: (imageProperties: ImageProperty[]) => {
        if (imageProperties && imageProperties.length) {
          this.imageProperties = imageProperties;
          this.downloadReport(this.invoiceAgingReport);
        }
      },
      error() {
        this.notificationMessage("Image properties not found. To see image on print, please configure image properties ", "red-snackbar");
        this.downloadReport(this.invoiceAgingReport);
      }
    });
  }

  downloadReport(invoiceAgingReport: InvoiceAgingReport[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Account Number',
      //'Bill Date',
      'Owner',
      'Total Balance',
      'Balance 30',
      'Balance 60 ',
      'Balance 90 ',
      'Balance 180',
      'Balance Above 180'];

    let totalAmount = 0;

    for (let a = 0; a < invoiceAgingReport.length; a++) {
      row.push(invoiceAgingReport[a].accountNumber)
      row.push(invoiceAgingReport[a].owner)
      row.push(invoiceAgingReport[a].totalBalancelocal)
      row.push(invoiceAgingReport[a].balance30Local)
      row.push(invoiceAgingReport[a].balance60Local)
      row.push(invoiceAgingReport[a].balance90Local)
      row.push(invoiceAgingReport[a].balance180Local)
      row.push(invoiceAgingReport[a].balanceAbove180Local)
      firstTableRows.push(row);

      totalAmount += invoiceAgingReport[a].totalBalance;

      row = [];
    }


    const title = 'Invoice Aging Report';




    secondTableRows.push({ label: 'Total Amount', value1: totalAmount });

    for (let a = 0; a < secondTableRows.length; a++) {
      row.push('')
      row.push(secondTableRows[a].label)
      row.push(this.currencyPipe.transform(secondTableRows[a].value1, this.currency.toString(), true, this.roundFormat))
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      firstTableRows.push(row);
      row = [];
    }

    this.getSummaryReport(this.invoiceAgingReport, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: InvoiceAgingReport[], firstTableCol: any[], firstTableRows: any[], title: string) {
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
    // pdf.text("PO Box 127404", startX + 250, startY - 10);
    // pdf.text("Office 201, Al Zarouni Business Centre", startX + 250, startY);
    // pdf.text("Al Barsha 1, Dubai, UAE", startX + 250, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text("Phone:800 Logic (56442)", startX + 450, startY - 10);
    // pdf.text("Email: ", startX + 450, startY);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("enquiry@logicutilities.com", startX + 475, startY);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text("Web: ", startX + 450, startY + 10);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("www.logicutilities.com", startX + 475, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.setFontSize(12);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text("Logic Utilities District Cooling Services LLC", startX, startY + 30);
    // pdf.text("TRN: 100567483100003", startX, startY + 50)
    pdf.setTextColor(0, 0, 0);
    pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
    pdf.setFontSize(14);
    pdf.text("Invoice Aging Report ", pdf.internal.pageSize.width / 2 - 50, startY + 30)
    pdf.setFontSize(9);

    const autoTable = 'autoTable';
    const secondTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

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
      startY: startY + 50,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 100, left: 20 },
      theme: 'grid',
      tableWidth: 'auto',
      columnStyles: {
        0: {
          cellWidth: 'wrap',
          halign: 'left'
        },
        1: {
          cellWidth: 100,
          halign: 'left'
        },
        2: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        3: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        4: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        5: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        6: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        7: {
          cellWidth: 'wrap',
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

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  getJsonData() {
    this.tableData = [];
    let totalAmount = 0;
    if (this.invoiceAgingReport != undefined) {
      this.invoiceAgingReport.forEach((item) => {
        let element = {
          AccountNumber: item.accountNumber,
          Owner: item.owner,
          TotalBalance: item.totalBalancelocal,
          '30Days': item.balance30Local,
          '60Days': item.balance60Local,
          '90Days': item.balance90Local,
          '180Days': item.balance180Local,
          'Above180Days': item.balanceAbove180Local
        }
        totalAmount += Number(element.TotalBalance.replace(/[^0-9\.-]+/g, ""));
        this.tableData.push(element);
      });

      let row = {
        AccountNumber: '',
        Owner: 'Total Amount',
        TotalBalance: this.currencyPipe.transform(totalAmount, this.currency.toString(), true, this.roundFormat.toString())
      }
      this.tableData.push(row);
    }
  }

  onExport() {
    if (this.invoiceAgingReport && this.invoiceAgingReport.length > 0) {
      this.getJsonData();
      if ((this.tableData != undefined) && (this.tableData.length > 0)) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Invoice Aging Report.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  getBillPeriods() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billPeriods = [{ label: 'Select', value: 0, fromDate: Date.now.toString(), ToDate: Date.now.toString() }];
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id, fromDate: x.periodStart, toDate: x.periodEnd });
      });
    });
  }

  onChangeBillPeriod(value) {
    this.billPeriodId = value;
  }

}
