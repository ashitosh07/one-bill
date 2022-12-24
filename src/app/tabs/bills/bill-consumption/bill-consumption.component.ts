import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManageParams } from '../../shared/models/manage-params.model';
import { BillSettlementService } from '../../shared/services/billsettlement.service';
import { BillService } from '../../shared/services/bill.service';
import { BillSettlement } from '../../shared/models/bill-Settlement.model';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { Bill } from '../../shared/models/bill.model';
import { BillConsumptionDetailsComponent } from './bill-consumption-details/bill-consumption-details.component';
import { BillConsumptionToolbarComponent } from './bill-consumption-toolbar/bill-consumption-toolbar.component';
import { ConsumptionAlertRange } from '../../shared/models/consumption-alert-range.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-bill-consumption',
  templateUrl: './bill-consumption.component.html',
  styleUrls: ['./bill-consumption.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class BillConsumptionComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  clientId: number;

  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  utilityTypes: any[] = [];
  manageParams: ManageParams;
  failedBills: Bill[] = [];
  consumptionAlerts: ConsumptionAlertRange[] = [];
  isBillPeriodEnabled: boolean = false;
  roundFormat ='';
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff');
  consumptiondecimalPlaces: number;
  tableData: any[] = [];
  message: string;
  disableSaveButton: boolean = true;
  isData: boolean = false;

  @ViewChild(BillConsumptionDetailsComponent, { static: true }) billConsumptionDetailsComponent: BillConsumptionDetailsComponent;
  @ViewChild(BillConsumptionToolbarComponent, { static: true }) billConsumptionToolbarComponent: BillConsumptionToolbarComponent;


  constructor(
    private billService: BillService,
    private billSettlementService: BillSettlementService,
    private snackbar: MatSnackBar,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService:EnvService) {
  this.roundFormat = getClientDataFormat('RoundOff') ??  envService.roundOffFormat;

     }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.getBillPeriods();
    this.getUtilities();
    this.getConsumptionAlertRanges();
  }

  disable(value) {
    this.disableSaveButton = value;
  }

  getConsumptionAlertRanges() {
    this.consumptionAlerts = [];
    const manageParams: ManageParams = { clientId: this.clientId };
    if (manageParams) {
      this.billSettlementService.getConsumptioSavedAlertDetails(manageParams).subscribe(
        (consumptionAlerts: ConsumptionAlertRange[]) => {
          if (consumptionAlerts && consumptionAlerts.length) {
            this.consumptionAlerts = consumptionAlerts;
          }
          else {
            this.consumptionAlerts = [];
          }
        });
    }
  }

  onSearch(manageParams: ManageParams) {
    if (!manageParams) {
      this.notificationMessage("Invalid Parameters.", 'yellow-snackbar');
      return;
    }
    this.manageParams = manageParams;
    this.manageParams.clientId = this.clientId;
    this.billConsumptionDetailsComponent.failedBills = [];
    this.isData = false;
    this.message = '';
    this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', parseInt(manageParams.utilityTypeId));

    if (this.consumptionRoundOffFormat && this.consumptionRoundOffFormat != '') {
      this.consumptiondecimalPlaces = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
    }
    this.billSettlementService.getConumptionAlertDetails(manageParams).subscribe(
      (bills: Bill[]) => {
        if (bills && bills.length) {
          let index: number = 0;
          bills.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
          bills.forEach(element => {
            element.id = index += 1;
            element.consumption = Number(this.decimalPipe.transform(element.consumption, this.consumptionRoundOffFormat.toString()).replace(',', ''));
            element.consumptionLocal = element.consumption.toFixed(this.consumptiondecimalPlaces) + ' ' + element.consumptionUnit;
            element.consumptionDifference = Number(this.decimalPipe.transform(element.consumptionDifference, this.consumptionRoundOffFormat.toString()).replace(',', ''));
            element.consumptionDifferenceLocal = element.consumptionDifference.toFixed(this.consumptiondecimalPlaces) + ' ' + element.consumptionUnit;
            element.averageConsumption = Number(this.decimalPipe.transform(element.averageConsumption, this.consumptionRoundOffFormat.toString()).replace(',', ''));
            element.averageConsumptionLocal = element.averageConsumption.toFixed(this.consumptiondecimalPlaces) + ' ' + element.consumptionUnit;
            element.consumptionDifferencePercentageLocal = element.consumptionDifferencePercentage.toFixed(this.consumptiondecimalPlaces);
          });
          this.billConsumptionDetailsComponent.failedBills = bills;
          this.isData = true;
          this.message = manageParams.consumptionType + ' of ' + manageParams.utilityType + ' in comparison with ' + manageParams.percentage + '% buffer';
        }
        else {
          this.billConsumptionDetailsComponent.failedBills = [];
          this.isData = false;
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
    this.utilityTypes = [{ label: 'Select', value: 0 }];
    this.billService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        response.forEach(x => {
          this.utilityTypes.push({ label: x.description, value: x.id });
        });
      }
    });
  }

  onReset() {
    this.billConsumptionToolbarComponent.form.reset();
    this.billConsumptionToolbarComponent.billPeriodForm.reset();
    this.billConsumptionDetailsComponent.failedBills = [];
    this.billConsumptionToolbarComponent.form.controls.consumptionTypeId.setValue(0);
    this.billConsumptionToolbarComponent.form.controls.utilityTypeId.setValue(0);
    this.billConsumptionToolbarComponent.billPeriodForm.controls.fromBillPeriodId.setValue(0);
    this.billConsumptionToolbarComponent.billPeriodForm.controls.toBillPeriodId.setValue(0);
    this.getConsumptionAlertRanges();
  }

  onSave() {
    const consumptionTypeId = this.billConsumptionToolbarComponent.form.controls.consumptionTypeId.value;
    const utilityTypeId = this.billConsumptionToolbarComponent.form.controls.utilityTypeId.value;
    const optionId = this.billConsumptionToolbarComponent.optionId;
    let fromBillPeriodId = 0;
    let toBillPeriodId = 0;
    let percentage = 0;
    let fromDate: Date = null;
    let startDate: Date = null;
    let endDate: Date = null;
    if (optionId == '1') {
      fromBillPeriodId = this.billConsumptionToolbarComponent.billPeriodForm.controls.fromBillPeriodId.value;
      toBillPeriodId = this.billConsumptionToolbarComponent.billPeriodForm.controls.toBillPeriodId.value;
      percentage = this.billConsumptionToolbarComponent.billPeriodForm.controls.percentageBillPeriod.value;
    } else {
      fromDate = new Date(this.datePipe.transform(this.billConsumptionToolbarComponent.fromDate, 'yyyy-MM-dd'));
      startDate = new Date(this.datePipe.transform(this.billConsumptionToolbarComponent.startDate, 'yyyy-MM-dd'));
      endDate = new Date(this.datePipe.transform(this.billConsumptionToolbarComponent.endDate, 'yyyy-MM-dd'));
      percentage = this.billConsumptionToolbarComponent.percentageDatewise;
    }
    if (consumptionTypeId && utilityTypeId) {
      const consumptionRange: ConsumptionAlertRange = {
        consumptionTypeId: Number(consumptionTypeId),
        utilityTypeId: Number(utilityTypeId),
        fromBillPeriodId: Number(fromBillPeriodId),
        toBillPeriodId: Number(toBillPeriodId),
        fromDate: fromDate,
        startDate: startDate,
        endDate: endDate,
        percentage: Number(percentage ?? 0),
        clientId: Number(this.clientId)
      };
      this.billSettlementService.saveConsumptionRange(consumptionRange).subscribe({
        next: response => {
          if (response) {
            this.notificationMessage('Consumption range saved successfully', 'green-snackbar');
            this.onReset();
          } else {
            this.notificationMessage('Consumption range save failed', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Consumption range save failed', 'red-snackbar');
        }
      });
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

  onPrintSummary() {
    if (this.billConsumptionDetailsComponent.failedBills.length > 0)
      this.downloadSummary(this.billConsumptionDetailsComponent.failedBills);
  }

  downloadSummary(failedBills: Bill[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Unit Number',
      'First Consumption',
      'Second Consumption',
      'Difference',
      'Difference %'
    ]

    for (let a = 0; a < failedBills.length; a++) {
      row.push(failedBills[a].unitNumber)
      row.push(failedBills[a].consumptionLocal)
      row.push(failedBills[a].averageConsumptionLocal)
      row.push(failedBills[a].consumptionDifferenceLocal)
      row.push(failedBills[a].consumptionDifferencePercentageLocal)
      firstTableRows.push(row);

      row = [];
    }

    const title = 'Consumption Alert Report';
    this.getSummaryReport(failedBills, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: Bill[], firstTableCol: any[], firstTableRows: any[], title: string) {
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
    pdf.text("Consumption Alert Report for " + this.message, 50, startY + 90); //pdf.internal.pageSize.width/2
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
      startY: startY + 110,
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
          cellWidth: 110,
          halign: 'center'
        },
        1: {
          cellWidth: 110,
          halign: 'center'
        },
        2: {
          cellWidth: 110,
          halign: 'center'
        },
        3: {
          cellWidth: 110,
          halign: 'center'
        },
        4: {
          cellWidth: 110,
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
    if (this.billConsumptionDetailsComponent.failedBills != undefined) {
      this.billConsumptionDetailsComponent.failedBills.forEach((item) => {
        let element = {
          UnitNumber: item.unitNumber,
          Consumption: item.consumptionLocal,
          UnitAverage: item.averageConsumptionLocal,
          Difference: item.consumptionDifferenceLocal,
          DifferencePercentage: item.consumptionDifferencePercentageLocal
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    if (this.billConsumptionDetailsComponent.failedBills && this.billConsumptionDetailsComponent.failedBills.length > 0) {
      this.getJsonData();
      if (this.tableData != undefined) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Consumption Alert Report.xlsx');
      }
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }
}
