import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Highcharts from 'highcharts';
import { EstidamadashboardService } from './estidamadashboard.service';
import * as moment from 'moment';
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service';
import HighchartsMore from "highcharts/highcharts-more.src.js";
import HC_exporting from "highcharts/modules/exporting";
import noData from 'highcharts/modules/no-data-to-display';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { MatOption } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EstidamaChart } from '../../tabs/shared/models/estidama-chart.model';
import { MasterService } from '../shared/services/master.service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';
HC_exporting(Highcharts);
HighchartsMore(Highcharts);
noData(Highcharts);

@Component({
  selector: 'fury-estidamadashboard',
  templateUrl: './estidamadashboard.component.html',
  styleUrls: ['./estidamadashboard.component.scss']
})
export class EstidamadashboardComponent implements OnInit {

  meterId: string = '';
  meterName: string = '';
  lstMeter: any[] = [];
  lstfliterMeter: any[] = [];
  clientId: string;
  selectedMeters: any[] = [];
  estidamaChart: EstidamaChart = {};
  showSpinner: boolean = false;

  datFrom: Date;
  meterType: number = null;
  overallConsumptionNodata: boolean = true;

  meterTypeId: number = 0;
  meterTypeName: string = '';
  lstMeterType: any[] = [];
  lstMeterGroup: any[] = [];
  meterGroupList: any = [];
  meterGroup: number = 0;
  Highcharts1 = Highcharts;
  chartConstructor1 = 'chart';

  hourlyBarChartOptions = {};
  dailyBarChartOptions = {};
  weeklyBarChartOptions = {};
  monthlyBarChartOptions = {};
  yearlyBarChartOptions = {};

  hourlyConsumption: string = '';
  dailyConsumption: string = '';
  weeklyConsumption: string = '';
  monthlyConsumption: string = '';
  yearlyConsumption: string = '';

  hourlyAverage: string = '';
  dailyAverage: string = '';
  weeklyAverage: string = '';
  monthlyAverage: string = '';
  yearlyAverage: string = '';

  hourlyPeak: string = '';
  dailyPeak: string = '';
  weeklyPeak: string = '';
  monthlyPeak: string = '';
  yearlyPeak: string = '';

  updateFlag1 = false;
  oneToOneFlag1 = true;
  runOutsideAngular1 = false;
  dateFormat = '';
  form: FormGroup;

  @ViewChild('allMetersSelected') private allMetersSelected: MatOption;

