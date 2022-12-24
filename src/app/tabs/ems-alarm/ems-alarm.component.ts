import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillSettlementService } from '../shared/services/billsettlement.service';
import { TenantsService } from '../shared/services/tenants.service';
import { AlertSettingsEMSService } from '../shared/services/alert-settings-ems.service';
import { AlertSettingsEMS } from "../settings/create-alert-settings-ems/alert-settings-ems.model";
import { AlarmEms } from '../shared/models/alarm-ems.model';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { MasterService } from '../shared/services/master.service';
import { Master } from '../shared/models/master.model';
import { MatOption } from '@angular/material/core';
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';
import { ActivatedRoute } from '@angular/router';
import { parse } from 'path';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-ems-alarm',
  templateUrl: './ems-alarm.component.html',
  styleUrls: ['./ems-alarm.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class EmsAlarmComponent implements OnInit {
  @Input() id = 0;
  clientId: string;
  alarmDetails: AlertSettingsEMS[] = [];
  exportedData: AlertSettingsEMS[] = [];
  tableData: any[] = [];
  fromDate: string = '';
  toDate: string = '';
  alarmTypeId: number;
  alarmTypes: any[] = [];
  selectedMeters = [];
  meters: Master[];
  filteredMeters: any[] = [];
  meterId: number;
  form: FormGroup;
  meterType: string = '';
  emsAlarm: AlarmEms = {};
  meterTypeId: number = 0;
  meterTypeName: string = '';
  meterTypes: any[] = [];
  notificationId: number = 0;
  showSpinner: boolean = false;

  @Input()
  columns: ListColumn[] = [
    { name: 'Date', property: 'date', visible: true, isModelProperty: false },
    { name: 'Alarm Type', property: 'alarmType', visible: true, isModelProperty: true },
    { name: 'Alarm Name', property: 'alarmName', visible: true, isModelProperty: true },
    { name: 'Meter Name', property: 'meterName', visible: true, isModelProperty: true },
    { name: 'Parameter Name', property: 'parameterName', visible: true, isModelProperty: true },
    { name: 'Parameter Value', property: 'parameterValue', visible: true, isModelProperty: true },
    //{ name: 'Week Day', property: 'weekDay', visible: true, isModelProperty: true },       
    //{ name: 'Hour', property: 'hour', visible: true, isModelProperty: true }, 
    //{ name: 'Minute', property: 'minutes', visible: true, isModelProperty: true },
    { name: 'Condition', property: 'condition', visible: true, isModelProperty: true },
    { name: 'Check Value', property: 'conditionValue', visible: true, isModelProperty: true },
    { name: 'Acknowledged Date', property: 'acknowledgedDate', visible: true, isModelProperty: false }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<AlertSettingsEMS>;

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  sort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.dataSource && this.sort){
       this.dataSource.sort = this.sort;  
    }
  }
  @ViewChild('allMetersSelected') private allMetersSelected: MatOption;

  constructor(private billSettlementService: BillSettlementService,
    private alertSettingsEMSService: AlertSettingsEMSService,
    private tenantsService: TenantsService,
    private date: DatePipe,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private masterService: MasterService,
    private estidamaChartService: EstidamaChartService,
    private meterReplacementService: MeterReplacementService,
    private fb: FormBuilder,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.route.queryParams
      //.filter((params) => params.id)
      .subscribe((params) => {
        this.notificationId = parseInt(params.id);
      });

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
    //this.clientId = this.cookieService.get("globalClientId");

    this.masterService.getSystemMasterdata(66, 0).subscribe((data: Master[]) => {
      this.alarmTypes = data;
    });
    // this.alertSettingsEMSService.getMeterList(this.clientId).subscribe((data: Master[]) => {
    //   this.meters = data
    //   this.filteredMeters = data
    // }) 

    this.form = this.fb.group({
      fromDate: [''],
      toDate: [''],
      alarmTypeId: [''],
      meterTypeId: [''],
      meterId: ['']
    })
    this.getMeterTypes();
    if (this.notificationId > 0) {
      this.getAlarmDetails();
    }
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
      if (response) {
        const meterTypes = response['meterTypeList'];
        if (meterTypes) {
          meterTypes.forEach(element => {
            this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
          });
        }
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
    this.meters = [];
    this.selectedMeters = [];
    this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {
      if (response) {
        this.meters = this.filteredMeters = response;
      }
    });
  }

  onSearch() {
    this.notificationId = 0;
    this.getAlarmDetails();
  }

  getAlarmDetails() {
    this.showSpinner = true;
    this.alarmDetails = [];
    this.exportedData = [];
    this.fromDate = this.fromDate == undefined ? '' : this.fromDate;
    this.toDate = this.toDate == undefined ? '' : this.toDate;
    this.fromDate = this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD');
    this.toDate = this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD');

    if (((this.alarmTypeId != undefined) && (this.selectedMeters.length > 0)) || (this.notificationId > 0)) {
      let index = this.selectedMeters.findIndex((meter) => meter == 0)
      if (index >= 0) {
        this.selectedMeters.splice(index, 1);
      }
      this.emsAlarm.MeterId = this.selectedMeters.join(",");
      this.emsAlarm.FromDate = this.fromDate;
      this.emsAlarm.ToDate = this.toDate;
      this.emsAlarm.alarmTypeId = this.alarmTypeId;
      this.emsAlarm.notificationId = this.notificationId > 0 ? this.notificationId : 0;
      this.emsAlarm.clientId = this.clientId;

      this.alertSettingsEMSService.getAlarmDetails(this.emsAlarm).subscribe({
        next: (data: AlertSettingsEMS[]) => {
          if (data) {
            data.forEach(value => { this.alarmDetails.push(Object.assign({}, value)) })
            this.alarmDetails.forEach(value => this.exportedData.push(Object.assign({}, value)))
            this.dataSource = new MatTableDataSource(this.alarmDetails);
            this.ngAfterViewInit();
            this.showSpinner = false;
          }
        },
        error: (err: any) => {
          this.alarmDetails = [];
          this.showSpinner = false;
        }
      })
    }
    else {
      this.notificationMessage("Invalid Parameters.", 'yellow-snackbar');
      this.showSpinner = false;
    }
    //this.showSpinner = false;
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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

  onAlarmTypeChange(value) {
    this.alarmTypeId = value;
  }

  onChangeMeter(event) {
    this.meters.filter((item) => {
      if (item.id == event.value)
        this.meterId = item.id
    })
  }

  searchMeterType(query: string) {
    let result = this.selectMeterType(query)
    this.meters = result;
  }

  selectMeterType(query: string) {
    let result = [];
    for (let a of this.filteredMeters) {
      if (a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  toggleMetersAllSelection() {
    if (this.allMetersSelected.selected) {
      this.form.controls.meterId
        .patchValue([...this.meters.map(item => item.id), 0]);
    } else {
      this.form.controls.meterId.patchValue([]);
    }
  }

  toggleMetersPerOne(all) {
    if (this.allMetersSelected.selected) {
      this.allMetersSelected.deselect();
      return false;
    }
    if (this.form.controls.meterId.value.length == this.filteredMeters.length)
      this.allMetersSelected.select();
  }

  getJsonData() {
    this.tableData = [];
    if (this.exportedData != undefined) {
      this.exportedData.forEach((item) => {
        let element = {
          AlarmType: item.alarmType,
          AlarmName: item.alarmName,
          MeterName: item.meterName,
          ParameterName: item.parameterName,
          ParameterValue: item.parameterValue,
          WeekDay: item.weekDay,
          Date: item.date,
          Hour: item.hour,
          Minute: item.minutes,
          Condition: item.condition,
          CheckValue: item.conditionValue
        }
        this.tableData.push(element);
      })
    }
  }

  onExport() {
    this.getJsonData();
    if (this.tableData != undefined) {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tableData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'EMS Alarm Report.xlsx');
    }
  }

}
