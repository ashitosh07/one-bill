import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { Tenant } from '../../shared/models/tenant.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BillMaster } from '../../shared/models/bill-master.model';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import { TemplateService } from '../../shared/services/template.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AccountStatementToolbarComponent } from './account-statement-toolbar/account-statement-toolbar.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterService } from '../../shared/services/master.service';
import { RegisterService } from '../../shared/services/register.service';
import { UserActions } from '../../shared/models/user-actions.model';
import { AccountStatementFooterToolbarComponent } from './account-statement-footer-toolbar/account-statement-footer-toolbar.component';
import { PDFDocument } from 'pdf-lib';
import { CookieService } from 'ngx-cookie-service';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import * as XLSX from 'xlsx';
import { EnvService } from 'src/app/env.service';
import { OwnerService } from '../../shared/services/owner.service';
import { Bill } from '../../shared/models/bill.model';

@Component({
  selector: 'app-account-statement',
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class AccountStatementComponent implements OnInit {

  showSpinner: boolean = false;
  role: string = '';

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  tenants: any[] = [];
  billPeriods: ListItem[] = [];
  billTypes: ListItem[] = [];
  selectedRows: BillMaster[] = [];
  visibleButtons: ListColumn[] = [];
  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  billMasterDetails: BillMaster[] = [];
  availableBillMasterDetails: BillMaster[] = [];
  manageParams: ManageParams = {};
  userActions: UserActions[] = [];
  billType = '';
  clientId: number;
  billAmount = '';
  creditNoteAmount = '';
  receivedAmount = '';
  previousDueAmount = '';
  userId: string = '';
  ownerId: number;
  disable: boolean = false;
  disableColumn: string = 'paid';
  tableData: any[];
  isMultipleTenant: boolean = false;
  lstTenant: any[];
  isMovedOutTenant: boolean = false;

  dateFormat = '';
  currency = '';
  roundFormat = '';
  filePath = '';

  billNumberColumnName = 'Bill Number';
  tenantNameColumnName = 'Tenant Name';
  entityTypeColumnName = 'Transactions';
  detailsColumnName = 'Details';
  billDateColumnName = 'Bill Date';
  billAmountColumnName = 'Bill Amount';
  creditNoteAmountColumnName = 'Credit Note Amount';
  paidColumnName = 'Payment Amount';
  previousDueAmountColumnName = 'Balance';


  cssStyledColumn: string = 'status';
  buttonName: string = 'Credit Note';

  pdfsToMerge: any[] = [];

  @ViewChild('htmlData') htmlData: ElementRef;
  @ViewChild(AccountStatementToolbarComponent, { static: true }) accountStatementToolbarComponent: AccountStatementToolbarComponent;
  @ViewChild(AccountStatementFooterToolbarComponent, { static: true }) accountStatementFooterToolbarComponent: AccountStatementFooterToolbarComponent;

  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private ownerService: OwnerService,
    private date: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private jwtHelperService: JwtHelperService,
    private snackbar: MatSnackBar,
    private registerService: RegisterService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    envService: EnvService
  ) {
    this.filePath = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
      this.getUserEnabledActions();
    }

    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    this.getTenants();

    this.createColumnNames();
    this.createGridColumns();
    this.createInnerGridColumns();
    this.addVisibleButtons();
  }

  createGridColumns() {
    this.columns = [
      'billDateLocal',
      'entityType',
      'status',
      'ownerName',
      'billAmountLocal',
      'creditNoteAmountLocal',
      'paidLocal',
      'previousDueAmountLocal'
    ];
  }

  createInnerGridColumns() {
    this.innerColumns = [];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.billNumberColumnName, property: 'billNumber', visible: true, isModelProperty: true },
      { name: this.tenantNameColumnName, property: 'ownerName', visible: true, isModelProperty: true },
      { name: this.entityTypeColumnName, property: 'entityType', visible: true, isModelProperty: true },
      { name: this.billDateColumnName, property: 'billDateLocal', visible: true, isModelProperty: true },
      { name: this.billAmountColumnName, property: 'billAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.paidColumnName, property: 'paidLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.detailsColumnName, property: 'status', visible: true, isModelProperty: true },
      { name: this.creditNoteAmountColumnName, property: 'creditNoteAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } },
      { name: this.previousDueAmountColumnName, property: 'previousDueAmountLocal', visible: true, isModelProperty: true, columnAlign: { 'text-align': 'right' } }] as ListColumn[];
  }

  addVisibleButtons() {
    this.visibleButtons = [
      { property: 'modify' },
      { property: 'print' },
      { property: 'reject' },
      { property: 'cancel' }] as ListColumn[];
  }

  getTenants() {
    this.tenants = [];
    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    if(!this.isMovedOutTenant)
    {
      this.billSettlementService.getTenantsDetails(this.clientId).subscribe(data => {
        this.tenants = data;
      });
    }
    else {
      this.ownerService.getMovedOutTenants(this.clientId).subscribe((data: any[]) => {
        this.tenants = data.filter((item, i, arr) => arr.findIndex((t) => t.Id === item.Id) === i);
        this.tenants = data;
      });
    }
  }

  getUserEnabledActions() {
    this.userActions = [];
    this.registerService.getUserEnabledActions(this.userId).subscribe({
      next: (data: UserActions[]) => {
        this.userActions = data;
      },
      error: () => {
        this.notificationMessage('User Actions not found', 'red-snackbar');
      }
    });
  }

  onGetAccountStatement(manageParams: ManageParams) {
    this.showSpinner = true;
    this.manageParams = manageParams;
    this.billMasterDetails = [];
    this.billAmount = '';
    this.receivedAmount = '';
    this.previousDueAmount = '';
    let billAmount = 0;
    let receivedAmount = 0;
    let creditNoteAmount = 0;
    this.lstTenant = [];
    manageParams.fromDate = manageParams.fromDate == '' ? '' : moment(manageParams.fromDate).format('YYYY-MM-DD');
    manageParams.toDate = manageParams.toDate == '' ? '' : moment(manageParams.toDate).format('YYYY-MM-DD');
    //manageParams.tenantId = `${manageParams.tenantId ?? this.ownerId ?? 0}`;
    
    this.lstTenant = this.manageParams.tenantId.split(",");
    if(this.lstTenant.length > 1)
    {
      this.isMultipleTenant = true;
    }
    else {
      this.isMultipleTenant = false;
    }
    manageParams.clientId = this.clientId;
    this.availableBillMasterDetails = this.billMasterDetails = [];
    this.billService.getAccountStatement(manageParams).subscribe({
      next:
        (billMasterDetails) => {
          if (billMasterDetails && billMasterDetails.length) {
            const securityDepositDetails: BillMaster[] = billMasterDetails.filter(x => x.isBillFailed === false && x.entityType == 'SecurityDeposit');
            const filteredBillMasterDetails: BillMaster[] = billMasterDetails.filter(x => x.isBillFailed === false && x.entityType != 'SecurityDeposit');
            if (filteredBillMasterDetails && filteredBillMasterDetails.length) {
              let balanceAmount = null;
              this.dateFormat = getClientDataFormat('DateFormat');
              this.roundFormat = getClientDataFormat('RoundOff');
              this.currency = getClientDataFormat('Currency');
              filteredBillMasterDetails.forEach(x => {
                x.billDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
                x.billAmountLocal = this.currencyPipe.transform(x.billAmount, this.currency.toString(), true, this.roundFormat);
                x.creditNoteAmountLocal = this.currencyPipe.transform(x.creditNoteAmount, this.currency.toString(), true, this.roundFormat);
                x.paidLocal = this.currencyPipe.transform(Number(x.paid), this.currency.toString(), true, this.roundFormat);
                if (balanceAmount != null && x.entityType === 'Invoice' || x.entityType === 'CreditNote') {
                  x.previousDueAmount = Number(balanceAmount) + Number(x.billAmount) - Number(x.paid) - Number(x.creditNoteAmount)
                } else if (balanceAmount != null && x.entityType === 'Payment') {
                  x.previousDueAmount = Number(balanceAmount) - Number(x.billAmount) - Number(x.paid) - Number(x.creditNoteAmount)
                }
                x.previousDueAmountLocal = this.currencyPipe.transform(x.previousDueAmount, this.currency.toString(), true, this.roundFormat);
                billAmount += Number(x.billAmount);
                creditNoteAmount += Number(x.creditNoteAmount);
                receivedAmount += Number(x.paid);
                balanceAmount = Number(x.previousDueAmount);
                x.fromDate = new Date(manageParams.fromDate);
                x.toDate = new Date(manageParams.toDate);
              });
              this.billMasterDetails = filteredBillMasterDetails;
              this.billAmount = this.currencyPipe.transform(billAmount, this.currency.toString(), true, this.roundFormat);
              this.creditNoteAmount = this.currencyPipe.transform(creditNoteAmount, this.currency.toString(), true, this.roundFormat);
              this.receivedAmount = this.currencyPipe.transform(receivedAmount, this.currency.toString(), true, this.roundFormat);
              this.previousDueAmount = this.currencyPipe.transform(billMasterDetails[billMasterDetails.length - 1].previousDueAmount, this.currency.toString(), true, this.roundFormat);
              this.availableBillMasterDetails = filteredBillMasterDetails.map(x => x);
              if (securityDepositDetails && securityDepositDetails.length) {
                securityDepositDetails.forEach(x =>
                  this.availableBillMasterDetails.push(x)
                );
              }
            } else {
              this.notificationMessage('No data found.', 'yellow-snackbar');
            }
          }
          else {
            this.notificationMessage('No data found.', 'yellow-snackbar');
          }
          this.showSpinner = false;
        },
      error: () => {
        this.showSpinner = false;
      }
    });

  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
    this.disable = false
    if (this.selectedRows && this.selectedRows.length) {
      const approvedBillsExist = this.selectedRows.find(x => x.isApproved == true);
      if (approvedBillsExist) {
        this.disable = true
      }
    }
  }

  async onPrintPdf(type: string) {
    this.pdfsToMerge = [];
    if (this.availableBillMasterDetails && this.availableBillMasterDetails.length) {
      this.availableBillMasterDetails[0].fromDate = new Date(this.manageParams.fromDate);
      this.availableBillMasterDetails[0].toDate = new Date(this.manageParams.toDate);
      if (type === 'Normal') {
        this.accountStatementView(this.availableBillMasterDetails);
      } else {
        this.downloadDetailReport(this.availableBillMasterDetails);
      }
    }
    else {
      this.notificationMessage('Account statement not available.', 'red-snackbar');
    }
  }

  async downloadAllTenantsFiles(data: any[]) {
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

  async downloadFile(data) {
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

  downloadReport(billMasters: BillMaster[]) {
    let row: any[] = [];
    let firstTableRows: ListData[] = [];
    let secondTableRows: any[] = [];



    let secondTableCols = [
      'Date',
      'Transactions',
      'Details',
      'Amount',
      'Payments',
      'Balance'
    ];


    let invoiceAmount: number = 0;
    let paidAmount: number = 0;

    billMasters.forEach(x => {
      invoiceAmount += Number(x.billAmount);
      if (x.entityType !== 'Opening Balance') {
        paidAmount += Number(x.paid);
      }
    });


    for (let a = 0; a < billMasters.length; a++) {
      row.push(billMasters[a].billDateLocal)
      row.push(billMasters[a].entityType)
      row.push(billMasters[a].status)
      row.push(billMasters[a].billAmountLocal)
      row.push(billMasters[a].paidLocal)
      row.push(billMasters[a].previousDueAmountLocal)
      secondTableRows.push(row);
      row = [];
    }

    row.push('')
    row.push('')
    row.push('')
    row.push('')
    row.push('Balance Due')
    row.push(billMasters[billMasters.length - 1].previousDueAmountLocal)
    secondTableRows.push(row);

    firstTableRows.push(
      {
        label: 'Opening Balance',
        value: billMasters[0].previousDueAmountLocal
      },
      {
        label: 'Invoiced Amount',
        value: this.currencyPipe.transform(invoiceAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Amount Paid',
        value: this.currencyPipe.transform(paidAmount, this.currency.toString(), true, this.roundFormat)
      },
      {
        label: 'Balance Due',
        value: billMasters[billMasters.length - 1].previousDueAmountLocal
      }
    );

    const title = 'Invoice';

    this.getReport(billMasters, firstTableRows, secondTableCols, secondTableRows);
  }

  addImage(pdf: jsPDF, billMasterDetails: BillMaster[], type: string) {
    try {
      if (billMasterDetails && billMasterDetails.length && billMasterDetails[0] && billMasterDetails[0].client && billMasterDetails[0].client.imageProperties && billMasterDetails[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = billMasterDetails[0].client.imageProperties.find(x => x.imageType.trim().toLowerCase() === type.toLowerCase());
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + billMasterDetails[0].client?.photo; //'assets/img/' + data.client.photo
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


  accountStatementView(billMasters: BillMaster[]) {

    //if (this.manageParams.tenantName == 'All Tenants') {
    if(this.lstTenant.length > 1)
    {
      this.billService.accountStatementSummaryView(billMasters).subscribe({
        next: data => {
          if (data) {
            this.downloadAllTenantsFiles(data);
          } else {
            this.notificationMessage('No data to print', 'red-snackbar');
          }
        },
        error: () => {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      });
    }
    else {
      this.billService.accountStatementView(billMasters).subscribe({
        next: data => {
          if (data) {
            this.downloadFile(data);
          } else {
            this.notificationMessage('No data to print', 'red-snackbar');
          }
        },
        error: () => {
          this.notificationMessage('No data to print', 'red-snackbar');
        }
      });
    }

  }

  getReport(data: BillMaster[], firstTableRows: ListData[], secondTableCols: any[], secondTableRows: any[]) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    this.addImage(pdf, data, 'Account Statement');
    pdf.setFontSize(30);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('Cambria');
    pdf.text(stringIsNullOrEmpty(data[0].client.clientName).toUpperCase(), pdf.internal.pageSize.width - 600, startY + 20);
    pdf.setFontSize(10);
    pdf.text("TRN: " + data[0].client.trnNo, pdf.internal.pageSize.width - 600, startY + 30);
    pdf.text("PO Box " + data[0].client.addresses[0].zipPostalCode, pdf.internal.pageSize.width - 600, startY + 40);
    pdf.text(data[0].client.addresses[0].address1 + ',' + data[0].client.addresses[0].country, pdf.internal.pageSize.width - 600, startY + 50);
    pdf.text("Phone: " + data[0].client.phoneNo, pdf.internal.pageSize.width - 600, startY + 60);
    pdf.text("Email: " + data[0].client.email + ',' + ' Web: ' + data[0].client.website, pdf.internal.pageSize.width - 600, startY + 70);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Customer Details", 10, startY + 90);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 100, 250, 75, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(data[0]?.ownerName.toUpperCase(), startX + 10, startY + 115);
    pdf.text("CUSTOMER TRN: " + data[0]?.trn, startX + 10, startY + 130);
    pdf.text("unit #" + data[1]?.unitNumber, startX + 10, startY + 145);
    pdf.text("Account Number: " + data[0]?.accountNumber, startX + 10, startY + 160);
    pdf.setFontSize(9);
    pdf.setFontSize(11);
    const meterReadingTableHeading = 'Statement of Accounts';
    pdf.setFont('Cambria', 'bold');
    pdf.text(meterReadingTableHeading.toUpperCase(), pdf.internal.pageSize.width - 250, startY + 40);
    pdf.setFont('Cambria', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.line(pdf.internal.pageSize.width - 250, startY + 50, 607, startY + 50);
    let fromDate: string = this.date.transform(this.manageParams.fromDate.toString(), this.dateFormat.toString());
    let toDate: string = this.date.transform(this.manageParams.toDate.toString(), this.dateFormat.toString());
    let period: string = fromDate + ' - ' + toDate;
    pdf.text(period.toString(), pdf.internal.pageSize.width - 250, startY + 60);
    pdf.line(pdf.internal.pageSize.width - 250, startY + 70, 607, startY + 70);
    pdf.setFontSize(10);
    pdf.text("Account Summary", pdf.internal.pageSize.width - 250, startY + 90);
    pdf.setFontSize(9);
    const autoTable = 'autoTable';
    pdf[autoTable]('', firstTableRows, {
      startX: pdf.internal.pageSize.width - 250,
      startY: startY + 100,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: pdf.internal.pageSize.width - 250 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 135,
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


    pdf[autoTable](secondTableCols, secondTableRows, {
      startX: 10,
      startY: firstTableEndY + 20,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: firstTableEndY + 20, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 70,
          halign: 'center'
        },
        1: {
          cellWidth: 100,
          halign: 'center'
        },
        2: {
          cellWidth: 180,
          halign: 'center'
        },
        3: {
          cellWidth: 80,
          halign: 'right'
        },
        4: {
          cellWidth: 80,
          halign: 'right'
        },
        5: {
          cellWidth: 80,
          halign: 'right'
        }
      },
      didParseCell: function (secondTableRows) {
        const tdElement = secondTableRows.cell.raw;
        if (tdElement === 'Balance Due') {
          secondTableRows.cell.styles.fontStyle = 'bold';
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


    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  downloadDetailReport(billMasters: BillMaster[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];

    billMasters.forEach(x => {
      if (x.entityType !== 'Opening Balance') {
      }
    });


    let firstColumns: string[] = [];
    let secondColumns: string[] = [];

    billMasters.forEach(x => {
      if (x.bills && x.bills.length) {
        x.bills.forEach(bill => {
          if (bill.billTransactions && bill.billTransactions.length) {
            bill.billTransactions.forEach(transaction => {
              if (!firstColumns.includes(transaction.headDisplay)) {
                firstColumns.push(transaction.headDisplay);
              }
            });
          }
        });
      }
      if (x.billCharges && x.billCharges.length) {
        x.billCharges.forEach(billCharge => {
          if (!secondColumns.includes(billCharge.headDisplay)) {
            secondColumns.push(billCharge.headDisplay);
          }
        });
      }
    });

    let firstTableCols = [
      'Date',
      'Transactions',
      'Details'
    ];

    firstColumns.forEach(x => {
      firstTableCols.push(x);
    });

    secondColumns.forEach(x => {
      firstTableCols.push(x);
    });

    firstTableCols.push('Amount', 'Payments', 'Balance');
    const defaultValue = this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat);
    for (let a = 0; a < billMasters.length; a++) {
      row.push(billMasters[a].billDateLocal)
      row.push(billMasters[a].entityType)
      row.push(billMasters[a].status)

      firstColumns.forEach(column => {
        if (billMasters[a].bills && billMasters[a].bills.length) {
          const differentiateBills = billMasters[a].bills.filter(x => x.isDifferentiateBill == true);
          if (differentiateBills && differentiateBills.length && billMasters[a].bills.length == differentiateBills.length) {
            if (differentiateBills[differentiateBills.length - 1].billTransactions && differentiateBills[differentiateBills.length - 1].billTransactions.length) {
              const item = differentiateBills[differentiateBills.length - 1].billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
              if (item) {
                row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
              } else {
                row.push(defaultValue);
              }
            }
            else {
              row.push(defaultValue);
            }
          } else {
            billMasters[a].bills.forEach(bill => {
              if (bill.billTransactions && bill.billTransactions.length) {
                const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                if (item) {
                  row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
                }
                else {
                  row.push(defaultValue);
                }
              }
              else {
                row.push(defaultValue);
              }
            });
          }
        } else {
          row.push(defaultValue);
        }
      });

      secondColumns.forEach(column => {
        if (billMasters[a].billCharges && billMasters[a].billCharges.length) {
          const item = billMasters[a].billCharges.find(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
          if (item) {
            row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
          } else {
            row.push(defaultValue);
          }
        } else {
          row.push(defaultValue);
        }
      });

      row.push(this.currencyPipe.transform(billMasters[a].billAmount, this.currency.toString(), true, this.roundFormat))
      row.push(this.currencyPipe.transform(billMasters[a].paid, this.currency.toString(), true, this.roundFormat))
      row.push(this.currencyPipe.transform(billMasters[a].previousDueAmount, this.currency.toString(), true, this.roundFormat))
      firstTableRows.push(row);
      row = [];
    }

    row = [];
    for (let a = 0; a < firstTableCols.length; a++) {
      if (a < firstTableCols.length - 2) {
        row.push('');
      } else {
        row.push('Balance Due')
        row.push(billMasters[billMasters.length - 1].previousDueAmountLocal)
      }
    }
    firstTableRows.push(row);

    const title = 'Invoice';

    this.getDetailReport(billMasters, firstTableCols, firstTableRows);
  }

  getDetailReport(data: BillMaster[], firstTableCols: any[], firstTableRows: any[]) {

    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    this.addImage(pdf, data, 'Landscape');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('Cambria', 'bold');
    let today: string = this.date.transform(new Date().toString(), this.dateFormat.toString());
    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    const meterReadingTableHeading = 'Statement of Accounts As ' + today;
    pdf.text(meterReadingTableHeading, startX + 300, startY);
    pdf.setFont('Cambria', 'normal');
    pdf.setFontSize(9);
    pdf.text('Print Date:' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
    // pdf.text("TRN: " + data[0].client.trnNo, startX + 600, startY + 20);
    // pdf.text("PO Box " + data[0].client.addresses[0].zipPostalCode, startX + 600, startY + 30);
    // pdf.text(data[0].client.addresses[0].address1 + ',' + data[0].client.addresses[0].country, startX + 600, startY + 40);
    // pdf.text("Phone: " + data[0].client.phoneNo, startX + 600, startY + 50);
    // pdf.text("Email: " + data[0].client.email, startX + 600, startY + 60);
    // pdf.text("Web: " + data[0].client.website, startX + 600, startY + 70);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(data[0]?.ownerName.toUpperCase(), startX + 330, startY + 20);
    pdf.text("Unit #" + data[1]?.unitNumber, startX + 330, startY + 35);
    pdf.text("Tower Name: " + data[0]?.client?.clientName, startX + 330, startY + 50);
    pdf.text("Account Number: " + data[0]?.accountNumber, startX + 330, startY + 65);
    pdf.setFontSize(9);
    let fromDate: string = this.date.transform(this.manageParams.fromDate.toString(), this.dateFormat.toString());
    let toDate: string = this.date.transform(this.manageParams.toDate.toString(), this.dateFormat.toString());
    let period: string = fromDate + ' - ' + toDate;
    pdf.text(period.toString(), startX + 330, startY + 80);
    pdf.setFontSize(10);
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

    const autoTable = 'autoTable';

    pdf[autoTable](firstTableCols, firstTableRows, {
      startX: 10,
      startY: 120,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 120, left: 10 },
      theme: 'grid',
      tableWidth: 'auto',
      columnStyles: {
        0: {
          cellWidth: firstTableCols.length > 4 ? '40' : 'wrap',
          halign: 'center'
        },
        1: {
          cellWidth: firstTableCols.length > 4 ? '40' : 'wrap',
          halign: 'center'
        },
        2: {
          cellWidth: firstTableCols.length > 4 ? '60' : 'wrap',
          halign: 'center'
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
        },
        8: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        9: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        10: {
          cellWidth: 'wrap',
          halign: 'right'
        }
      },
      didParseCell: function (secondTableRows) {
        const tdElement = secondTableRows.cell.raw;
        if (tdElement === 'Balance Due') {
          secondTableRows.cell.styles.fontStyle = 'bold';
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


    //for adding total number of pages // i.e 10 etc
    if (typeof pdf.putTotalPages === 'function') {
      pdf.putTotalPages(totalPagesExp);
    }
    var output = pdf.output('datauristring')
    this.pdfsToMerge.push(output);
  }

  getJsonData() {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    this.tableData = [];
    let firstColumns: string[] = [];
    let secondColumns: string[] = [];
    this.billMasterDetails.forEach(x => {
      if (x.bills && x.bills.length) {
        x.bills.forEach(bill => {
          if (bill.billTransactions && bill.billTransactions.length) {
            bill.billTransactions.forEach(transaction => {
              if (!firstColumns.includes(transaction.headDisplay)) {
                firstColumns.push(transaction.headDisplay);
              }
            });
          }
        });
      }
      if (x.billCharges && x.billCharges.length) {
        x.billCharges.forEach(billCharge => {
          if (!secondColumns.includes(billCharge.headDisplay)) {
            secondColumns.push(billCharge.headDisplay);
          }
        });
      }
    });

    let firstTableCols = [
      'Date',
      'Transactions',
      'Details'
    ];

    firstColumns.forEach(x => {
      firstTableCols.push(x);
    });
    secondColumns.forEach(x => {
      firstTableCols.push(x);
    });

    firstTableCols.push('Amount', 'Payments', 'Balance');
    this.tableData.push(firstTableCols);
    const defaultValue = this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat);

    for (let a = 0; a < this.billMasterDetails.length; a++) {
      row.push(this.billMasterDetails[a].billDateLocal)
      row.push(this.billMasterDetails[a].entityType)
      row.push(this.billMasterDetails[a].status)

      firstColumns.forEach(column => {
        let headAmount = 0;
        if (this.billMasterDetails[a].bills && this.billMasterDetails[a].bills.length) {
          const differentiateBills = this.billMasterDetails[a].bills.filter(x => x.isDifferentiateBill == true);
          if (differentiateBills && differentiateBills.length && this.billMasterDetails[a].bills.length == differentiateBills.length) {
            if (differentiateBills[differentiateBills.length - 1].billTransactions && differentiateBills[differentiateBills.length - 1].billTransactions.length) {
              const item = differentiateBills[differentiateBills.length - 1].billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
              if (item) {
                //row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
                headAmount = item.headAmount;
              }
              // else {
              //   row.push(defaultValue);
              // }
            }
            else {
              row.push(defaultValue);
            }
          } else {

            this.billMasterDetails[a].bills.forEach(bill => {
              if (bill.billTransactions && bill.billTransactions.length) {
                const item = bill.billTransactions.find(transaction => transaction.headDisplay.toLowerCase() === column.toLowerCase());
                if (item) {
                  //row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
                  headAmount += item.headAmount;
                }
                // else {
                //   row.push(defaultValue);
                // }
              }
              // else {
              //   row.push(defaultValue);
              // }
            });
            if (headAmount > 0) {
              row.push(this.currencyPipe.transform(headAmount, this.currency.toString(), true, this.roundFormat));
            }
            else {
              row.push(defaultValue);
            }

          }
        } else {
          row.push(defaultValue);
        }
      });

      secondColumns.forEach(column => {
        if (this.billMasterDetails[a].billCharges && this.billMasterDetails[a].billCharges.length) {
          const item = this.billMasterDetails[a].billCharges.find(billCharge => billCharge.headDisplay.toLowerCase() === column.toLowerCase());
          if (item) {
            row.push(this.currencyPipe.transform(item.headAmount, this.currency.toString(), true, this.roundFormat));
          } else {
            row.push(defaultValue);
          }
        } else {
          row.push(defaultValue);
        }
      });

      row.push(this.currencyPipe.transform(this.billMasterDetails[a].billAmount, this.currency.toString(), true, this.roundFormat))
      row.push(this.currencyPipe.transform(this.billMasterDetails[a].paid, this.currency.toString(), true, this.roundFormat))
      row.push(this.currencyPipe.transform(this.billMasterDetails[a].previousDueAmount, this.currency.toString(), true, this.roundFormat))

      firstTableRows.push(row);
      this.tableData.push(row);
      row = [];
    }
    row = [];
    for (let a = 0; a < firstTableCols.length; a++) {
      if (a < firstTableCols.length - 2) {
        row.push('');
      } else {
        if (!row.includes('Balance Due')) {
          row.push('Balance Due')
          row.push(this.billMasterDetails[this.billMasterDetails.length - 1].previousDueAmountLocal)
        }
      }
    }
    this.tableData.push(row);
  }

  getAllTenantsJsonData() {
    this.tableData = [];
    let balanceDue = this.currencyPipe.transform(0, this.currency.toString(), true, this.roundFormat.toString());
    if (this.billMasterDetails != undefined) {
      
      this.billMasterDetails.forEach((row) => {
        var tenantAccStatements = [];
        tenantAccStatements = this.billMasterDetails.filter(x => x.ownerName == row.ownerName);
        var existingRows = this.tableData.filter(x => x.TenantName == row.ownerName);
        if(existingRows && existingRows.length == 0)
        {
          tenantAccStatements.forEach((item) => {
            let element = {
              BillDate: this.date.transform(item.billDate, 'yyyy-MM-dd'),
              Transactions: item.entityType,
              Details: item.status,
              TenantName: item.ownerName,
              BillAmount: item.billAmountLocal,
              CreditNoteAmount: item.creditNoteAmountLocal,
              PaymentAmount: item.paidLocal,
              Balance: item.previousDueAmountLocal  //this.currencyPipe.transform(item.balanceAmount, this.currency.toString(), true, this.roundFormat.toString())
            }
            balanceDue = item.previousDueAmountLocal;
            this.tableData.push(element);
          });        
        
          let balanceDueRow = {
            BillDate: '',
            Transactions: '',
            Details: '',
            TenantName: '',
            BillAmount: '',
            CreditNoteAmount: '',
            PaymentAmount: 'Balance Due',
            Balance: balanceDue
          }
          this.tableData.push(balanceDueRow);
        }
      });      
    }
  }

  onExport() {
    if (this.billMasterDetails && this.billMasterDetails.length > 0) {
      //if (this.manageParams.tenantName == 'All Tenants') {
      if(this.lstTenant.length > 1) {
        this.getAllTenantsJsonData();
      }
      else {
        this.getJsonData();
      }
      if (this.tableData != undefined) {
        //const ws: XLSX.WorkSheet = this.manageParams.tenantName == 'All Tenants' ? XLSX.utils.json_to_sheet(this.tableData) : XLSX.utils.aoa_to_sheet(this.tableData);
        const ws: XLSX.WorkSheet = this.lstTenant.length > 1 ? XLSX.utils.json_to_sheet(this.tableData) : XLSX.utils.aoa_to_sheet(this.tableData);
        
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'AccountStatement.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  showMovedOutTenants(isMovedOutTenant)
  {
    this.isMovedOutTenant = isMovedOutTenant;
    this.getTenants();
  }
}
