import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { JwtHelperService } from "@auth0/angular-jwt";
import jsPDF from 'jspdf';
import * as moment from 'moment';
import { Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { environment } from "src/environments/environment";
import { BillMaster } from '../../shared/models/bill-master.model';
import { ConsolidatedReport } from "../../shared/models/consolidated-report.model";
import { TemplateContent } from '../../shared/models/template-content.model';
import { BillService } from "../../shared/services/bill.service";
import { TemplateService } from "../../shared/services/template.service";
import { identifierModuleUrl } from '@angular/compiler';
import * as XLSX from 'xlsx';
import { DynamicTableStructureComponent } from '../../shared/components/dynamic-table-structure/dynamic-table-structure.component';
import { CookieService } from 'ngx-cookie-service';
import { ImageProperty } from '../../shared/models/imageProperty.model';
import { ClientService } from '../../shared/services/client.service';
import { uniqueKey } from 'highcharts';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { Utility } from '../../shared/models/utility.model';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: "fury-create-consolidated",
  templateUrl: "./create-consolidated.component.html",
  styleUrls: ["./create-consolidated.component.scss"],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateConsolidatedComponent implements OnInit {
  subject$: ReplaySubject<ConsolidatedReport[]> = new ReplaySubject<ConsolidatedReport[]>(1);
  data$: Observable<ConsolidatedReport[]> = this.subject$.asObservable();
  clientId: number;
  selectedRows: ConsolidatedReport[] = [];
  columns: any[] = [];
  columnNames: ListColumn[] = [];
  consolidatedData: any[];
  imageProperties: ImageProperty[] = [];
  currencyFormat = getClientDataFormat('Currency'); //?? environment.currencyFormat;
  roundOffFormat = getClientDataFormat('RoundOff'); //??  environment.roundOffFormat;
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff'); //?? environment.consumptionRoundOffFormat;
  dateFormat = getClientDataFormat('DateFormat'); //?? environment.dateFormat;;
  filePath ='';
  fromDate: string = Date.UTC.toString();
  toDate: string = Date.UTC.toString();
  billPeriodId: number = 0;
  billPeriods: any[] = [{ label: 'Select', value: 0 }];
  billCharges = '';
  vatAmount = '';
  billAmount = '';
  tableData: any[];

  billNumberColumnName = 'Bill Number';
  billDateLocalColumnName = 'Bill Date';
  customerNameColumnName = 'Customer Name';
  unitNumberColumnName = 'Unit Number';
  meterNumberColumnName = 'Meter Number';
  consumptionsLocalColumnName = 'Consumptions';
  consumptionLocalColumnName = 'Consumption Charge';
  billChargeLocalColumnName = 'Bill Charge';
  vatLocalColumnName = 'VAT';
  billAmountLocalColumnName = 'Bill Amount';

  createGridColumns() {
    this.columns = [
      'billNumber',
      'billDateLocal',
      'customerName',
      'unitNumber',
      'meterNumber',
      'consumptions',
      'consumptionLocal',
      'billChargeLocal',
      'vatLocal',
      'billAmountLocal']
  }

  createColumnNames() {
    // this.columnNames = [
    //   { name: this.billNumberColumnName, property: 'billNumber' },
    //   { name: this.billDateLocalColumnName, property: 'billDateLocal' },
    //   { name: this.customerNameColumnName, property: 'customerName' },
    //   { name: this.unitNumberColumnName, property: 'unitNumber' },
    //   { name: this.meterNumberColumnName, property: 'meterNumber' },
    //   { name: this.consumptionsLocalColumnName, property: 'consumptions' },
    //   { name: this.consumptionLocalColumnName, property: 'consumptionLocal' },
    //   { name: this.billChargeLocalColumnName, property: 'billChargeLocal' },
    //   { name: this.vatLocalColumnName, property: 'vatLocal' },
    //   { name: this.billAmountLocalColumnName, property: 'billAmountLocal' }] as ListColumn[];
  }

  pageSize = 7;
  dataSource: MatTableDataSource<ConsolidatedReport> | null;

  //@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = value;
    }
  }
  @ViewChild(DynamicTableStructureComponent, { static: false }) dynamicTableStructureComponent: DynamicTableStructureComponent;

  constructor(
    private billService: BillService,
    private currency: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private date: DatePipe,
    private templateService: TemplateService,
    private jwtHelperService: JwtHelperService,
    private snackbar: MatSnackBar,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private clientService: ClientService,
    private envService: EnvService
  ) { 
    this.filePath = envService.backendForFiles;
  }

  get visibleColumns() {
    return this.columnNames
      .filter((column) => !column.property.includes('Id'))
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    this.createColumnNames();
    this.createGridColumns();
    this.getBillPeriods();
    //this.getConsolidatedData();
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

  onChangeBillPeriod(value: any) {
    this.billPeriodId = value;
    if (this.billPeriodId) {
      const billPeriod = this.billPeriods.find(x => x.value === this.billPeriodId);
      if (billPeriod) {
        this.fromDate = billPeriod.fromDate === '' ? '' : moment(billPeriod.fromDate).format('YYYY-MM-DD');
        this.toDate = billPeriod.toDate === '' ? '' : moment(billPeriod.toDate).format('YYYY-MM-DD');
      }
    }
  }

  getConsolidatedData() {
    this.billAmount = '';
    this.billCharges = '';
    this.vatAmount = '';
    let billAmount = 0;
    let billCharges = 0;
    let vatAmount = 0;
    this.consolidatedData = [];
    this.dateFormat = getClientDataFormat('DateFormat');
    this.roundOffFormat = getClientDataFormat('RoundOff');
    this.currencyFormat = getClientDataFormat('Currency',0);
    this.billAmount = this.currency.transform(0, this.currencyFormat.toString(), true, this.roundOffFormat);
    this.billCharges = this.currency.transform(0, this.currencyFormat.toString(), true, this.roundOffFormat);
    this.vatAmount = this.currency.transform(0, this.currencyFormat.toString(), true, this.roundOffFormat);
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    this.billService.getConsolidatedData(this.clientId, this.billPeriodId).subscribe((consolidatedData: any[]) => {
      this.consolidatedData = consolidatedData;
      consolidatedData.forEach((x) => {
        billCharges += x.Bill_Charge == undefined ? 0 : x.Bill_Charge
        billAmount += x.Bill_Amount == undefined ? 0 : x.Bill_Amount
        vatAmount += x.VAT
      });
      this.subject$.next(consolidatedData);
      this.consolidatedData = consolidatedData;
      this.columnNames = [];
      Object.keys(consolidatedData[0]).forEach(x => {
        if (!this.columnNames.find(y => y === x.replace('Local', ''))) { 
          this.columnNames.push({ name: x.replace('Local', '').replace('_', ' '), property: x,visible: true, isModelProperty: true,columnAlign: x.includes('_Amount') ? {'text-align': 'right'} : {'text-align': 'left'} });
        }
      });

      this.billAmount = this.currency.transform(billAmount, this.currencyFormat.toString(), true, this.roundOffFormat);
      this.billCharges = this.currency.transform(billCharges, this.currencyFormat.toString(), true, this.roundOffFormat);
      this.vatAmount = this.currency.transform(vatAmount, this.currencyFormat.toString(), true, this.roundOffFormat);

      this.consolidatedData.forEach(item => {
        for (let prop in item) {
          if (prop.includes('_Amount')) {
            item[prop] = this.currency.transform(item[prop], this.currencyFormat.toString(), true, this.roundOffFormat);
          }
        }
        this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', item.UtilityTypeId,item.Utility_Type);
        item.Consumptions = this.decimalPipe.transform(item.Consumptions, this.consumptionRoundOffFormat)
      });

      for (let column in this.columnNames) {
        if (this.columnNames[column]['name'] != 'Bill_Amount' && this.columnNames[column]['name'].includes('_Amount')) {
          this.columnNames[column]['name'] = this.columnNames[column]['name'].replace('_Amount', '').replace('_', ' ');
        }
      }

      this.dataSource = new MatTableDataSource(this.consolidatedData);
      this.data$.pipe(filter((data) => !data)).subscribe((consolidatedData) => {
        this.consolidatedData = consolidatedData;
        this.dataSource.data = consolidatedData;
      });
      this.ngAfterViewInit();

    }
      // error: (err) => {
      //   this.notificationMessage("Consolidated Data Not Found.","yellow-snackbar");
      //   this.consolidatedData = [];
      //   this.billAmount = this.currency.transform(0, this.currencyFormat.toString(), true,this.roundOffFormat);
      //   this.billCharges = this.currency.transform(0, this.currencyFormat.toString(), true,this.roundOffFormat);
      //   this.vatAmount = this.currency.transform(0, this.currencyFormat.toString(), true,this.roundOffFormat);
      // },
    );

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
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  onSelectedRows(selectedRows: ConsolidatedReport[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }

  onSendEmail() {
    if (this.consolidatedData) {
      const templateContent: TemplateContent = {
        notificationType: 'EMAIL',
        templateType: 'customized',
        templateName: 'customized',
        billMasterDetails: this.consolidatedData
      };
      this.templateService.emailCustomTemplate(templateContent).subscribe(
        response => {
          this.notificationMessage("Email send successfully.", "green-snackbar");
        }
      );
    }
  }

  onPrintSummary() {
    this.getClientImageProperties();
  }

  getClientImageProperties() {
    this.imageProperties = [];
    this.clientService.getClientImageProperties(this.clientId).subscribe({
      next: (imageProperties: ImageProperty[]) => {
        if (imageProperties && imageProperties.length) {
          this.imageProperties = imageProperties;
          this.downloadSummary(this.consolidatedData);
        }
      },
      error() {
        this.notificationMessage("Image properties not found. To see image on print, please configure image properties ", "red-snackbar");
        this.downloadSummary(this.consolidatedData);
      }
    });
  }

  downloadSummary(consolidatedData: ConsolidatedReport[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];

    let firstTableCol = [];
    // 'Bill Number',
    // 'Bill Date',
    // 'Customer Name',
    // 'Unit',
    // 'Meter Number',
    // 'Consumptions',
    // 'Consumption Charges ' + this.currencyFormat,
    // 'Bill Charge ' + this.currencyFormat,
    // 'VAT ' + this.currencyFormat,
    // 'Consumption-tonHr',
    // 'Bill Amount ' + this.currencyFormat];

    let totalAmount = 0;
    let totalVAT = 0;
    let totalBillCharge = 0;

    let object = consolidatedData[0];
    for (let property in object) {
      if (property.toLowerCase() != 'bill_amount') {
        property = property.replace('_Amount', '');
      }
      property = property.replace('_', ' ');
      firstTableCol.push(property.replace('_', ' '));
    }

    for (let a = 0; a < consolidatedData.length; a++) {
      // row.push(consolidatedData[a]['BillNumber'])
      // row.push(consolidatedData[a]['BillDate'])
      // row.push(consolidatedData[a]['CustomerName'])
      // row.push(consolidatedData[a]['UnitNumber'])
      // row.push(consolidatedData[a]['MeterNumber'])
      // row.push(consolidatedData[a]['Consumptions'])
      // row.push(consolidatedData[a]['Consumption'])
      // row.push(consolidatedData[a]['BillCharge'])
      // row.push(consolidatedData[a]['VAT'])
      // row.push(consolidatedData[a]['Consumption-tonHr'])
      // row.push(consolidatedData[a]['BillAmount'])
      // firstTableRows.push(row);

      for (let property in object) {
        if (property != 'UtilityTypeId') {
          row.push(consolidatedData[a][property]);
        }
      }

      firstTableRows.push(row);

      let billAmount = 0;
      if (consolidatedData[a] && consolidatedData[a]['Bill_Amount']) {
        billAmount = Number(consolidatedData[a]['Bill_Amount'].replace(/[^0-9.-]+/g, ""));
      }
      totalAmount += billAmount; //consolidatedData[a]['Bill_Amount'];
      totalVAT += consolidatedData[a]['VAT'];
      totalBillCharge += consolidatedData[a]['BillCharge'];

      row = [];
    }

    const title = 'Consolidated Report';
    secondTableRows.push({ label: 'Total Amount', value2: totalAmount });
    //secondTableRows.push({ label: 'Total Amount', value0: totalBillCharge, value1: totalVAT, value2: totalAmount });

    for (let a = 0; a < firstTableCol.length - 4; a++) {
      row.push('')
    }
    row.push(secondTableRows[0].label)
    row.push(this.currency.transform(secondTableRows[0].value0, this.currencyFormat.toString(), true, this.roundOffFormat));
    row.push(this.currency.transform(secondTableRows[0].value1, this.currencyFormat.toString(), true, this.roundOffFormat))
    row.push(this.currency.transform(secondTableRows[0].value2, this.currencyFormat.toString(), true, this.roundOffFormat))
    //row.push(this.currencyFormat.transform(secondTableRows[a].value2, this.currency.toString(), true, this.roundOffFormat))
    firstTableRows.push(row);
    row = [];


    this.getSummaryReport(this.consolidatedData, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: ConsolidatedReport[], firstTableCol: any[], firstTableRows: any[], title: string) {
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
    // pdf.text("PO Box 127404", startX + 480, startY - 10);
    // pdf.text("Office 201, Al Zarouni Business Centre", startX + 480, startY);
    // pdf.text("Al Barsha 1, Dubai, UAE", startX + 480, startY + 10);
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
    pdf.text("Consolidated Report", pdf.internal.pageSize.width / 2 - 80, startY + 40)
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
      startY: startY + 50,
      didDrawPage: pageContent,
      styles: {
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 6,
        overflowColumns: 'linebreak',
        lineColor: [0, 0, 0]
      },
      margin: { top: 100, left: 15 },
      theme: 'grid',
      tableWidth: 'auto',
      columnStyles: {
        0: {
          cellWidth: 'wrap',
          halign: 'left'
        },
        1: {
          cellWidth: 'wrap',
          halign: 'center'
        },
        2: {
          cellWidth: 'wrap',
          halign: 'left'
        },
        3: {
          cellWidth: 'wrap',
          halign: 'center'
        },
        4: {
          cellWidth: 'wrap',
          halign: 'center'
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
        },
        11: {
          cellWidth: 'wrap',
          halign: 'center'
        },
        12: {
          cellWidth: 'wrap',
          halign: 'center'
        },
        13: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        14: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        15: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        16: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        17: {
          cellWidth: 'wrap',
          halign: 'right'
        },
        18: {
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

  // getJsonData() {
  //   this.tableData = [];
  //   if (this.consolidatedData != undefined) {
  //     this.consolidatedData.forEach(item => {
  //       for (let column in item) {
  //         if (column != 'Bill_Amount' && column.includes('_Amount')) {
  //           column = column.replace('_Amount', '');
  //         }
  //         item.column = column.replace('_', ' ');
  //       }
  //       this.tableData.push(item)
  //     });
  //   }
  // }

  getJsonData() {
    this.tableData = [];
    if (this.consolidatedData != undefined) {      
      this.consolidatedData.forEach( value => { this.tableData.push( Object.assign({},value) ) });
      this.tableData = this.renameKeysForPassedInObjectWithCustomFilters(this.tableData);
    }
  }

  //removes _ and Amount characters from column keys
  private renameKeysForPassedInObjectWithCustomFilters(data: any) {
    data.forEach(item => {
      for (let colName in item) {
        let newColName = colName.replace(/_/g, ' ');
        if (newColName.includes('Amount') && newColName !== 'Bill Amount') {
          newColName = newColName.replace('Amount', '').trim();
        }
        item[newColName] = item[colName];
        delete item[colName];
      }
    });

    return data
  }

  onExport() {
    if(this.dataSource.data && this.dataSource.data.length > 0)
    {
      this.getJsonData();
      if (this.tableData != undefined) { 
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        /* save to file */
        XLSX.writeFile(wb, 'Consolidated Report.xlsx');
    }
    // if (this.dynamicTableStructureComponent != undefined) {
    //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.dynamicTableStructureComponent.table.nativeElement);
    //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    //   /* save to file */
    //   XLSX.writeFile(wb, 'Consolidated Report.xlsx');
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }
}