  constructor(
    private snackbar: MatSnackBar,
    private dashBoardService: EstidamadashboardService,
    private estidamaChartService: EstidamaChartService,
    private date: DatePipe, private fb: FormBuilder,
    private masterService: MasterService,
    private meterReplacementService: MeterReplacementService,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      meters: ['']
    });

    this.datFrom = new Date();

    this.cookieService.set('ownerId', '0');

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
    //this.clientId = Number(this.cookieService.get('globalClientId'));

    this.getMeterTypes();
    this.getDeviceGroups();
  }

  getDeviceGroups() {
    this.lstMeterGroup = [];
    this.masterService.getUserMasterdata(71, 0).subscribe(meterGroups => {
      this.lstMeterGroup = meterGroups;
      this.lstMeterGroup.splice(0, 0, { id: 0, description: 'All' });
      this.getMeters();
    });
  }

  getData() {
    this.showSpinner = true;
    let hourlyBarChart = {};
    hourlyBarChart['labels'] = [];
    hourlyBarChart['datas'] = [];
    hourlyBarChart['name'] = "Hourly";
    this.hourlyBarChartOptions = this.setBarChart(hourlyBarChart);
    let edcontainer1 = document.getElementById('edcontainer1');
    if (edcontainer1)
      Highcharts.chart('edcontainer1', this.hourlyBarChartOptions);

    let dailyBarChartData = {};
    dailyBarChartData['labels'] = [];
    dailyBarChartData['datas'] = [];
    dailyBarChartData['name'] = 'Daily';
    this.dailyBarChartOptions = this.setBarChart(dailyBarChartData);
    let edcontainer5 = document.getElementById('edcontainer5');
    if (edcontainer5)
      Highcharts.chart('edcontainer5', this.dailyBarChartOptions);

    let weeklyBarChart = {};
    weeklyBarChart['labels'] = [];
    weeklyBarChart['datas'] = [];
    weeklyBarChart['name'] = 'Weekly';
    this.weeklyBarChartOptions = this.setBarChart(weeklyBarChart);
    let edcontainer6 = document.getElementById('edcontainer6');
    if (edcontainer6)
      Highcharts.chart('edcontainer6', this.weeklyBarChartOptions);

    let monthlyBarChartData = {};
    monthlyBarChartData['labels'] = [];
    monthlyBarChartData['datas'] = [];
    monthlyBarChartData['name'] = 'Monthly';
    this.monthlyBarChartOptions = this.setBarChart(monthlyBarChartData);
    let edcontainer3 = document.getElementById('edcontainer3');
    if (edcontainer3)
      Highcharts.chart('edcontainer3', this.monthlyBarChartOptions);

    let yearlyBarChartData = {};
    yearlyBarChartData['labels'] = [];
    yearlyBarChartData['datas'] = [];
    yearlyBarChartData['name'] = 'Yearly'
    this.yearlyBarChartOptions = this.setBarChart(yearlyBarChartData);
    let edcontainer4 = document.getElementById('edcontainer4');
    if (edcontainer4)
      Highcharts.chart('edcontainer4', this.yearlyBarChartOptions);

    let datSelected = moment(this.datFrom).format('YYYY-MM-DD');

    let index = this.selectedMeters.findIndex((meter) => meter == 0)
    if (index >= 0) {
      this.selectedMeters.splice(index, 1);
    }
    this.meterId = this.selectedMeters.join(",");
    if ((this.meterId != '') && (this.meterTypeName != '') && (datSelected != undefined)) {
      this.estidamaChart.MeterId = this.meterId;
      this.estidamaChart.MeterTypeName = this.meterTypeName;
      this.estidamaChart.FromDate = datSelected;
      this.dashBoardService.getChartData(this.estidamaChart).subscribe({
        next: (response: any) => {

          if (response) {
            //this.showSpinner = false;
            let barchartData = response;
            this.hourlyConsumption = response['hourlyConsumption'];
            this.dailyConsumption = response['dailyConsumption'];
            this.weeklyConsumption = response['weeklyConsumption'];
            this.monthlyConsumption = response['monthlyConsumption'];
            this.yearlyConsumption = response['yearlyConsumption'];

            this.hourlyAverage = response['hourlyAverage'];
            this.dailyAverage = response['dailyAverage'];
            this.weeklyAverage = response['weeklyAverage'];
            this.monthlyAverage = response['monthlyAverage'];
            this.yearlyAverage = response['yearlyAverage'];

            this.hourlyPeak = response['hourlyPeak'];
            this.dailyPeak = response['dailyPeak'];
            this.weeklyPeak = response['weeklyPeak'];
            this.monthlyPeak = response['monthlyPeak'];
            this.yearlyPeak = response['yearlyPeak'];

            //Hourly bar chart
            let sideHourlyTitile = '';
            if (this.dailyConsumption) {
              const sideTitiles = this.hourlyConsumption.split(' ');
              sideHourlyTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            Object.keys(barchartData.hourlyChart).map(key => {
              hourlyBarChart['labels'].push(barchartData.hourlyChart[key]['name']);
              hourlyBarChart['datas'].push(Number(barchartData.hourlyChart[key]['value']));
            });
            this.hourlyBarChartOptions = this.setBarChart(hourlyBarChart, sideHourlyTitile, barchartData.hourlyChart, 'Hourly');
            let edcontainer1 = document.getElementById('edcontainer1');
            if (edcontainer1)
              Highcharts.chart('edcontainer1', this.hourlyBarChartOptions);

            //Daily bar chart
            let sideDailyTitile = '';
            if (this.dailyConsumption) {
              const sideTitiles = this.dailyConsumption.split(' ');
              sideDailyTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            Object.keys(barchartData.dailyChart).map(key => {
              dailyBarChartData['labels'].push(barchartData.dailyChart[key]['name']);
              dailyBarChartData['datas'].push(Number(barchartData.dailyChart[key]['value']));
            });
            this.dailyBarChartOptions = this.setBarChart(dailyBarChartData, sideDailyTitile, barchartData.dailyChart);
            let edcontainer5 = document.getElementById('edcontainer5');
            if (edcontainer5)
              Highcharts.chart('edcontainer5', this.dailyBarChartOptions);

            //Weekly bar chart
            let sideWeeklyTitile = '';
            if (this.dailyConsumption) {
              const sideTitiles = this.weeklyConsumption.split(' ');
              sideWeeklyTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            Object.keys(barchartData.weeklyChart).map(key => {
              weeklyBarChart['labels'].push(barchartData.weeklyChart[key]['name']);
              weeklyBarChart['datas'].push(Number(barchartData.weeklyChart[key]['value']));
            });

            this.weeklyBarChartOptions = this.setBarChart(weeklyBarChart, sideWeeklyTitile, barchartData.weeklyChart);
            let edcontainer6 = document.getElementById('edcontainer6');
            if (edcontainer6)
              Highcharts.chart('edcontainer6', this.weeklyBarChartOptions);

            //Monthly bar chart
            let sideMonthlyTitile = '';
            if (this.dailyConsumption) {
              const sideTitiles = this.monthlyConsumption.split(' ');
              sideMonthlyTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            Object.keys(barchartData.monthlyChart).map(key => {
              monthlyBarChartData['labels'].push(barchartData.monthlyChart[key]['name']);
              monthlyBarChartData['datas'].push(Number(barchartData.monthlyChart[key]['value']));
            });

            this.monthlyBarChartOptions = this.setBarChart(monthlyBarChartData, sideMonthlyTitile, barchartData.monthlyChart);
            let edcontainer3 = document.getElementById('edcontainer3');
            if (edcontainer3)
              Highcharts.chart('edcontainer3', this.monthlyBarChartOptions);

            //Yearly bar chart
            let sideYearlyTitile = '';
            if (this.dailyConsumption) {
              const sideTitiles = this.yearlyConsumption.split(' ');
              sideYearlyTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            Object.keys(barchartData.yearlyChart).map(key => {
              yearlyBarChartData['labels'].push(barchartData.yearlyChart[key]['name']);
              yearlyBarChartData['datas'].push(Number(barchartData.yearlyChart[key]['value']));
            });

            this.yearlyBarChartOptions = this.setBarChart(yearlyBarChartData, sideYearlyTitile);
            let edcontainer4 = document.getElementById('edcontainer4');
            if (edcontainer4)
              Highcharts.chart('edcontainer4', this.yearlyBarChartOptions);
            this.showSpinner = false;
          }
        },
        error: (err) => {
          this.showSpinner = false;
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

  getMeterTypes() {
    this.lstMeterType = [];
    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
      if (response) {
        this.lstMeterType = response['meterTypeList'];
        this.meterType = this.lstMeterType[0].meterTypeID;
        this.meterTypeName = this.lstMeterType[0].meterTypeName;
        if (this.lstMeterType.length > 0) {
          this.meterTypeId = this.lstMeterType[0].meterTypeID;
          this.meterTypeName = this.lstMeterType[0].meterTypeName;
        }
        this.getMeters();
      }
    })
  }


  onMeterTypeChange(value) {
    this.meterTypeName = value;
    this.meterTypeId = this.lstMeterType.find(x => x.meterTypeName === value)?.meterTypeID;
    this.getMeters();
  }

  onMeterGroupChange(value) {
    this.meterGroup = value;
    this.getMeters();
  }

  getMeters() {
    this.lstMeter = [];
    this.meterId = '';
    this.selectedMeters = [];
    this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, this.meterGroup ?? 0, this.clientId).subscribe((response: any) => {
      if (response) {
        this.lstMeter = this.lstfliterMeter = response;
      }
    });
  }

  onDropdownChange() {
    this.getData();
  }

  setBarChart(dctTempData, sideTitile: string = '', data: any[] = null, type: string = '') {
    let title = '';
    let minimumDate = '';
    let maximumDate = '';
    if (data && data.length) {
      minimumDate = data[0].fromDate;
      maximumDate = data[0].toDate;
      data.forEach(element => {
        let v = element.fromDate;
        let z = element.toDate;
        minimumDate = (v < minimumDate) ? v : minimumDate;
        maximumDate = (z > maximumDate) ? z : maximumDate;
      });
      if (type && type === 'Hourly') {
        maximumDate = null;
      }
      title = (minimumDate ? '- ' + this.date.transform(minimumDate, this.dateFormat.toString()) : '') + (maximumDate ? '-' + this.date.transform(maximumDate, this.dateFormat.toString()) : '');
    }

    let barChartOptions = {
      chart: {
        height: 325,
        type: 'column',
      },
      credits: {
        enabled: false
      },
      title: {
        text: null
      },
      subtitle: {
        text: null
      },
      xAxis: {
        categories: this.formatLabel(dctTempData['labels']),
        // gridLineWidth: 2,
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: sideTitile,
          style: {
            fontSize: '12px',
            fontFamily: "Roboto"
          }
        }
      },
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal'
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false
      },
      tooltip: {
        formatter: function () {
          return '' +
            this.x + ': ' + this.y;
        }
      },
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
          name: dctTempData['name'] + title,
          data: dctTempData['datas'],
          type: 'column'

        },]
    }

    return barChartOptions;
  }

  formatLabel(labels) {
    labels = labels.map(obj => {
      if (obj.length > 5) {
        obj = obj.slice(0, 5) + '..';
      }
      return obj;
    });
    return labels;
  }

  search(query: string) {
    let result = this.select(query)
    this.lstMeter = result;
  }

  select(query: string): any[] {
    let result: any[] = [];
    if (query) {
      for (let a of this.lstfliterMeter) {
        if (a.deviceName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.lstfliterMeter;
    }
    return result
  }

  toggleMetersAllSelection() {
    if (this.allMetersSelected.selected) {
      this.form.controls.meters
        .patchValue([...this.lstMeter.map(item => item.id), 0]);
    } else {
      this.form.controls.meters.patchValue([]);
    }
  }

  toggleMeterPerOne(all) {
    if (this.allMetersSelected.selected) {
      this.allMetersSelected.deselect();
      return false;
    }
    if (this.form.controls.meters.value.length == this.lstMeter.length)
      this.allMetersSelected.select();
  }

}
