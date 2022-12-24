import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { environment } from 'src/environments/environment';
import { UnitMaster } from '../../settings/create-unit-master/unit-master-create-update/unit-master.model';
import { MeterErrorDetails } from '../../shared/models/meter-error-details.model';
import { TemplateContent } from '../../shared/models/template-content.model';
import { MeterReplacementService } from '../../shared/services/meterreplacement.service';
import { TemplateService } from '../../shared/services/template.service';
import { ListItem } from '../../shared/models/list-item.model';
import { ListData } from '../../shared/models/list-data.model';
import jsPDF from 'jspdf';
import { JwtHelperService } from '@auth0/angular-jwt';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Master } from '../../shared/models/master.model';
import { MeterReadingService } from '../../meter-reading/meter-reading.service';
import { MatOption } from '@angular/material/core';
import { MeterReading } from '../../shared/models/meter-reading.model';
import { DynamicTableStructureComponent } from '../../shared/components/dynamic-table-structure/dynamic-table-structure.component';
import { EstidamaChartService } from '../../estidama-chart/estidama-chart.service';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { GeneraldashboardService } from 'src/app/pages/generaldashboard/generaldashboard.service';

@Component({
  selector: 'fury-create-meter-error-details',
  templateUrl: './create-meter-error-details.component.html',
  styleUrls: ['./create-meter-error-details.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateMeterErrorDetailsComponent implements OnInit {

  subject$: ReplaySubject<MeterErrorDetails[]> = new ReplaySubject<MeterErrorDetails[]>(1);
  data$: Observable<MeterErrorDetails[]> = this.subject$.asObservable();
  clientId: string;
  units: Master[] = [];
  filteredUnits: Master[];
  meterErrorDetails: MeterErrorDetails[];
  tableData: any[];
  dateFormat = '';
  fromDate: string = '';
  toDate: string = '';
  unitId: number = 0;
  form: FormGroup;
  metadataMeters: any[] = [];
  filterMeters: any[] = [];
  selectedMeters = [];
  meterReading: MeterReading = {};
  columns: any[] = [];
  columnNames: ListColumn[] = [];
  meterTypeId: number = 0;
  meterTypeName: string = '';
  meterTypes: any[] = [];
  showSpinner: boolean = false;
  role: string;
  gridCount: number = 0;

  ownerNameColumnName = 'Owner Name';
  deviceNameColumnName = 'Device Name';
  unitNumberColumnName = 'Unit Number';
  errorCodeColumnName = 'Error Code';
  errorTypeColumnName = 'Error Type';
  errorDateLocalColumnName = 'Error Date';

  createGridColumns() {
    this.columns = [
      'ownerName',
      'deviceName',
      'unitNumber',
      'errorCode',
      'errorType',
      'errorDateLocal']
  }

  createColumnNames() {
    // this.columnNames = [
    //   { name: this.ownerNameColumnName, property: 'ownerName' },
    //   { name: this.deviceNameColumnName, property: 'deviceName' },
    //   { name: this.unitNumberColumnName, property: 'unitNumber' },
    //   { name: this.errorCodeColumnName, property: 'errorCode' },
    //   { name: this.errorTypeColumnName, property: 'errorType' },
    //   { name: this.errorDateLocalColumnName, property: 'errorDateLocal' }] as ListColumn[];
  }

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Owner Name', property: 'ownerName', visible: true, isModelProperty: true },
    { name: 'Device Name', property: 'deviceName', visible: true, isModelProperty: true },
    { name: 'Unit Number', property: 'unitNumber', visible: true, isModelProperty: true },
    { name: 'Error Code', property: 'errorCode', visible: true, isModelProperty: true },
    { name: 'Error Type', property: 'errorType', visible: true, isModelProperty: true },
    { name: 'Error Date', property: 'errorDateLocal', visible: true, isModelProperty: true }
  ] as ListColumn[];
  pageSize = 7;
  dataSource: MatTableDataSource<MeterErrorDetails> | null;

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.dataSource && this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  @ViewChild('allSelected') private allSelected: MatOption;
  //@ViewChild(DynamicTableStructureComponent, { static: false }) dynamicTableStructureComponent: DynamicTableStructureComponent;

  constructor(private date: DatePipe,
    private meterReplacementService: MeterReplacementService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private estidamaChartService: EstidamaChartService,
    private templateService: TemplateService,
    private generalDashBoardService: GeneraldashboardService,
    private cookieService: CookieService,
    private jwtHelperService: JwtHelperService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if(this.role)
      {
        this.role = this.role.toLowerCase();
      }      
    }

    if (this.role && this.role == 'ems') {
      const filterData = this.cookieService.get('filterData');
      if (filterData) {
        let dataArray = JSON.parse(filterData);
        if (dataArray['strClientId'] == '') {
          this.clientId = '0'; //this.cookieService.get('globalClientId');    
        }
        else {
          this.clientId = dataArray['strClientId'];
        }
      }
    }
    else {
      this.clientId = this.cookieService.get('globalClientId');
    }
    //this.clientId = this.cookieService.get('globalClientId');
    // this.createColumnNames();
    // this.createGridColumns();
    //fill units drop down
    //this.getUnits();

    this.form = this.fb.group({
      meterId: ['']
    });
    this.getMeterTypes();
    //this.getMeterList();

    // this.form.controls.unitNumber.valueChanges.subscribe(newUnit => {
    //   this.filteredUnits = this.filterUnits(newUnit);
    // });
  }

  // filterUnits(name: string) {
  //   if((name != '') && (name != undefined))
  //   {
  //     return this.units.filter(unit =>
  //       unit.description.toLowerCase().indexOf(name.toLowerCase()) === 0);
  //   }
  //   else
  //   {
  //     return this.units;
  //   }
  // }

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

  getMeterTypes() {
    this.meterTypes = [];
    //this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
    this.generalDashBoardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        //const meterTypes = response['meterTypeList'];        
        // if (meterTypes) {
        //   meterTypes.forEach(element => {
        //     this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
        //   });
        // }
        this.meterTypes = response;
        this.meterTypeId = this.meterTypes[0].id;
        this.meterTypeName = this.meterTypes[0].description;
        this.onMeterTypeChange();
      }
    });
  }

  onMeterTypeChange(event = null) {
    if (event) {
      this.meterTypeName = event.value;
    }
    this.meterTypes.find((meter) => {
      if (meter.description == this.meterTypeName)
        this.meterTypeId = meter.id
    })
    this.getMeters();
  }

  getMeters() {
    this.metadataMeters = [];
    this.selectedMeters = [];
    //this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {
    this.meterReplacementService.getV1DeviceGroupMeterListWithoutFlowTypeFilter(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {      
      if (response) {
        this.metadataMeters = this.filterMeters = response;
      }
    });
  }

  // getMeterList() {
  //   this.metadataMeters = [];
  //   this.meterReplacementService.GetMeterList(this.clientId).subscribe((response: any) => {
  //     this.metadataMeters = this.filterMeters = response;
  //   })
  // }

  getMeterErrorDetails() {
    this.showSpinner = true;
    this.meterErrorDetails = [];
    //this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.fromDate = this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD');
    this.toDate = this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD');

    let index = this.selectedMeters.findIndex((meter) => meter == 0)
    if (index >= 0) {
      this.selectedMeters.splice(index, 1);
    }
    //if (((this.fromDate != '') && (this.toDate != '')) || (this.selectedMeters && this.selectedMeters.length > 0)) {
      if(this.selectedMeters && this.selectedMeters.length > 0)
      {
        this.meterReading.MeterId = this.selectedMeters.join(",");
      }
      else {
        this.meterReading.MeterId = null;
      }
      
      this.meterReading.FromDate = this.fromDate;
      this.meterReading.ToDate = this.toDate;
      this.meterReading.clientId = parseInt(this.clientId);
      this.meterReading.utilityTypeId = this.meterTypeId;

      this.meterReplacementService.getMeterErrorDetails(this.meterReading).subscribe({
        next: (meterErrorDetails: MeterErrorDetails[]) => {

          this.meterErrorDetails = meterErrorDetails
          meterErrorDetails.forEach(x => {
            x.errorDateLocal = this.date.transform(x.errorDate.toString(), this.dateFormat.toString());
          })
          this.subject$.next(meterErrorDetails);
          this.meterErrorDetails = meterErrorDetails
          this.showSpinner = false;
          this.gridCount = meterErrorDetails.length;
        },
        error: (err) => {
          //this.notificationMessage('Meter Fault Details Not Found.', 'red-snackbar');
          this.meterErrorDetails = [];
          this.subject$.next(this.meterErrorDetails);
          this.showSpinner = false;
        }
      });

      this.dataSource = new MatTableDataSource(this.meterErrorDetails);
      this.data$.pipe(
        filter(data => !!data)
      ).subscribe((meterErrorDetails) => {
        this.meterErrorDetails = meterErrorDetails;
        this.dataSource.data = meterErrorDetails;
      });
      this.ngAfterViewInit();
    // }
    // else {
    //   this.notificationMessage("Invalid Search Parameters.", 'yellow-snackbar');
    //   this.showSpinner = false;
    // }
  }


  getUnits() {
    this.meterReplacementService.getAllUnits(this.clientId, 0).subscribe((data: Master[]) => {
      this.units = data;
      this.filteredUnits = data;
    });
  }

  selectUnit(event: any) {
    this.units.forEach(unit => {
      if (unit.description === event.option.value) {
        this.unitId = unit.id;
      }
    });
  }

  onSendEmail() {
    if (this.meterErrorDetails) {
      const templateContent: TemplateContent = {
        notificationType: 'EMAIL',
        templateType: 'Invoice',
        templateName: 'Invoice',
        billMasterDetails: this.meterErrorDetails
      };
      // this.templateService.emailInvoiceTemplate(templateContent).subscribe(
      //   response => {
      //     this.notificationMessage("Email send successfully.","green-snackbar");
      //   }
      // );
    }
    else {
      this.notificationMessage("Meter Fault Data not available.", "yellow-snackbar")
    }
  }

  onPrintSummary() {
    if (this.meterErrorDetails) {
      this.downloadSummary(this.meterErrorDetails);
    }
    else {
      this.notificationMessage("Meter Fault Data not available.", "yellow-snackbar")
    }
  }

  downloadSummary(meterErrorDetails: MeterErrorDetails[]) {
    let row: any[] = [];
    let firstTableRows: any[] = [];
    let secondTableRows: any[] = [];
    let firstTableCol = [
      'Owner Name',
      'Device Name',
      'Unit Number',
      'Error Code',
      'Error Type',
      'Error Date'];

    let totalRefundAmount = 0;

    for (let a = 0; a < meterErrorDetails.length; a++) {
      row.push(meterErrorDetails[a].ownerName)
      row.push(meterErrorDetails[a].deviceName)
      row.push(meterErrorDetails[a].unitNumber)
      row.push(meterErrorDetails[a].errorCode)
      row.push(meterErrorDetails[a].errorType)
      row.push(meterErrorDetails[a].errorDateLocal)
      firstTableRows.push(row);

      row = [];
    }

    const title = 'Meter Fault Report';

    // secondTableRows.push({ label: 'Total Amount', value0: totalRefundAmount});

    // for (let a = 0; a < secondTableRows.length; a++) {
    //   row.push('')      
    //   row.push('')
    //   row.push('')
    //   row.push(secondTableRows[a].label); 
    //   row.push(this.currency.transform(secondTableRows[a].value0, this.currencyFormat.toString(), 'symbol'))
    //   row.push('')
    //   //row.push(this.currencyFormat.transform(secondTableRows[a].value2, this.currency.toString(), true, this.roundOffFormat))
    //   firstTableRows.push(row);
    //   row = [];
    // }

    this.getSummaryReport(this.meterErrorDetails, firstTableCol, firstTableRows, title)
  }

  getSummaryReport(data: MeterErrorDetails[], firstTableCol: any[], firstTableRows: any[], title: string) {
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
    pdf.text("TRN: 100567483100003", startX, startY + 55)
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    if ((this.fromDate != '') && (this.toDate != ''))
      pdf.text("Meter Fault Report From " + moment(this.fromDate).format('YYYY-MM-DD') + " To " + moment(this.toDate).format('YYYY-MM-DD'), pdf.internal.pageSize.width / 2 - 150, startY + 70)
    else
      pdf.text("Meter Fault Report", pdf.internal.pageSize.width / 2 - 50, startY + 70)
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
      margin: { top: 100, left: 20 },
      theme: 'grid',
      tableWidth: 'auto',
      cellWidth: 'wrap',
      columnStyles: {
        0: {
          cellWidth: 130,
          halign: 'left'
        },
        1: {
          cellWidth: 70,
          halign: 'center'
        },
        2: {
          cellWidth: 70,
          halign: 'center'
        },
        3: {
          cellWidth: 60,
          halign: 'center'
        },
        4: {
          cellWidth: 170,
          halign: 'left'
        },
        5: {
          cellWidth: 70,
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

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.meterId
        .patchValue([...this.metadataMeters.map(item => item.id), 0]);
    } else {
      this.form.controls.meterId.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
  }

  searchMeterType(query: string) {
    let result = this.selectMeterType(query)
    this.metadataMeters = result;
  }

  selectMeterType(query: string): string[] {
    let result: string[] = [];
    for (let a of this.filterMeters) {
      if (a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  getJsonData() {
    this.tableData = [];
    if (this.meterErrorDetails != undefined) {
      this.meterErrorDetails.forEach((item) => {
        let element = {
          OwnerName: item.ownerName,
          DeviceName: item.deviceName,
          UnitNumber: item.unitNumber,
          ErrorCode: item.errorCode,
          ErrorType: item.errorType,
          ErrorDate: this.date.transform(item.errorDate, 'yyyy-MM-dd')
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    this.getJsonData();
    if ((this.tableData != undefined) && (this.tableData.length > 0)) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'Meter Fault Report.xlsx');
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

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }

}
