import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatOption } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MeterReplacementService } from '../../shared/services/meterreplacement.service';
import { MetadataMeter } from '../../shared/models/metadata.meter.model';
import * as moment from 'moment';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MeterReadingService } from '../../meter-reading/meter-reading.service';
import { MatSelectChange } from '@angular/material/select';
import { MeterReading } from '../../shared/models/meter-reading.model';
import * as XLSX from 'xlsx';
import { EstidamaChartService } from '../../estidama-chart/estidama-chart.service';
import { ParameterChartService } from '../../shared/services/parameter-chart.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, timestamp } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { ClientSelectionService } from '../../shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
import { GeneraldashboardService } from 'src/app/pages/generaldashboard/generaldashboard.service';
import * as Highcharts from 'highcharts';

//import {map, take, concatMap, bufferCount, delay, filter} from 'rxjs/operators';
//import {of, from, Observable, ReplaySubject} from 'rxjs';

@Component({
  selector: 'fury-create-device-data-details',
  templateUrl: './create-device-data-details.component.html',
  styleUrls: ['./create-device-data-details.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class CreateDeviceDataDetailsComponent implements OnInit {
  showSpinner: boolean = false;
  clientId: string;
  columns: any[] = [];
  columnNames: ListColumn[] = [];
  deviceData: any[] = [];
  exportedData: any[] = [];
  dateFormat = '';
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff'); //?? environment.consumptionRoundOffFormat;
  fromDate: string = '';
  toDate: string = '';
  parameterIds: any[] = ['V30', 'V1', 'V7', 'V8', 'V19'];
  meterIds: any[] = [];
  meters: any[] = [];
  filterMeters: any[] = [];
  parameters: any[];  // = [] = [{id:'30',description:'Energy'},{id:'1',description:'Volume'},{id:'7',description:'Flow Temperature'},{id:'8',description:'Return Temperature'},{id:'19',description:'Reserved 1'}];
  fliterParameters: any[];
  form: FormGroup;
  selectedData: string = '';
  selectedMeters = [];
  selectedParameters = [];
  selectedParametersName = [];
  metadataMeters: any[];
  filteredMeters: any[];
  group: number = null;
  lstGroup: any[];
  subGroup: number = null;
  lstSubGroup: any[];
  public hierarchicalData: Object[] = [];
  blnSubroup: boolean = true;
  meterReading: MeterReading = {};
  showLastReading: boolean = false;
  showDataFrequency: boolean = false;
  showZeroValueReading: boolean = false;
  meterTypeName: string;
  meterTypeId: number;
  meterTypes: any[] = [];
  dataFrequency: number;
  isDataFrequency: boolean = false;
  message: string;
  role: string;
  meterReadings: {};
  showChart: boolean = false;
  // items: Observable<any[]>;
  // subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  // data$: Observable<any[]> = this.subject$.asObservable();

  // ['V30', 'V1','V7','V8','V19'];

  pollingDateColumnName = 'Polling Date';
  pollingTimeColumnName = 'Polling Time';
  deviceNameColumnName = 'Device Name';
  unitNumberColumnName = 'Unit Number';

  @Input()
  displayedColumns: ListColumn[] = [
    { name: this.pollingDateColumnName, property: 'PollingDate' },
    { name: this.pollingTimeColumnName, property: 'PollingTime' },
    { name: this.deviceNameColumnName, property: 'DeviceName' },
    { name: this.unitNumberColumnName, property: 'UnitNumber' }] as ListColumn[];

  public pageSize = 20;
  public dataSource: MatTableDataSource<any> | null;
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  sort;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  get visibleColumns() {
    return this.displayedColumns.map(column => column.property);
  }

  // ['V30', 'V1','V7','V8','V19'];  

  createGridColumns() {
    this.columns = [
      'PollingDate',
      'PollingTime',
      'DeviceName',
      'UnitNumber']
  }

  createColumnNames() {
    this.displayedColumns = [
      { name: this.pollingDateColumnName, property: 'PollingDate' },
      { name: this.pollingTimeColumnName, property: 'PollingTime' },
      { name: this.deviceNameColumnName, property: 'DeviceName' },
      { name: this.unitNumberColumnName, property: 'UnitNumber' }] as ListColumn[];

    // this.columnNames = [
    //   { name: this.pollingDateColumnName, property: 'PollingDate' },
    //   { name: this.pollingTimeColumnName, property: 'PollingTime' },
    //   { name: this.deviceNameColumnName, property: 'DeviceName' },
    //   { name: this.unitNumberColumnName, property: 'UnitNumber' }] as ListColumn[];
  }

  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild('allParameterSelected') private allParameterSelected: MatOption;

  constructor(private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private date: DatePipe,
    private decimalPipe: DecimalPipe,
    private generalDashBoardService: GeneraldashboardService,
    private jwtHelperService: JwtHelperService,
    private meterService: MeterReadingService,
    private estidamaChartService: EstidamaChartService,
    private parameterChartService: ParameterChartService,
    private meterReplacementService: MeterReplacementService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService, private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = [];
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(true);

    this.getClientId();

    //this.clientId = this.cookieService.get("globalClientId");
    //this.getMeterListByClient(this.clientId);
    // this.meterReplacementService.GetParametersList().subscribe((parameters: any[]) => {
    //   this.parameters = this.fliterParameters = parameters;
    //   let index = this.parameters.findIndex(x => x.id == 0);
    //   if (index >= 0)
    //     this.parameters.splice(index, 1);
    // });

    this.form = this.fb.group({
      // group: [''],
      // subGroup: [''],
      meterTypeId: [''],
      meterIds: [''],
      parameterIds: [''],
      fromDate: [''],
      toDate: [''],
      dataFrequency: ['']
    });

    //this.createGridColumns();
    this.createColumnNames();
    if (this.selectedParameters) {
      for (let i = 0; i < this.selectedParameters.length; i++) {
        this.columns.push(this.selectedParameters[i]);
        this.displayedColumns.push({ name: this.selectedParameters[i], property: this.selectedParameters[i] })
      }
    }
    this.getMeterTypes();
  }

  getClientId() {
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    if (this.role && this.role.toLowerCase() == 'ems') {
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
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      // if(this.sort && this.sort.active && this.sort.active != '')
      // {
      //   let index = this.sort.active.indexOf('local');
      //   if(index > -1)
      //   {
      //     this.sort.active = this.sort.active.substr(0,index);
      //     if(this.sort.start == 'asc')
      //     {
      //       this.sort.start = 'desc';
      //     }
      //     else {
      //       this.sort.start = 'asc';
      //     }
      //}
      this.dataSource.sort = this.sort;
    }
    //}
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: [cssClass],
    });
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.selectedMeters = [];
    this.metadataMeters = [];
    this.parameters = [];
    this.selectedParameters = [];
    // this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
    //   if (response) {
    //     const meterTypes = response['meterTypeList'];
    //     if (meterTypes) {
    //       meterTypes.forEach(element => {
    //         this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
    //       });
    //     }
    this.generalDashBoardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
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
    this.getParameters();
  }

  getMeters() {
    this.metadataMeters = [];
    this.selectedMeters = [];
    //this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {
    this.meterReplacementService.getV1DeviceGroupMeterListWithoutFlowTypeFilter(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {
      if (response) {
        this.metadataMeters = this.filteredMeters = response;
      }
    });
  }

  getParameters() {
    this.parameters = [];
    this.selectedParameters = [];
    this.parameterChartService.getParameters(this.meterTypeName).subscribe((response: any) => {
      if (response) {
        this.parameters = this.fliterParameters = response;
      }
    });
  }

  // onGroupChange(group) {
  //   this.lstSubGroup = [];
  //   this.lstSubGroup.push(...group['meterSubGroupList']);
  //   if (this.lstSubGroup.length > 0) {
  //     this.blnSubroup = false;
  //     this.onSubGroupChange(this.lstSubGroup[0]);
  //   }
  // }

  // onSubGroupChange(subgroup) {
  //   this.metadataMeters = [];
  //   this.selectedMeters = [];
  //   // this.lstMeterType.push('Select All');
  //   this.metadataMeters.push(...subgroup['meterList']);
  //   // if(this.lstMeterType.length>0)
  //   // this.blnMeterType  =false;
  // }

  // getMeterListByClient(clientId) {
  //   this.filterMeters=[];
  //   this.meterService.getMeterListByClientId(clientId).subscribe((response: any) => {
  //     if (response) {
  //       this.metadataMeters = [];
  //       this.selectedMeters = []
  //       this.metadataMeters.push(...response['meterList']);
  //       this.filterMeters = this.metadataMeters;
  //     }
  //   });


  // }

  // getMeterTypes() {

  //   this.meterService.getVolts().subscribe((response: any) => {

  //     if (response) {
  //       this.hierarchicalData = response['meterGroupList']; //get tree structure

  //       this.lstGroup = [];
  //       this.lstSubGroup = [];

  //       this.hierarchicalData.forEach(element => {
  //         let dctGroup = {
  //           groupID: element['groupID'],
  //           groupName: element['groupName']
  //         }
  //         this.lstGroup.push(element); //Push data to Group list
  //       });
  //     }
  //   })

  // }

  // setMeterReadingsTrendChart() {
  //   let dctMeterReadings = {};
  //   dctMeterReadings['labels'] = [];
  //   dctMeterReadings['datas'] = [];
  //   let unit = 'KWH';

  //   this.meterReadings = this.setMeterReadingsChart(dctMeterReadings,unit);
  //   let rhcontainer = document.getElementById('rhcontainer');
  //   if (rhcontainer)
  //     Highcharts.chart('rhcontainer', this.meterReadings);
  // }

  onSearch() {
    let dctMeterReadings = {};
    dctMeterReadings['labels'] = [];
    dctMeterReadings['datas'] = [];
    let chartUnit = 'KWH';
    let chartParameter = '';
    this.meterReadings = {};   
    let consumptiondecimalPlaces: number;     
    this.showChart = false;

    this.showSpinner = true;
    this.fromDate = this.fromDate == '' ? '' : moment(this.fromDate).format("YYYY-MM-DD");
    this.toDate = this.toDate == '' ? '' : moment(this.toDate).format("YYYY-MM-DD");
    this.exportedData = [];
    if (this.showLastReading)
      this.toDate = '';
    this.selectedData = '';
    if (this.parameters) {
      for (let i = 0; i < this.parameters.length; i++) {
        if (this.selectedParameters.find(parameterId => this.parameters[i].id == parameterId)) {
          if ((this.selectedData) && (this.selectedData.length > 0)) {
            this.selectedData += ',';
          }
          this.selectedData += this.parameters[i].description;
        }
      }
    }

    if ((this.fromDate != '' && (this.selectedData && this.selectedData.length > 0) && (this.selectedMeters && this.selectedMeters.length > 0)) && ((this.showLastReading == false && this.toDate != '') || (this.showLastReading && this.toDate == '')) && ((this.showDataFrequency && this.dataFrequency > 0 && this.dataFrequency <= 24) || (!this.showDataFrequency))) {
      this.displayedColumns = [];

      this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', 0, this.meterTypeName);
      if (this.consumptionRoundOffFormat && this.consumptionRoundOffFormat != '') {
        consumptiondecimalPlaces = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
      }
      //this.createGridColumns();
      this.createColumnNames();
      let initialColumns = [];
      this.displayedColumns.forEach(x => {
        initialColumns.push(x.name.replace(' ', ''));
      });

      this.selectedParametersName = [];
      this.deviceData = [];
      if (this.selectedData)
        this.selectedParametersName = this.selectedData.split(",");

      if (this.selectedParametersName) {
        for (let i = 0; i < this.selectedParametersName.length; i++) {
          if (this.selectedParametersName[i] != 'Select All') {
            this.columns.push(this.selectedParametersName[i].trim());
            this.displayedColumns.push({ name: this.selectedParametersName[i].trim(), property: this.selectedParametersName[i].trim() });
          }
        }
        if(this.showZeroValueReading == false && this.showLastReading == false) //&& this.showDataFrequency == false)
        {
          if(this.selectedParametersName && this.selectedMeters && this.selectedParametersName.length == 1 && this.selectedMeters.length == 1)
          {
            this.showChart = true;
            chartParameter = this.selectedParametersName[0];
            this.meterReadings = this.setMeterReadingsChart(dctMeterReadings,chartUnit,chartParameter,consumptiondecimalPlaces);
            let rhcontainer = document.getElementById('rhcontainer');
            if (rhcontainer)
              Highcharts.chart('rhcontainer', this.meterReadings);
          }
        }
      }

      let index = this.selectedMeters.findIndex((meter) => meter == 0)
      if (index >= 0) {
        this.selectedMeters.splice(index, 1);
      }
      let paramIndex = this.selectedParameters.findIndex((parameter) => parameter == 0);
      if (paramIndex >= 0) {
        this.selectedParameters.splice(paramIndex, 1);
      }
      //let parameterId = this.selectedParameters.join(",");
      //let meterId = this.selectedMeters.join(",");
      this.meterReading.MeterId = this.selectedMeters.join(",");
      this.meterReading.ParameterId = this.selectedParameters.join(",");
      this.meterReading.FromDate = this.fromDate;
      this.meterReading.ToDate = this.toDate;
      this.meterReading.isDataFrequency = this.showDataFrequency;
      if (this.showDataFrequency)
        this.meterReading.dataFrequency = this.dataFrequency;
      if (this.showLastReading)
        this.meterReading.LastReading = '1';
      else
        this.meterReading.LastReading = '0';
      //this.meterReading.LastReading = this.showLastReading == true ? '1' : '0';
      this.meterReading.clientId = parseInt(this.clientId);
      this.meterReading.isZeroValueReading = this.showZeroValueReading;

      this.meterReplacementService.getDeviceDataDetails(this.meterReading).subscribe({
        next: (deviceData: any[]) => {
          if (deviceData) {

            this.deviceData = this.deviceData || [];    

            deviceData.forEach(value => { this.deviceData.push(Object.assign({}, value)) })
            //transforming original devicedata pollingtime to 'mm dd,yyyy'
            this.deviceData.forEach(x => {
              x.PollingDate = this.date.transform(x.PollingDate.toString(), this.dateFormat.toString());
              for (let prop in x) {
                if (!initialColumns.includes(prop) && prop.toLowerCase() != 'deviceid') {
                  let consumption = x[prop].substring(0, x[prop].indexOf(' '));
                  let unit = x[prop].substring(x[prop].indexOf(' ') + 1, x[prop].length);
                  x[prop] = this.decimalPipe.transform(consumption, this.consumptionRoundOffFormat) + ' ' + unit;
                }                
              }
              if(this.showZeroValueReading == false && this.showLastReading == false) //&& this.showDataFrequency == false)
              {
                if(this.selectedParametersName && this.selectedMeters && this.selectedParametersName.length == 1 && this.selectedMeters.length == 1)
                {                
                  let reading = x[chartParameter].substring(0, x[chartParameter].indexOf(' ')).replaceAll(',','');
                  if(reading != 0)
                  {
                    var pollingTime = x.PollingTime.split(":", 2).join(":");
                    dctMeterReadings['labels'].push(x.PollingDate + ' ' + pollingTime);
                    dctMeterReadings['datas'].push(Number(reading));
                    //dctMeterReadings['datas'].push(Number(x[chartParameter].substring(0, x[chartParameter].indexOf(' ')).replaceAll(',','')));                    
                  }                
                }
              }
            });

            //constructing a new object from this.deviceData to avoid object reference issues.
            this.deviceData.forEach(value => this.exportedData.push(Object.assign({}, value)))

            this.subject$.next(this.deviceData);
            this.dataSource = new MatTableDataSource(this.deviceData);
            this.data$.pipe(filter(data => !!data)).subscribe((deviceData) => {
              this.dataSource.data = deviceData;
            });
            this.ngAfterViewInit();            

            if(this.selectedParametersName && this.selectedMeters && this.selectedParametersName.length == 1 && this.selectedMeters.length == 1)
            {
              this.meterReadings = this.setMeterReadingsChart(dctMeterReadings,chartUnit,chartParameter,consumptiondecimalPlaces);
              let rhcontainer = document.getElementById('rhcontainer');
              if (rhcontainer)
                Highcharts.chart('rhcontainer', this.meterReadings);
            }

            this.showSpinner = false;

            //         this.subject$.next(this.deviceData);
            //         this.data$.pipe(filter(data => !!data)).subscribe((data) => {
            //           this.deviceData = data;
            //           //this.listData.data = data;
            //         });

            //         const source = from(this.deviceData);
            //         const items = [];

            //         this.items = source.pipe(
            //           bufferCount(3),
            //           concatMap((items, index) => of(items).pipe(delay(index == 0 ? 0 : 3000))),
            //           map(arr => {
            //             items.push(...arr);
            //             return [...items];
            //           })
            //         );
            // console.log(this.items)
          }
        },
        error: (err) => {
          this.deviceData = [];
          this.subject$.next(this.deviceData);
          this.dataSource = new MatTableDataSource(this.deviceData);
          this.data$.pipe(filter(data => !!data)).subscribe((deviceData) => {
            this.dataSource.data = deviceData;
          });
          this.ngAfterViewInit();
          this.showSpinner = false;
        }
      })

    }
    else {
      this.notificationMessage("Invalid search parameters", "yellow-snackbar");
      this.deviceData = [];
      this.subject$.next(this.deviceData);
      this.dataSource = new MatTableDataSource(this.deviceData);
      this.data$.pipe(filter(data => !!data)).subscribe((deviceData) => {
        this.dataSource.data = deviceData;
      });
      this.ngAfterViewInit();
      this.showSpinner = false;
    }
    this.showSpinner = false;
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  selectedValue(event: MatSelectChange) {
    // let selectedData = {
    //   value: event.value,
    //   text: event.source.triggerValue
    // };
    //this.selectedData = '';
    // if (event.source.triggerValue == 'Select All') {
    //   for (let i = 0; i < this.parameters.length; i++) {
    //     if(this.selectedParameters.findIndex(this.parameters[i]) >= 0)
    //     {
    //     if (i > 0)
    //       this.selectedData += ',';
    //     this.selectedData += this.parameters[i].description;
    //   }
    // }
    // }
    // else
    //   this.selectedData = event.source.triggerValue;
  }


  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.form.controls.meterIds
        .patchValue([...this.metadataMeters.map(item => item.id), 0]);
    } else {
      this.form.controls.meterIds.patchValue([]);
    }
  }

  toggleAllParameterSelection() {
    if (this.allParameterSelected.selected) {
      this.form.controls.parameterIds
        .patchValue([...this.parameters.map(item => item.id), 0]);
    } else {
      this.form.controls.parameterIds.patchValue([]);
    }
  }

  togglePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.form.controls.meterIds.value.length == this.metadataMeters.length)
      this.allSelected.select();
  }

  toggleParametersPerOne(all) {
    if (this.allParameterSelected.selected) {
      this.allParameterSelected.deselect();
      return false;
    }
    if (this.form.controls.parameterIds.value.length == this.parameters.length)
      this.allParameterSelected.select();
  }

  toggleShowLastReading(value) {
    this.showLastReading = !value;
    if (this.showLastReading)
    {
      this.showDataFrequency = value;
      this.showZeroValueReading = value;
    }      
  }

  toggleShowDataFrequency(value) {
    this.showDataFrequency = !value;
    if (this.showDataFrequency)
    {
      this.showLastReading = value;
      this.showZeroValueReading = value;
    }      
  }

  toggleZeroValueReading(value) {
    this.showZeroValueReading = !value;
    if (this.showZeroValueReading)
    {
      this.showLastReading = value;
      this.showDataFrequency = value;
    }      
  }

  searchParameters(query: string) {
    let result = this.selectParameters(query.toLowerCase())
    this.parameters = result;
  }

  selectParameters(query: string): string[] {
    let result: string[] = [];
    for (let a of this.fliterParameters) {
      if (a.description.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  searchMeterType(query: string) {
    let result = this.selectMeterType(query.toLowerCase())
    this.metadataMeters = result;
  }

  selectMeterType(query: string): string[] {
    let result: string[] = [];
    for (let a of this.filteredMeters) {
      if (a.deviceName.toLowerCase().indexOf(query) > -1) {
        result.push(a)
      }
    }
    return result
  }

  validateDataFrequency() {
    //if(this.dataFrequency > 24)
  }

  onExport() {
    if (this.exportedData && this.exportedData.length > 0) {
      this.exportedData.forEach((item) => {
        item.PollingDate = this.date.transform(item.PollingDate, 'yyyy-MM-dd')
      })
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exportedData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'Reading History.xlsx');
    }
    else {
      this.notificationMessage("No Data to Export", "yellow-snackbar");
    }
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }

  // setMeterReadingsTrendChart() {
  //   let dctMeterReadings = {};
  //   dctMeterReadings['labels'] = [];
  //   dctMeterReadings['datas'] = [];
  //   let unit = 'KWH';

  //   this.meterReadings = this.setMeterReadingsChart(dctMeterReadings,unit);
  //   let rhcontainer = document.getElementById('rhcontainer');
  //   if (rhcontainer)
  //     Highcharts.chart('rhcontainer', this.meterReadings);
  // }
  
  setMeterReadingsChart(dctTempData,unit,parameter,consumptiondecimalPlaces) {
    let lineChartOptions = {
      chart: {
        height: 387,
        type: 'line'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Meter Reading Trends',
        style: {
          fontFamily: "Roboto",
          fontWeight: "bold"
        }
      },
      subtitle: {
        text: null
      },
      xAxis: [{
        categories: this.formatLabel(dctTempData['labels']),
        //min: 0,
        //max: 10,
        uniqueNames: true,
        //crosshair: true
      }],
      // xAxis: {
      //   categories: this.formatLabel(dctTempData['labels']),
      //   crosshair: true,
      //   tickInterval: 2
      //   // gridLineWidth: 2,
      // },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: parameter + ' in ' + unit,
          style: {
            fontSize: '12px',
            fontFamily: "Roboto"
          }
        }
      },
      // legend: {
      //   itemStyle: {
      //     color: '#000000',
      //     fontWeight: 'normal'
      //   },
      //   layout: 'horizontal',
      //   align: 'center',
      //   verticalAlign: 'top',
      //   x: 0,
      //   y: 0,
      //   floating: false,
      //   shadow: false
      // },
      tooltip: {
        formatter: function () {
          return '' +
            this.x + ': ' + this.y.toFixed(consumptiondecimalPlaces) + unit;
        }
      },
      colors: ['#3366CC'],
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 8,
          // color: '#46b5d1'
          color: 'rgb(63, 81, 181)'
        }
      },
      lang: {
        noData: 'No data to display'

      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        }
      },
      // colors:this.lstColor1,
      series: [
        {
          name: 'Meter Reading',
          data: dctTempData['datas'],
          // type: 'column'

        },]
        ,legend: {
          align: 'center',
          verticalAlign: 'top',
          layout: 'vertical'
        }
    }

    return lineChartOptions;
  }

  formatLabel(labels) {    
    //labels = labels.map(obj => {
      // if (obj.length > 7) {
      //   obj = obj.slice(0, 6) + '..';
      // }
    //   return obj;
    // });
    return labels;
  }
}


