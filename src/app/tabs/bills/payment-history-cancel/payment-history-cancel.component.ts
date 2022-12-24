import { Component, OnInit } from '@angular/core';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { ManageParams } from '../../shared/models/manage-params.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillService } from '../../shared/services/bill.service';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Payment } from '../../shared/models/payment.model';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TemplateService } from '../../shared/services/template.service';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getClientDataFormat, stringIsNullOrEmpty } from '../../shared/utilities/utility';
import { CookieService } from 'ngx-cookie-service';
import { PDFDocument } from 'pdf-lib';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { ListData } from '../../shared/models/list-data.model';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
@Component({
  selector: 'app-payment-history-cancel',
  templateUrl: './payment-history-cancel.component.html',
  styleUrls: ['./payment-history-cancel.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class PaymentHistoryCancelComponent implements OnInit {

  clientId: number;
  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  columns: any[] = [];
  innerColumns: any[] = [];
  columnNames: ListColumn[] = [];
  payments: Payment[] = [];
  paymentModes: any[] = [{ label: 'Select', value: 0 }];
  selectedRows: Payment[] = [];
  manageParams: ManageParams = {};
  innerTableName: string = 'billMasters';
  billAmount = '';
  receivedAmount = '';
  filePath = '';
  pdfsToMerge: any[] = [];
  dateFormat = '';
  currencyFormat = '';
  roundOffFormat = '';

  paymentNumberColumnName = 'Payment No';
  accountNumberColumnName = 'Account Number';
  paymentDateColumnName = 'Payment Date';
  paymentModeColumnName = 'Payment Mode';
  refNoColumnName = 'Ref No';
  tenantColumnName = 'Customer Name';
  receivedAmountColumnName = 'Received Amount';
  reasonColumnName = 'Reason';

  billNumberColumnName = 'Bill No';
  billDateCoulmnName = 'BillDate';
  tenantNameColumnName = 'Tenant Name';
  unitColumnName = 'Unit';
  fromDateColumnName = 'From Date';
  toDateColumnName = 'To Date';
  dueDateColumnName = 'Due Date';
  billAmountColumnName = 'Bill Amount'
  billDateColumnName = 'BillDate';

  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private date: DatePipe,
    private currency: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private cookieService: CookieService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private templateService: TemplateService,
    private envService: EnvService) {
    this.envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currencyFormat = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundOffFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;

  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.onGetPaymentModes();
    this.createColumnNames();
    this.createGridColumns();
    this.createInnerGridColumns();
  }

  createGridColumns() {
    this.columns = [
      'select',
      'paymentNumber',
      'paymentDateLocal',
      'paymentReference',
      'paymentMode',
      'accountNumber',
      'tenantName',
      'paymentAmountLocal',
      'cancelReason'
    ];
  }

  createInnerGridColumns() {
    this.innerColumns = [
      'billNumber',
      'billDateLocal',
      'unitNumber',
      'fromDateLocal',
      'toDateLocal',
      'dueDateLocal',
      'billAmountLocal'];
  }

  createColumnNames() {
    this.columnNames = [
      { name: this.paymentNumberColumnName, property: 'paymentNumber' },
      { name: this.paymentDateColumnName, property: 'paymentDateLocal' },
      { name: this.refNoColumnName, property: 'paymentReference' },
      { name: this.paymentModeColumnName, property: 'paymentMode' },
      { name: this.accountNumberColumnName, property: 'accountNumber' },
      { name: this.tenantColumnName, property: 'tenantName' },
      { name: this.receivedAmountColumnName, property: 'paymentAmountLocal', columnAlign: { 'text-align': 'right' } },
      { name: this.reasonColumnName, property: 'cancelReason' },
      { name: this.billNumberColumnName, property: 'billNumber' },
      { name: this.billDateColumnName, property: 'billDateLocal' },
      { name: this.unitColumnName, property: 'unitNumber' },
      { name: this.fromDateColumnName, property: 'fromDateLocal' },
      { name: this.toDateColumnName, property: 'toDateLocal' },
      { name: this.dueDateColumnName, property: 'dueDateLocal' },
      { name: this.billAmountColumnName, property: 'billAmountLocal', columnAlign: { 'text-align': 'right' } }] as ListColumn[];
  }


  onGetPaymentHistory(manageParams: ManageParams) {
    this.manageParams = manageParams;
    this.payments = [];
    this.billAmount = '';
    this.receivedAmount = '';
    let billAmount = 0;
    let receivedAmount = 0;
    manageParams.clientId = this.clientId;
    this.billService.getPaymentCancelHistory(manageParams).subscribe(
      payments => {
        this.dateFormat = getClientDataFormat('DateFormat');
        this.roundOffFormat = getClientDataFormat('RoundOff');
        this.currencyFormat = getClientDataFormat('Currency');
        payments.forEach(payment => {
          payment.paymentDateLocal = this.date.transform(payment.paymentDate.toString(), this.dateFormat.toString());
          payment.referenceDateLocal = this.date.transform(payment.referenceDate.toString(), this.dateFormat.toString());
          payment.paymentAmountLocal = this.currency.transform(payment.paymentAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
          payment.advanceAmountLocal = this.currency.transform(payment.advanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
          payment.billMasters.forEach(billMaster => {
            if (billMaster.billDate) {
              billMaster.billDateLocal = this.date.transform(billMaster.billDate.toString(), this.dateFormat.toString());
            }
            if (billMaster.billAmount) {
              billMaster.billAmountLocal = this.currency.transform(billMaster.billAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
            }
            if (billMaster.fromDate) {
              billMaster.fromDateLocal = this.date.transform(billMaster.fromDate.toString(), this.dateFormat.toString());
            }
            if (billMaster.toDate) {
              billMaster.toDateLocal = this.date.transform(billMaster.toDate.toString(), this.dateFormat.toString());
            }
            if (billMaster.dueDate) {
              billMaster.dueDateLocal = this.date.transform(billMaster.dueDate.toString(), this.dateFormat.toString());
            }
            if (billMaster.paid) {
              billMaster.paidLocal = this.currency.transform(billMaster.paid.toString(), this.currencyFormat.toString(), true, this.roundOffFormat);
            }
            billAmount = billAmount + billMaster.billAmount ?? 0;
          });
          receivedAmount = receivedAmount + payment.paymentAmount;
        });
        this.payments = payments;
        this.billAmount = this.currency.transform(billAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
        this.receivedAmount = this.currency.transform(receivedAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
      });
  }

  onGetPaymentModes() {
    this.paymentModes = [{ label: 'Select', value: 0 }];
    this.billSettlementService.getPaymentModes().subscribe(paymentModes => {
      paymentModes.forEach(x => {
        this.paymentModes.push({ label: x.description, value: x.id });
      });
    });
  }

  async onPrintPdf() {
    //this.pdfsToMerge = [];
    if (this.selectedRows && this.selectedRows.length) {
      // let pdfCount = 0;
      // this.selectedRows.forEach(row => {
      //   this.downloadReport(row);
      //   pdfCount += 1;
      // })
      // if (pdfCount === this.selectedRows.length) {
      //   const mergedPdf = await PDFDocument.create();
      //   for (const pdfCopyDoc of this.pdfsToMerge) {
      //     const pdfBytes = await fetch(pdfCopyDoc).then(res => res.arrayBuffer())
      //     //const pdfBytes = fs.readFileSync(pdfCopyDoc);
      //     const pdf = await PDFDocument.load(pdfBytes);
      //     const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      //     copiedPages.forEach((page) => {
      //       mergedPdf.addPage(page);
      //     });
      //   }
      //   const mergedPdfFile = await mergedPdf.save();
      //   this.downloadFile(mergedPdfFile);
      // }
      this.receiptView(this.selectedRows);
    }
    else {
      this.notificationMessage('Please select Bills.', 'red-snackbar');
    }
  }

  receiptView(payments: Payment[]) {
    this.billService.receiptView(payments).subscribe({
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
    // const blob = new Blob([data], { type: 'application/pdf' });
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
  }

  downloadReport(payment: Payment) {
    let firstTableRows: any[] = [];
    let secondTableRows: ListData[] = [];
    let thirdTableRows: any[] = [];
    let fourthTableRows: ListData[] = [];
    let fifthTableRows: any[] = [];
    let sixthTableRows: ListData[] = [];
    let firstTableCol = [];
    let thirdTableCol = [];

    const title = 'Receipt';
    let invoiceNumber = '';
    let unitNumber = '';

    const uniqueBillNumbers = Array.from(new Set(payment.billMasters.map(x => x.billNumber)));
    const uniqueUnitNumbers = Array.from(new Set(payment.billMasters.map(x => x.unitNumber)));

    if (uniqueBillNumbers && uniqueBillNumbers.length) {
      uniqueBillNumbers.forEach(x => {
        invoiceNumber += x + ',';
      });
    }

    if (uniqueUnitNumbers && uniqueUnitNumbers.length) {
      uniqueUnitNumbers.forEach(x => {
        unitNumber += x + ',';
      });
    }

    fifthTableRows.push(
      {
        label: 'Receipt Number:',
        value: payment.paymentNumber
      },
      {
        label: 'Receipt Date:',
        value: payment.paymentDateLocal
      },
      {
        label: 'Account Number:',
        value: payment.accountNumber
      },
      {
        label: 'Invoice Number:',
        value: invoiceNumber.trim().indexOf(',') === 0 ? invoiceNumber.trim().slice(1).slice(0, -1) : invoiceNumber.trim().slice(0, -1)
      },
      {
        label: 'Unit Number:',
        value: unitNumber.trim().indexOf(',') === 0 ? unitNumber.trim().slice(1).slice(0, -1) : unitNumber.trim().slice(0, -1)
      },
      {
        label: 'Mode of payment:',
        value: payment.paymentMode
      }
    );

    let paidAmount = 0;
    payment.billMasters.forEach(x => {
      paidAmount += x.paid;
    })

    const balanceAmount = payment.outStandingAmount - paidAmount;

    secondTableRows.push(
      {
        label: 'Total Outstanding Amount :',
        value: this.currency.transform(payment.outStandingAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
      },
      {
        label: 'Received Payments :',
        value: payment.paymentAmountLocal
      },
      {
        label: '',
        value: ''
      },
      {
        label: 'Balance Outstanding :',
        value: this.currency.transform(balanceAmount, this.currencyFormat.toString(), true, this.roundOffFormat)
      }
    );

    this.getReport(payment, secondTableRows, fifthTableRows);
  }


  addImage(pdf: jsPDF, data: Payment) {
    try {
      if (data && data.billMasters && data.billMasters.length && data.billMasters[0] && data.billMasters[0].client && data.billMasters[0].client.imageProperties && data.billMasters[0].client.imageProperties.length) {
        const imageProperty: ImageProperty = data.billMasters[0].client.imageProperties.find(x => x.imageType.trim().toLowerCase() === 'receipt');
        if (imageProperty) {
          var img = new Image()
          img.src = this.filePath + '/uploads/' + data?.billMasters[0].client?.photo; //'assets/img/' + data.client.photo
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

  getReport(data: Payment, secondTableRows: any[], fifthTableRows: any[]) {
    const totalPagesExp = "1";
    let pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });
    let companyName = stringIsNullOrEmpty(data?.billMasters[0]?.client?.website).split('.')[1];
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let startX = 10;
    let startY = 30;
    pdf.setFontSize(30);
    this.addImage(pdf, data);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont("Cambria", 'bold');
    pdf.text("CANCELLED PAYMENT RECEIPT", startX + 180, startY);
    pdf.setFont('Cambria', 'normal');
    pdf.setFontSize(14);
    startY = 37;
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.clientName).toUpperCase(), startX, startY + 20);
    startY = 44;
    pdf.setFontSize(10);
    pdf.text("TRN: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.trnNo), startX, startY + 30);
    pdf.text("PO Box " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.zipPostalCode), startX, startY + 40);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.location, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX, startY + 50);
    pdf.text("Phone: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX, startY + 60);
    pdf.text("Email: " + stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX, startY + 70);
    pdf.text('Web: ' + stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX, startY + 80);
    pdf.setFillColor(241, 241, 244);
    pdf.setDrawColor(206, 203, 203);
    pdf.rect(10, startY + 90, 250, 90, 'FD');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(stringIsNullOrEmpty(data?.tenantName).toUpperCase(), startX + 10, startY + 105);
    pdf.setFontSize(11);
    pdf.text("CUSTOMER TRN: " + stringIsNullOrEmpty(data?.trn), startX + 10, startY + 125);
    pdf.text("unit #" + stringIsNullOrEmpty(data?.billMasters[0]?.unitNumber), startX + 10, startY + 140);
    pdf.setFontSize(10);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.clientName), startX + 10, startY + 155);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0].client?.addresses[0]?.city, ',') + stringIsNullOrEmpty(data?.billMasters[0]?.client?.addresses[0]?.country, ','), startX + 10, startY + 170);
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




    pdf.setLineWidth(.1);
    pdf.line(5, firstTableEndY + 10, 607, firstTableEndY + 10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Thank you for using " + companyName + " payment services.", startX + 10, firstTableEndY + 30);
    pdf.text("We confirm receipt of your payment.", startX + 10, firstTableEndY + 40);
    pdf.text("Please see the below details for your reference.", startX + 10, firstTableEndY + 50);
    pdf.setTextColor(0, 0, 0);

    pdf[autoTable]('', secondTableRows, {
      startX: 300,
      startY: firstTableEndY + 60,
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
    pdf.text(`Note: A Late Fee will be applied after the due date. A Default Payment \nPenalty will be added to any unit that is ${data?.billMasters[0]?.penaltyAfter} days or more in arrears.`, startX + 310, thirdTableEndY + 20);
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
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.phoneNo), startX + 380, thirdTableEndY + 105);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.email), startX + 380, thirdTableEndY + 115);
    pdf.text(stringIsNullOrEmpty(data?.billMasters[0]?.client?.website), startX + 380, thirdTableEndY + 125);

    pdf.setTextColor(0, 0, 0);
    pdf.setLineWidth(.1);
    pdf.line(5, pageHeight - 70, 607, pageHeight - 70);
    pdf.text("For any enquiries, write to us " + data?.billMasters[0]?.client?.email ?? '' + "\n or Logon to " + data.billMasters[0]?.client?.website ?? '', startX, pageHeight - 60);
    pdf.setTextColor(255, 0, 0);
    pdf.setFont('bold');
    const footerText = "Notice:";
    const footerTextWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, startX + 320, pageHeight - 60);
    pdf.setFont('none');
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pay your bills before due date to avoid late payment surcharge", startX + 320 + footerTextWidth, pageHeight - 60);
    pdf.text("and disconnection.", startX + 320, pageHeight - 50);
    pdf.text("You can log onto " + data?.billMasters[0]?.client?.website + " to pay your invoices \nTerms & Conditions for Supply of Utility Services", startX + 320, pageHeight - 40);

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

  onSendEmail() {
    if (this.selectedRows) {
      this.templateService.emailReceiptTemplate(this.selectedRows).subscribe(
        response => {

        }
      );
    }
  }



  onSelectedRows(selectedRows: Payment[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }
}
