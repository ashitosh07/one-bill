import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ManageParams } from '../../shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bill } from '../../shared/models/bill.model';
import { BillService } from '../../shared/services/bill.service';
import { BillMaster } from '../../shared/models/bill-master.model';
import { MatTableDataSource } from '@angular/material/table';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Master } from '../../shared/models/master.model';
import * as moment from 'moment';
import { Payment } from '../../shared/models/payment.model';
import { ListData } from '../../shared/models/list-data.model';
import jsPDF from 'jspdf';
import { TemplateService } from '../../shared/services/template.service';
import { TemplateContent } from '../../shared/models/template-content.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import * as XLSX from 'xlsx';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-create-paymentdue',
  templateUrl: './create-paymentdue.component.html',
  styleUrls: ['./create-paymentdue.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreatePaymentdueComponent implements OnInit {
  subject$: ReplaySubject<BillMaster[]> = new ReplaySubject<BillMaster[]>(1);
  data$: Observable<BillMaster[]> = this.subject$.asObservable();
  clientId: number;
  fromDate: string;
  toDate: string;
  paymentDue: BillMaster[];
  currencyFormat = '';
  dateFormat = '';
  billPeriodId: number = 0;
  ownerId: number;
  selectedRows: BillMaster[] = [];
  billPeriods: any[] = [];
  roundOffFormat = '';
  role: string = '';
  tableData: any[];
  hasData: boolean = false;

  filePath = '';
  @Input() displayedColumns: ListColumn[] = [];

  createGridColumns() {
    //if (this.role != 'External') {
    if(this.ownerId == 0)
    {
      this.displayedColumns = [
        //{ name: 'Checkbox', property: 'checkbox', visible: true },
        { name: 'Bill Number', property: 'billNumber', visible: true, isModelProperty: true },
        { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
        { name: 'Owner/Tenant', property: 'entityType', visible: true, isModelProperty: true },
        { name: 'Unit', property: 'unitNumber', visible: true, isModelProperty: true },
        { name: 'From Date', property: 'fromDateLocal', visible: true, isModelProperty: true },
        { name: 'To Date', property: 'toDateLocal', visible: true, isModelProperty: true },
        { name: 'Due Date', property: 'dueDateLocal', visible: true, isModelProperty: true },
        { name: 'Bill Amount', property: 'billAmountLocal', visible: true, isModelProperty: false }, //columnAlign: { headStyles: {'text-align': 'right'},cell: {'text-align': 'right'}} },
        { name: 'Credit Note Amount', property: 'creditNoteAmountLocal', visible: true, isModelProperty: false },
        { name: 'Paid Amount', property: 'paidLocal', visible: true, isModelProperty: false },
        { name: 'Payment Due', property: 'toPayLocal', visible: true, isModelProperty: false }

        //{ name: 'Actions', property: 'actions', visible: true }
      ] as ListColumn[];
    }
    else {
      this.displayedColumns = [
        //{ name: 'Checkbox', property: 'checkbox', visible: true },
        { name: 'Bill Number', property: 'billNumber', visible: true, isModelProperty: true },
        { name: 'Bill Date', property: 'billDateLocal', visible: true, isModelProperty: true },
        //{ name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
        //{ name: 'Owner/Tenant', property: 'entityType', visible: true, isModelProperty: true },
        { name: 'Unit', property: 'unitNumber', visible: true, isModelProperty: true },
        //{ name: 'From Date', property: 'fromDateLocal', visible: true, isModelProperty: true },
        //{ name: 'To Date', property: 'toDateLocal', visible: true, isModelProperty: true },
        { name: 'Due Date', property: 'dueDateLocal', visible: true, isModelProperty: true },
        //{ name: 'Bill Amount', property: 'billAmountLocal', visible: true, isModelProperty: true, columnAlign:{ 'text-align': 'right'}}, //columnAlign: { headStyles: {'text-align': 'right'},cell: {'text-align': 'right'}} },
        //{ name: 'Credit Note Amount', property: 'creditNoteAmountLocal', visible: true, isModelProperty: true, columnAlign:{ 'text-align': 'right'} },
        //{ name: 'Paid Amount', property: 'paidLocal', visible: true, isModelProperty: true, columnAlign:{ 'text-align': 'right'} },
        { name: 'Payment Due', property: 'toPayLocal', visible: true, isModelProperty: false }

        //{ name: 'Actions', property: 'actions', visible: true }
      ] as ListColumn[];
    }
  }

  pageSize = 8;
  dataSource: MatTableDataSource<BillMaster> | null;
  public columnsProps: string[];

  sort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }
  decimalPipe: any;


  constructor(private billService: BillService,
    private currency: CurrencyPipe,
    private date: DatePipe,
    private templateService: TemplateService,
    private jwtHelperService: JwtHelperService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.filePath = envService.backendForFiles;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundOffFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.columnsProps = this.displayedColumns.map((column: ListColumn) => column.property);
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.ownerId = parseInt(this.cookieService.get('ownerId'));
      this.createGridColumns();    
    if (this.ownerId > 0) {
      this.clientSelectionService.setIsClientVisible(false);
      this.getPaymentDue();
    }
    else {
      this.clientSelectionService.setIsClientVisible(true);
    }
    this.getBillPeriods();
  }

  getBillPeriods() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.billService.getBillPeriods(this.clientId).subscribe(billPeriods => {
      billPeriods.forEach(x => {
        this.billPeriods.push({ label: x.periodDescription, value: x.id });
      });
    });
  }

  getPaymentDueReport() {
    this.fromDate = this.fromDate == undefined ? '' : this.fromDate;
    this.toDate = this.toDate == undefined ? '' : this.toDate;
    if (((this.fromDate != '') && (this.toDate != '')) || (this.billPeriodId > 0)) {
      this.getPaymentDue();
    }
    else {
      this.notificationMessage("Invalid Parameters.", 'yellow-snackbar');
    }
  }

  getPaymentDue() {
    this.paymentDue = [];
    this.hasData = false;
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.fromDate = this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD');
    this.toDate = this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD');

    this.billService.GetPaymentDue(this.fromDate, this.toDate, this.billPeriodId, this.ownerId, this.clientId).subscribe((paymentDue: BillMaster[]) => {
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundOffFormat = getClientDataFormat('RoundOff');
      this.currencyFormat = getClientDataFormat('Currency');
      paymentDue.forEach(x => {
        x.billAmountLocal = this.currency.transform(x.billAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
        x.billDateLocal = this.date.transform(x.billDate.toString(), this.dateFormat.toString());
        x.dueDateLocal = this.date.transform(x.dueDate.toString(), this.dateFormat.toString());
        x.fromDateLocal = this.date.transform(x.fromDate.toString(), this.dateFormat.toString());
        x.toDateLocal = this.date.transform(x.toDate.toString(), this.dateFormat.toString());
        x.paidLocal = this.currency.transform(x.paid, this.currencyFormat.toString(), true, this.roundOffFormat);
        x.creditNoteAmountLocal = this.currency.transform(x.creditNoteAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
        if (x.toPay.toString().substring(0).includes('-', 0)) {
          let toPay = x.toPay.toString().replace('-', '');
          x.toPayLocal = this.currency.transform(toPay, this.currencyFormat.toString() + '-', true, this.roundOffFormat);
        }
        else {
          x.toPayLocal = this.currency.transform(x.toPay, this.currencyFormat.toString(), true, this.roundOffFormat);
        }
      });

      this.paymentDue = paymentDue;
      this.subject$.next(this.paymentDue);   

      if (this.paymentDue.length > 0) {
        this.hasData = true;
      }
    }
      // ,error: (err) => {
      //   this.notificationMessage('Payment Due Not Found.', 'red-snackbar');
      // }
    );

    this.dataSource = new MatTableDataSource(this.paymentDue);

    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((paymentDues) => {
      this.paymentDue = paymentDues;
      this.dataSource.data = paymentDues;
    });
    this.ngAfterViewInit();
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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

  onChangeBillPeriod(value) {
    this.billPeriodId = value;
  }

  onSelectedRows(selectedRows: BillMaster[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }

  onSendEmail() {
    if (this.paymentDue) {
      const templateContent: TemplateContent = {
        notificationType: 'EMAIL',
        templateType: 'Invoice',
        templateName: 'Invoice',
        billMasterDetails: this.paymentDue
      };
      this.templateService.emailInvoiceTemplate(templateContent).subscribe(
        response => {
          this.notificationMessage("Email send successfully.", "green-snackbar");
        }
      );
    }
  }

  onPrintSummary() {
    this.downloadSummary(this.paymentDue);
  }

  downloadSummary(billMaster: BillMaster[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Bill Number',
      'Tenant Name',
      'Account No.',
      'Unit',
      'Bill Date',
      'Due Date',
      'Bill Amount',
      'Paid',
      'Amount Due'];

    let totalAmount = 0;
    let totalPaidAmount = 0;
    let totalAmountDue = 0;

    for (let a = 0; a < billMaster.length; a++) {
      row.push(billMaster[a].billNumber)
      row.push(billMaster[a].ownerName)
      row.push(billMaster[a].accountNumber)
      row.push(billMaster[a].unitNumber)
      row.push(billMaster[a].billDateLocal)
      row.push(billMaster[a].dueDateLocal)
      row.push(billMaster[a].billAmountLocal)
      row.push(billMaster[a].paidLocal)
      row.push(billMaster[a].toPayLocal)
      firstTableRows.push(row);

      totalAmount += billMaster[a].billAmount;
      totalPaidAmount += billMaster[a].paid;
      totalAmountDue += billMaster[a].toPay;

      row = [];
    }

    const title = 'Payment Due Report';

    secondTableRows.push({ label: 'Total Amount', value0: totalAmount, value1: totalPaidAmount, value2: totalAmountDue });

    for (let a = 0; a < secondTableRows.length; a++) {
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push('')
      row.push(secondTableRows[a].label)
      row.push(this.currency.transform(secondTableRows[a].value0, this.currencyFormat.toString(), true, this.roundOffFormat));
      row.push(this.currency.transform(secondTableRows[a].value1, this.currencyFormat.toString(), true, this.roundOffFormat))
      row.push(this.currency.transform(secondTableRows[a].value2, this.currencyFormat.toString(), true, this.roundOffFormat))
      //row.push(this.currencyFormat.transform(secondTableRows[a].value2, this.currency.toString(), true, this.roundOffFormat))
      firstTableRows.push(row);
      row = [];
    }

    this.getSummaryReport(this.paymentDue, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(billMasterDetails: BillMaster[], firstTableCol: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = "1";
    var img = new Image();
    img.src = this.filePath + '/uploads/' + billMasterDetails[0]?.client?.photo //'assets/img/' + data.client.photo
    let pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    const currentTime: string = moment().format('M/D/YYYY hh:mm:ss a');
    // pdf.setFontSize(30);
    // this.addImage(pdf, data, 'portrait');
    // pdf.setTextColor(25, 118, 210);
    // pdf.setFontSize(9);
    // pdf.setFont("Cambria");
    // pdf.text(`PO Box ${stringIsNullOrEmpty(data[0]?.client.addresses[0].zipPostalCode)}`, startX + 250, startY - 10);
    // pdf.text(stringIsNullOrEmpty(data[0].client.addresses[0].address1 + ',' + data[0].client.addresses[0].area), startX + 250, startY);
    // pdf.text(stringIsNullOrEmpty(data[0].client.addresses[0].location + ',' + data[0].client.addresses[0].city + ',' + data[0].client.addresses[0].country), startX + 250, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text(`Phone: ${stringIsNullOrEmpty(data[0]?.client?.phoneNo)}`, startX + 450, startY - 10);
    // pdf.text("Email: ", startX + 450, startY);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text(stringIsNullOrEmpty(data[0]?.client?.email), startX + 475, startY);
    // pdf.setTextColor(0, 0, 0);
    // pdf.text("Web: ", startX + 450, startY + 10);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text(stringIsNullOrEmpty(data[0]?.client?.website), startX + 475, startY + 10);
    // pdf.setTextColor(0, 0, 0);
    // pdf.setFontSize(12);
    // pdf.setTextColor(25, 118, 210);
    // pdf.text(stringIsNullOrEmpty(data[0]?.client?.clientName).toUpperCase(), startX, startY + 30);
    // pdf.text(`TRN: ${stringIsNullOrEmpty(data[0]?.client?.trnNo)}`, startX, startY + 50)
    // pdf.setTextColor(0, 0, 0);
    // pdf.setFontSize(14);
    // pdf.text(stringIsNullOrEmpty("Payment Dues From " + data[0].fromDateLocal + " To " + data[0].toDateLocal), pdf.internal.pageSize.width / 2 - 20, startY + 40)
    // pdf.setFontSize(9);

    const autoTable = 'autoTable';
    //const secondTableEndY = Number(pdf[autoTable].previous.finalY);  //Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    var pageContent = function (data) {
      // HEADER
      pdf.setFontSize(30);
      if (img && billMasterDetails[0] && billMasterDetails[0].client && billMasterDetails[0].client.imageProperties && billMasterDetails[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = billMasterDetails[0]?.client?.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'portrait');
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('Print Date: ' + currentTime, pdf.internal.pageSize.width - 150, startY - 10);
      pdf.setFontSize(14);
      pdf.text("Payment Dues From " + stringIsNullOrEmpty(billMasterDetails[0]?.fromDateLocal) + " To " + stringIsNullOrEmpty(billMasterDetails[0]?.toDateLocal), pdf.internal.pageSize.width / 2 - 140, startY + 60)
      pdf.setFontSize(9);
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
      startY: startY + 80,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 100, left: 15 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 70,
          halign: 'left'
        },
        1: {
          cellWidth: 120,
          halign: 'left'
        },
        2: {
          cellWidth: 80,
          halign: 'left'
        },
        3: {
          cellWidth: 80,
          halign: 'left'
        },
        4: {
          cellWidth: 70,
          halign: 'center'
        },
        5: {
          cellWidth: 70,
          halign: 'center'
        },
        6: {
          cellWidth: 90,
          halign: 'right'
        },
        7: {
          cellWidth: 90,
          halign: 'right'
        },
        8: {
          cellWidth: 90,
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

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  getJsonData() {
    this.tableData = [];
    if (this.paymentDue != undefined) {
      this.paymentDue.forEach((item) => {
        let element = {
          BillNumber: item.billNumber,
          OwnerName: item.ownerName,
          AccountNumber: item.accountNumber,
          EntityType: item.entityType,
          UnitNumber: item.unitNumber,
          BillDate: this.date.transform(item.billDate, 'yyyy-MM-dd'),
          DueDate: this.date.transform(item.dueDate, 'yyyy-MM-dd'),
          BillAmount: item.billAmountLocal,
          CreditNoteAmount: item.creditNoteAmountLocal,
          PaidAmount: item.paidLocal,
          PaymentDue: item.toPayLocal
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    if (this.paymentDue && this.paymentDue.length > 0) {
      this.getJsonData();
      if (this.tableData != undefined) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'PaymentDue.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }


  // onPrintPdf() 
  // {
  //   if (this.selectedRows && this.selectedRows.length)
  //   {
  //     this.selectedRows.forEach(row => {
  //       this.downloadReport(row);
  //     })
  //   }
  // }


  // downloadReport(paymentDue: BillMaster[]) {
  //   let row: any[] = [];
  //   let firstTableRows: any[] = [];
  //   let secondTableRows: ListData[] = [];
  //   let thirdTableRows: any[] = [];
  //   let fourthTableRows: ListData[] = [];
  //   let fifthTableRows: any[] = [];
  //   let sixthTableRows: ListData[] = [];
  //   let firstTableCol = [];
  //   let thirdTableCol = [];

  //   const title = 'Receipt';

  //   fifthTableRows.push(
  //     {
  //       label: 'Bill Number:',
  //       value: paymentDue.billNumber
  //     },
  //     {
  //       label: 'Bill Date:',
  //       value: paymentDue.billDateLocal
  //     },
  //     {
  //       label: 'Due Date:',
  //       value: paymentDue.dueDateLocal
  //     },
  //     {
  //       label: 'Owner/Tenant Name:',
  //       value: paymentDue.ownerName
  //     },
  //     {
  //       label: 'Unit Number:',
  //       value: paymentDue.unitNumber
  //     } 
  //   );


  //   // let totalAmount = 0;
  //   // payment.billMasters.forEach(x => {
  //   //   totalAmount += x.billAmount;
  //   // })

  //   const balanceAmount = paymentDue.toPay;   //totalAmount - payment.paid;

  //   secondTableRows.push(
  //     {
  //       label: 'Total Outstanding Amount :',
  //       value: this.currency.transform(paymentDue.billAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
  //     },
  //     {
  //       label: 'Received Payments :',
  //       value: paymentDue.paidLocal
  //     },
  //     {
  //       label: '',
  //       value: ''
  //     },
  //     {
  //       label: 'Balance Outstanding :',
  //       value: this.currency.transform(balanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
  //     }
  //   );

  //   this.getReport(paymentDue, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  // }


  // getReport(data: BillMaster, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

  //   const totalPagesExp = "1";
  //   var img = new Image()
  //   img.src = 'assets/img/' + data.client.photo
  //   var img1 = new Image()
  //   img1.src = 'assets/img/lu.JPG'
  //   let pdf = new jsPDF({
  //     orientation: "portrait",
  //     unit: "pt",
  //     format: "letter"
  //   });

  //   pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
  //   let startX = 10;
  //   let startY = 30;
  //   pdf.setFontSize(30);
  //   pdf.addImage(img, 'png', 5, 5, 190, img.height);
  //   pdf.addImage(img1, 'png', 547, 10, 56, 56);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(14);
  //   pdf.setFont("Cambria");
  //   pdf.text("PAYMENT RECEIPT", startX + 250, startY);
  //   pdf.setFontSize(9);
  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFont('Cambria', 'bold');
  //   pdf.text(data.client.clientName, startX, startY + 30);
  //   pdf.setFont('Cambria', 'normal');
  //   pdf.text("TRN: " + data.client.trnNo, startX, startY + 40);
  //   pdf.text("PO Box " + data.client.addresses[0].zipPostalCode, startX, startY + 50);
  //   pdf.text(data.client.addresses[0].address1 + ',' + data.client.addresses[0].country, startX, startY + 60);
  //   pdf.text("Phone: " + data.client.phoneNo, startX, startY + 70);
  //   pdf.text("Email: " + data.client.email + ',' + ' Web: ' + data.client.website, startX, startY + 80);
  //   pdf.setFillColor(241, 241, 244);
  //   pdf.setDrawColor(206, 203, 203);
  //   pdf.rect(10, startY + 90, 250, 90, 'FD');
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(12);
  //   pdf.text(data.ownerName.toUpperCase(), startX + 10, startY + 105);
  //   pdf.text("CUSTOMER TRN: " + data.trn, startX + 10, startY + 125);
  //   pdf.text("unit #" + data?.unitNumber, startX + 10, startY + 140);
  //   pdf.setFontSize(10);
  //   pdf.text(data?.clientName, startX + 10, startY + 155);
  //   pdf.text("Al Barsha 1, Dubai, UAE", startX + 10, startY + 170);
  //   pdf.setFontSize(9);


  //   const autoTable = 'autoTable';
  //   pdf[autoTable]('', fifthTableRows, {
  //     startX: startX + 200,
  //     startY: startY + 90,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { left: startX + 390 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 100,
  //         halign: 'left'
  //       },
  //       1: {
  //         cellWidth: 100,
  //         halign: 'right'
  //       }
  //     },
  //     didParseCell: function (fourthTableRows) {
  //       const col = fourthTableRows.column.index;
  //       if (col == 0 || col == 1) {
  //         fourthTableRows.cell.styles.rowHeight = 1;
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0]
  //     }
  //   });

  //   const firstTableEndY = Number(pdf[autoTable].previous.finalY);   //this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


  //   var pageContent = function (data) {
  //     // HEADER

  //     // FOOTER
  //     var str = "Page " + data.pageCount;
  //     // Total page number plugin only available in jspdf v1.0+
  //     if (typeof pdf.putTotalPages === 'function') {
  //       str = str + " of " + totalPagesExp;
  //     }
  //     pdf.setFontSize(9);
  //     var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
  //     pdf.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
  //   };


  //   pdf.setLineWidth(.1);
  //   pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(10);
  //   pdf.text("Thank you for using Logic Utilities Payment Services.", startX + 10, firstTableEndY + 20);
  //   pdf.text("We confirm receipt of your payment.", startX + 10, firstTableEndY + 30);
  //   pdf.text("Please see the below details for your reference.", startX + 10, firstTableEndY + 40);
  //   pdf.setTextColor(0, 0, 0);

  //   pdf[autoTable]('', secondTableRows, {
  //     startX: 300,
  //     startY: firstTableEndY + 50,
  //     styles: {
  //       overflow: 'linebreak',
  //       cellWidth: 'wrap',
  //       fontSize: 9,
  //       cellPadding: 4,
  //       overflowColumns: 'linebreak',
  //       lineColor: [0, 0, 0]
  //     },
  //     margin: { left: startX + 100 },
  //     theme: 'grid',
  //     tableWidth: 'auto',
  //     cellWidth: 'wrap',
  //     columnStyles: {
  //       0: {
  //         cellWidth: 180,
  //         halign: 'left'
  //       },
  //       1: {
  //         cellWidth: 100,
  //         halign: 'right'
  //       }
  //     },
  //     headStyles: {
  //       lineWidth: 0.1,
  //       lineColor: [0, 0, 0],
  //       halign: 'center'
  //     }
  //   });

  //   pdf.setTextColor(0, 0, 0);

  //   const thirdTableEndY = Number(pdf[autoTable].previous.finalY);   //this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

  //   pdf.setTextColor(255, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is 45 days or more in arrears.", startX + 310, thirdTableEndY + 20);
  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFontSize(12);
  //   pdf.text("USAGE TIPS to reduce consumption:", startX, thirdTableEndY + 80);
  //   pdf.text("Please Try to:", startX, thirdTableEndY + 100);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("- Keep filters clean", startX + 20, thirdTableEndY + 110);
  //   pdf.text("- Set thermostats between 23C and 25C", startX + 20, thirdTableEndY + 120);
  //   pdf.text("- Keep vents unblocked", startX + 20, thirdTableEndY + 130);
  //   pdf.text("- Keep doors and windows closed", startX + 20, thirdTableEndY + 140);
  //   pdf.text("- Undertake regular maintenance of the system", startX + 20, thirdTableEndY + 150);
  //   pdf.setTextColor(25, 118, 210);
  //   pdf.setFontSize(12);
  //   pdf.text("Please Do Not:", startX, thirdTableEndY + 170);
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setFontSize(9);
  //   pdf.text("- Set thermostats to 20C or lower", startX + 20, thirdTableEndY + 180);
  //   pdf.text("- Block vents", startX + 20, thirdTableEndY + 190);
  //   pdf.text("- Leave doors and windows open", startX + 20, thirdTableEndY + 200);
  //   pdf.text("- Leave heat producing appliances near thermostats", startX + 20, thirdTableEndY + 210);


  //   pdf.setFillColor(119, 183, 11);
  //   var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
  //   pdf.rect(startX + 310, thirdTableEndY + 60, 280, pageHeight - 80 - (thirdTableEndY + 60), 'FD');
  //   pdf.setFont("Comic Sans");
  //   pdf.setTextColor(255, 255, 255);
  //   pdf.setFontSize(16);
  //   const boldText = 'ADVERTISE WITH US';
  //   pdf.text(boldText, startX + 350, thirdTableEndY + 80);
  //   const boldTextWidth = pdf.getTextWidth(boldText);
  //   pdf.setLineWidth(.1);
  //   pdf.line(startX + 350, thirdTableEndY + 85, startX + 350 + boldTextWidth, thirdTableEndY + 85);
  //   pdf.setFontSize(9);
  //   pdf.text("For advertisement, contact at", startX + 380, thirdTableEndY + 95);
  //   pdf.text("800 Logic (56442)", startX + 380, thirdTableEndY + 105);
  //   pdf.text("enquiry@logicutilities.com", startX + 380, thirdTableEndY + 115);
  //   pdf.text("www.logicutilities.com", startX + 380, thirdTableEndY + 125);

  //   pdf.setTextColor(0, 0, 0);
  //   pdf.setLineWidth(.1);
  //   pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
  //   pdf.text("For any enquiries, write to us enquiry@logicutilities.com \nor Logon to www.logicutilites.com", startX, pageHeight - 60);
  //   pdf.setTextColor(255, 0, 0);
  //   pdf.setFont('bold');
  //   const footerText = "Notice:";
  //   const footerTextWidth = pdf.getTextWidth(footerText);
  //   pdf.text(footerText, startX + 330, pageHeight - 60);
  //   pdf.setFont('none');
  //   pdf.setTextColor(0, 0, 0);
  //   pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 330 + footerTextWidth, pageHeight - 60);
  //   pdf.text("and disconnection.", startX + 330, pageHeight - 50);
  //   pdf.text("You can log onto www.logicutilites.com to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 330, pageHeight - 40);

  //   //for adding total number of pages // i.e 10 etc
  //   if (typeof pdf.putTotalPages === 'function') {
  //     pdf.putTotalPages(totalPagesExp);
  //   }
  //   pdf.save(title + '.pdf');
  // }

}
