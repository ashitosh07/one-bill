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
import { from, Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Master } from '../../shared/models/master.model';
import { Refund } from '../../shared/models/refund.model';
import { Tenant } from '../../shared/models/tenant.model';
import * as moment from 'moment';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { TemplateContent } from '../../shared/models/template-content.model';
import { TemplateService } from '../../shared/services/template.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '@syncfusion/ej2-angular-navigations';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';


@Component({
  selector: 'fury-create-refund',
  templateUrl: './create-refund.component.html',
  styleUrls: ['./create-refund.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateRefundComponent implements OnInit {
  subject$: ReplaySubject<Refund[]> = new ReplaySubject<Refund[]>(1);
  data$: Observable<Refund[]> = this.subject$.asObservable();
  clientId: number;
  fromDate: string;
  toDate: string;
  fromDateParam: Date;
  toDateParam: Date;
  refunds: Refund[];
  tenants: Tenant[] = [];
  filteredTenants: Tenant[];
  currencyFormat = '';
  dateFormat = '';
  roundOffFormat = '';
  ownerId: number;
  tenantId: number = 0;
  form: FormGroup;
  showMoreControls: boolean = false;
  isData: boolean = false;
  tableData: any[];

  //@Input() tenants: Tenant[] = [];
  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Refund Number', property: 'refundNumber', visible: true, isModelProperty: true },
    { name: 'Refund Date', property: 'refundDateLocal', visible: true, isModelProperty: true },
    { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
    { name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    { name: 'Refund Amount', property: 'refundAmountLocal', visible: true, isModelProperty: false, columnAlign: { 'text-align': 'right' } },
    { name: 'Remarks', property: 'remarks', visible: true, isModelProperty: true },
    { name: 'Actions', property: 'actions', visible: true }
  ] as ListColumn[];
  pageSize = 8;
  dataSource: MatTableDataSource<Refund> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if ((this.sort) && (this.dataSource)) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(private billService: BillService,
    private billSettlementService: BillSettlementService,
    private currency: CurrencyPipe,
    private date: DatePipe, private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private templateService: TemplateService,
    private decimalPipe: DecimalPipe,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.roundOffFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.route.queryParams.subscribe((params) => {
      if (params.id) {
        this.tenantId = parseInt(params.id);
      }
    });
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.onGetTenants();
    this.ownerId = parseInt(this.cookieService.get('ownerId'));
    if (this.ownerId > 0) {
      this.getRefundReport(this.fromDate, this.toDate);
    }
    this.form = this.fb.group({
      tenantName: ['']
    });

    this.form.controls.tenantName.valueChanges.subscribe(newTenant => {
      this.filteredTenants = this.filterTenant(newTenant);
    });
  }

  filterTenant(name: string) {
    if ((name != '') && (name != undefined)) {
      return this.tenants.filter(tenant =>
        tenant.ownerName.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }
    else {
      return this.tenants;
    }
  }

  getRefundReport(fromDate, toDate) {

    fromDate = fromDate && fromDate !== '' ? moment(fromDate).format('YYYY-MM-DD') : '';
    toDate = toDate && toDate !== '' ? moment(toDate).format('YYYY-MM-DD') : '';

    let ownerTenantId = this.ownerId == 0 ? this.tenantId : this.ownerId;
    this.billService.GetRefundReport(fromDate, toDate, ownerTenantId, this.clientId).subscribe((refunds: Refund[]) => {
      this.refunds = refunds
      this.dateFormat = getClientDataFormat('DateFormat');
      this.roundOffFormat = getClientDataFormat('RoundOff');
      this.currencyFormat = getClientDataFormat('Currency');
      refunds.forEach(x => {
        x.refundAmountLocal = this.currency.transform(x.refundAmount.toString(), this.currencyFormat.toString(), true, this.roundOffFormat);
        x.refundDateLocal = this.date.transform(x.refundDate.toString(), this.dateFormat.toString());
        x.paymentAmountLocal = this.currency.transform(x.paymentAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
      })
      this.subject$.next(refunds);
      this.refunds = refunds
      this.isData = refunds.length > 0 ? true : false;
    }
      // error: (err) => {
      //   this.notificationMessage('Refunds Not Found.', 'red-snackbar');
      // }
    );

    this.dataSource = new MatTableDataSource(this.refunds);
    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((refunds) => {
      this.refunds = refunds;
      this.dataSource.data = refunds;
    });
    this.ngAfterViewInit();
  }


  onGetTenants() {
    this.billSettlementService.getTenantsDetails(this.clientId, 2).subscribe(data => {
      this.tenants = data;
      this.filteredTenants = data;
      if ((this.tenantId > 0) && (this.tenants)) {
        let tenant = this.tenants.filter((item) => item.id == this.tenantId);
        if (tenant.length > 0) {
          this.form.controls.tenantName.setValue(tenant[0].ownerName)
          this.getRefundReport(this.fromDate, this.toDate);
        }
      }
    });
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

  getRefund() {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.fromDate = this.fromDate == '' ? '' : this.fromDate;
    this.toDate = this.toDate == '' ? '' : this.toDate;
    if (((this.fromDate != '') && (this.toDate != '')) || (this.tenantId > 0)) {
      this.getRefundReport(this.fromDate, this.toDate);
    }
    else {
      this.notificationMessage("Invalid Parameters.", 'yellow-snackbar');
    }
  }

  selectTenant(event: any) {
    this.tenants.forEach(tenant => {
      if (tenant.ownerName === event.option.value) {
        this.tenantId = tenant.id;
      }
    });
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  onPrintPdf(row) {
    this.downloadReport(row);
  }

  downloadReport(refund: Refund) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [];
    let thirdTableCol = [];

    const title = 'Refund';

    fifthTableRows.push(
      {
        label: 'Refund Number:',
        value: refund.refundNumber
      },
      {
        label: 'Refund Date:',
        value: refund.refundDateLocal
      },
      {
        label: 'Account Number:',
        value: refund.accountNumber
      },
      {
        label: 'Meter Number:',
        value: ''
      },
      {
        label: 'Unit Number:',
        value: ''
      },
      {
        label: 'Mode of payment:',
        value: refund.paymentMode
      }
    );


    const balanceAmount = refund.paymentAmount - refund.refundAmount;

    secondTableRows.push(
      {
        label: 'Received Payments :',
        value: refund.paymentAmountLocal
      },
      {
        label: 'Refund Amount :',
        value: refund.refundAmountLocal
      },
      {
        label: '',
        value: ''
      },
      {
        label: 'Balance Amount :',
        value: this.currency.transform(balanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
      }
    );

    this.getReport(refund, firstTableCol, firstTableRows, secondTableRows, thirdTableCol, thirdTableRows, fourthTableRows, fifthTableRows, sixthTableRows, title);
  }

  getReport(data: Refund, firstTableCol: any[], firstTableRows: any[], secondTableRows: any[], thirdTableCol: any[], thirdTableRows: any[], fourthTableRows: any[], fifthTableRows: any[], sixthTableRows: any[], title: string) {

    const totalPagesExp = "1";
    var img = new Image()
    img.src = 'assets/img/' + data.client.photo
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
    pdf.addImage(img, 'png', 5, 5, 190, img.height);
    pdf.addImage(img1, 'png', 547, 10, 56, 56);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria");
    pdf.text("REFUND RECEIPT", startX + 250, startY);
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
    pdf.text(data.ownerName.toUpperCase(), startX + 10, startY + 105);
    pdf.text("CUSTOMER TRN: ", startX + 10, startY + 125);
    pdf.text("unit #", startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text('', startX + 10, startY + 155);
    pdf.text("Al Barsha 1, Dubai, UAE", startX + 10, startY + 170);
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

    const firstTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));


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


    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Thank you for using Logic Utilities Payment Services.", startX + 10, firstTableEndY + 20);
    pdf.text("We confirm receipt of your payment.", startX + 10, firstTableEndY + 30);
    pdf.text("Please see the below details for your reference.", startX + 10, firstTableEndY + 40);
    pdf.setTextColor(0, 0, 0);

    pdf[autoTable]('', secondTableRows, {
      startX: 300,
      startY: firstTableEndY + 50,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9,
        cellPadding: 4,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { left: startX + 100 },
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

    pdf.setTextColor(0, 0, 0);

    const thirdTableEndY = Number(this.decimalPipe.transform(pdf[autoTable].previous.finalY, '1.0-0'));

    pdf.setTextColor(255, 0, 0);
    pdf.setFontSize(9);
    pdf.text("Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is 45 days or more in arrears.", startX + 310, thirdTableEndY + 20);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("USAGE TIPS to reduce consumption:", startX, thirdTableEndY + 80);
    pdf.text("Please Try to:", startX, thirdTableEndY + 100);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Keep filters clean", startX + 20, thirdTableEndY + 110);
    pdf.text("- Set thermostats between 23C and 25C", startX + 20, thirdTableEndY + 120);
    pdf.text("- Keep vents unblocked", startX + 20, thirdTableEndY + 130);
    pdf.text("- Keep doors and windows closed", startX + 20, thirdTableEndY + 140);
    pdf.text("- Undertake regular maintenance of the system", startX + 20, thirdTableEndY + 150);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.text("Please Do Not:", startX, thirdTableEndY + 170);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text("- Set thermostats to 20C or lower", startX + 20, thirdTableEndY + 180);
    pdf.text("- Block vents", startX + 20, thirdTableEndY + 190);
    pdf.text("- Leave doors and windows open", startX + 20, thirdTableEndY + 200);
    pdf.text("- Leave heat producing appliances near thermostats", startX + 20, thirdTableEndY + 210);


    pdf.setFillColor(119, 183, 11);
    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    pdf.rect(startX + 310, thirdTableEndY + 60, 280, pageHeight - 80 - (thirdTableEndY + 60), 'FD');
    pdf.setFont("Comic Sans");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    const boldText = 'ADVERTISE WITH US';
    pdf.text(boldText, startX + 350, thirdTableEndY + 80);
    const boldTextWidth = pdf.getTextWidth(boldText);
    pdf.setLineWidth(.1);
    pdf.line(startX + 350, thirdTableEndY + 85, startX + 350 + boldTextWidth, thirdTableEndY + 85);
    pdf.setFontSize(9);
    pdf.text("For advertisement, contact at", startX + 380, thirdTableEndY + 95);
    pdf.text("800 Logic (56442)", startX + 380, thirdTableEndY + 105);
    pdf.text("enquiry@logicutilities.com", startX + 380, thirdTableEndY + 115);
    pdf.text("www.logicutilities.com", startX + 380, thirdTableEndY + 125);

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


  onSendEmail() {
    if (this.refunds) {
      const templateContent: TemplateContent = {
        notificationType: 'EMAIL',
        templateType: 'Invoice',
        templateName: 'Invoice',
        billMasterDetails: this.refunds
      };
      // this.templateService.emailInvoiceTemplate(templateContent).subscribe(
      //   response => {
      //     this.notificationMessage("Email send successfully.","green-snackbar");
      //   }
      // );
    }
    else {
      this.notificationMessage("Refund Data not available.", "yellow-snackbar")
    }
  }

  onPrintSummary() {
    if ((this.refunds) && (this.refunds.length > 0)) {
      this.downloadSummary(this.refunds);
    }
    else {
      this.notificationMessage("Refund Data not available.", "yellow-snackbar")
    }
  }

  downloadSummary(refunds: Refund[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Refund Number',
      'Refund Date',
      'Account No.',
      'Unit',
      'Refund Amount',
      'Remarks'];

    let totalRefundAmount = 0;

    for (let a = 0; a < refunds.length; a++) {
      row.push(refunds[a].refundNumber)
      row.push(refunds[a].refundDateLocal)
      row.push(refunds[a].accountNumber)
      row.push(refunds[a].unitNumber)
      row.push(refunds[a].refundAmountLocal)
      row.push(refunds[a].remarks)
      firstTableRows.push(row);

      totalRefundAmount += refunds[a].refundAmount;

      row = [];
    }

    const title = 'Refund Report';

    secondTableRows.push({ label: 'Total Amount', value0: totalRefundAmount });

    for (let a = 0; a < secondTableRows.length; a++) {
      row.push('')
      row.push('')
      row.push('')
      row.push(secondTableRows[a].label);
      row.push(this.currency.transform(secondTableRows[a].value0, this.currencyFormat.toString(), true, this.roundOffFormat))
      row.push('')
      //row.push(this.currencyFormat.transform(secondTableRows[a].value2, this.currency.toString(), true, this.roundOffFormat))
      firstTableRows.push(row);
      row = [];
    }

    this.getSummaryReport(this.refunds, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: Refund[], firstTableCol: any[], firstTableRows: any[], title: string) {
    const totalPagesExp = "1";
    var img = new Image()
    img.src = 'assets/img/logo.png'
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    pdf.addImage(img, 'png', 5, 5, 190, img.height);
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(9);
    pdf.setFont("Cambria");
    pdf.text("PO Box 127404", startX + 250, startY - 10);
    pdf.text("Office 201, Al Zarouni Business Centre", startX + 250, startY);
    pdf.text("Al Barsha 1, Dubai, UAE", startX + 250, startY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Phone:800 Logic (56442)", startX + 450, startY - 10);
    pdf.text("Email: ", startX + 450, startY);
    pdf.setTextColor(25, 118, 210);
    pdf.text("enquiry@logicutilities.com", startX + 475, startY);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Web: ", startX + 450, startY + 10);
    pdf.setTextColor(25, 118, 210);
    pdf.text("www.logicutilities.com", startX + 475, startY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setTextColor(25, 118, 210);
    pdf.text("Logic Utilities District Cooling Services LLC", startX, startY + 40);
    pdf.text("TRN: 100567483100003", startX, startY + 60)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    if ((this.fromDate != '') && (this.toDate != ''))
      pdf.text("Refunds From " + moment(this.fromDate).format('YYYY-MM-DD') + " To " + moment(this.toDate).format('YYYY-MM-DD'), pdf.internal.pageSize.width / 2 - 80, startY + 80)
    else
      pdf.text("Refunds Report", pdf.internal.pageSize.width / 2 - 20, startY + 40)
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
      margin: { top: 100, left: 30 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 80,
          halign: 'left'
        },
        1: {
          cellWidth: 80,
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
          cellWidth: 100,
          halign: 'right'
        },
        5: {
          cellWidth: 120,
          halign: 'center'
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

  getJsonData() {
    this.tableData = [];
    if (this.refunds != undefined) {
      this.refunds.forEach((item) => {
        let element = {
          RefundNumber: item.refundNumber,
          RefundDate: this.date.transform(item.refundDate, 'yyyy-MM-dd'),
          OwnerName: item.ownerName,
          UnitNumber: item.unitNumber,
          refundAmount: item.refundAmountLocal,
          Remarks: item.remarks
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    if (this.refunds && this.refunds.length > 0) {
      this.getJsonData();
      if (this.tableData != undefined) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Refund.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

}
