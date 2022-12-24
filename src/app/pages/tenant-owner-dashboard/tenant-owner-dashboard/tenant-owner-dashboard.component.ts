import { Component, OnInit } from '@angular/core';
import { TenantOwnerDashboardService } from './tenant-owner-dashboard.service'
import * as Highcharts from 'highcharts';
import { NewsComponent } from './news/news.component';
import { AccountStatus } from 'src/app/tabs/shared/models/account-status.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AverageMonthlyUsage } from 'src/app/tabs/shared/models/average-monthly-usage.model';
import { OwnerTenantDashboardData } from 'src/app/tabs/shared/models/owner-tenant-dashboard-data.model';
import { Router } from '@angular/router';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { getCurrencySymbol } from '@angular/common';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)
@Component({
  selector: 'fury-tenant-owner-dashboard',
  templateUrl: './tenant-owner-dashboard.component.html',
  styleUrls: ['./tenant-owner-dashboard.component.scss']
})
export class TenantOwnerDashboardComponent implements OnInit {

  utilityUnit: string = '';
  reportType: string = '';
  dailyChart = ['CurrentMonth', 'PreviousMonth'];
  barChartOptions = {};
  consumptionBarChartOptions = {};
  dctBarChart = {};
  dctConsumptionChart = {};
  unitNo: string;
  unit: string = '';
  utilityType: string;
  deviceId: number = 0;
  lstunitNo = [];
  lstutilityType = [];
  lstType = ['Consumption', 'Cost'];
  // lstType: ListItem[] = [
  //   { label: 'Unit Consumption', value: 1 },
  //   { label: 'Usage Charge', value: 2 }];
  LastBill = '0';
  LastBillDate: string = '';
  LastConsumption = '0';
  ConsumptionDate: string;
  typeId: number = 1;
  type: string = 'Consumption';
  LastPaid = '0';
  LastPaidDate: string;
  TotalDue = '0';
  title: string = '';
  dailyTitle: string = '';
  ownerId: number;

  dateFormat = '';
  currency = '';
  roundFormat = '';
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff'); //?? environment.consumptionRoundOffFormat;
  roundOff: number = 0;
  currencySymbol: string;

  blnShow = false;
  ownerName: string = '';
  clientId: string;
  firstDate: Date;
  lastDate: Date;

  constructor(
    private tenantOwnerService: TenantOwnerDashboardService,
    private newsComponent: NewsComponent,
    private router: Router,
    private date: DatePipe,
    private decimalPipe: DecimalPipe,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {

    this.clientSelectionService.setIsClientVisible(false);
    this.currencySymbol = getCurrencySymbol(this.currency, "narrow");
    this.clientId = this.cookieService.get('globalClientId');

    this.dctBarChart['labels'] = [];
    this.dctBarChart['datas'] = [];
    let myDate = new Date();
    this.firstDate = new Date(myDate.getFullYear(), myDate.getMonth(), 1);
    this.lastDate = new Date(myDate.getFullYear(), myDate.getMonth() + 1, 0);
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());
    //this.title = 'Last 12 Months Usage Chart [KWH]';
    //this.dailyTitle = 'Daily Consumption Chart [KWH] - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());
    let unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol;
    this.setConsumptionRoundOff(0);
    this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, unit);
    let tbarChartId = document.getElementById('tbarChartId');
    if (tbarChartId)
      Highcharts.chart('tbarChartId', this.barChartOptions);

    this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, '', this.type);
    let tbarChartId2 = document.getElementById('tbarChartId2');
    if (tbarChartId2)
      Highcharts.chart('tbarChartId2', this.consumptionBarChartOptions);

    this.ownerId = Number(this.cookieService.get('ownerId'));
    this.tenantOwnerService.getOwnerTenantName(this.ownerId).subscribe((ownerName: string) => {
      if (ownerName) {
        this.ownerName = ownerName['ownerTenantName']
      }
    })
    this.getUnits();
    //this.getUtilities();
  }

  paymentNavigation() {
    this.router.navigateByUrl('bills/tenant-payment');
  }

  getUnits() {

    this.tenantOwnerService.getUnits(this.ownerId).subscribe((response: any) => {
      if (response) {
        this.lstunitNo = [];
        this.lstunitNo = response;

        if (this.lstunitNo.length > 0) {
          this.unitNo = this.lstunitNo?.[0].id;
          this.getUtilities();
        }
      }
    })
  }

  getUtilities() {
    if (this.unitNo != undefined) {
      //this.tenantOwnerService.getUtilitiesForUnit(this.ownerId, this.unitNo).subscribe((response: any) => {
      this.tenantOwnerService.getTenantUtilityDetails(this.ownerId, this.unitNo).subscribe((response: any) => {
        if (response) {
          this.lstutilityType = [];
          this.lstutilityType = response;

          if (this.lstutilityType.length > 0) {
            this.utilityType = this.lstutilityType?.[0].utilityTypeId;
            this.deviceId = this.lstutilityType?.[0].id;
            this.getUtilityUnit();
          }
        }
      })
    }
  }

  getUtilityUnit() {
    this.utilityUnit = '';
    this.tenantOwnerService.getUtilityUnit(this.utilityType).subscribe((response: string) => {
      if (response != '') {
        this.utilityUnit = response['utilityUnit'];
        this.setData();
      }
    });
  }

  onDropdownChange() {

    //if (this.unitNo != undefined && this.utilityType != undefined) {
    this.getUtilities();
    //this.setData();
    //}
  }

  onUtilityTypeChange() {
    this.onChangeUtilityType();
    this.getUtilityUnit();
    //this.setData();
  }

  onChangeUtilityType() {
    if (this.utilityType && this.deviceId && this.lstutilityType) {
      this.utilityType = this.lstutilityType.find(x => x.id === this.deviceId)?.utilityTypeId;
    }
  }

  setButtonStyle() {
    let btn = document.getElementById(this.reportType);
    document.querySelectorAll('.revbuttons button.active').forEach(function (active) {
      active.className = '';
    });
    btn.className = 'active';
  }

  onTypeChange() {
    //this.type = this.lstType.find(x => x.value == this.typeId).label;
    this.unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol; //'KWH' : this.currency;    
    this.setDates();
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString())
    if (this.unitNo != undefined && this.utilityType != undefined) {
      this.setData();
    }
  }

  onValChange(event: any) {
    if (event != null)
      this.type = event.value;
    this.unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol; //'KWH' : this.currency;    
    this.typeId = this.type === 'Cost' ? 2 : 1;

    this.setDates();
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString())

    this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, '', this.type, this.unit);
    let tbarChartId = document.getElementById('tbarChartId');
    if (tbarChartId)
      Highcharts.chart('tbarChartId', this.barChartOptions);

    this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, '', this.type);
    let tbarChartId2 = document.getElementById('tbarChartId2');
    if (tbarChartId2)
      Highcharts.chart('tbarChartId2', this.consumptionBarChartOptions);

    if (this.unitNo != undefined && this.utilityType != undefined) {
      this.setData();
    }
  }

  setConsumptionRoundOff(utilityType) {
    this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', utilityType);
    if ((this.consumptionRoundOffFormat) && (this.type == 'Consumption')) {
      this.roundOff = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
    }
    else {
      this.roundOff = parseInt(this.roundFormat.substring(this.roundFormat.indexOf('-') + 1, this.roundFormat.length));
    }
  }

  setData() {
    //this.dctConsumptionChart, '', this.type

    this.dctBarChart = {};
    this.dctBarChart['labels'] = [];
    this.dctBarChart['datas'] = [];
    this.LastBill = this.decimalPipe.transform(0, this.roundFormat);
    this.LastConsumption = this.decimalPipe.transform(0, this.roundFormat);
    this.TotalDue = this.decimalPipe.transform(0, this.roundFormat);
    this.LastPaid = this.decimalPipe.transform(0, this.roundFormat);
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());
    let unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol;
    this.setConsumptionRoundOff(Number(this.utilityType));

    const title = (this.type === 'Consumption' ? 'Consumption in [' + this.utilityUnit + ']' : 'Charge in [' + this.currencySymbol + ']')
    if (this.unitNo != undefined && this.utilityType != undefined) {

      this.tenantOwnerService.getOwnerTenantDashboardData(this.ownerId, this.unitNo, this.utilityType, Number(this.clientId), this.typeId, this.deviceId).subscribe((response: OwnerTenantDashboardData) => {
        if (response) {

          if (response.barChartDataList && response.barChartDataList.length) {
            let barChartData = response.barChartDataList;

            this.dctBarChart = {};
            this.dctBarChart['labels'] = [];
            this.dctBarChart['datas'] = [];

            Object.keys(barChartData).map(key => {
              this.dctBarChart['labels'].push(barChartData[key]['month']);
              this.dctBarChart['datas'].push(Number(barChartData[key]['unitConsumption']));
            });

            this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, title, this.type, unit, this.roundOff);
            let tbarChartId = document.getElementById('tbarChartId');
            if (tbarChartId)
              Highcharts.chart('tbarChartId', this.barChartOptions);
          }
          else {
            this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, title, this.type, unit, this.roundOff);
            let tbarChartId = document.getElementById('tbarChartId');
            if (tbarChartId)
              Highcharts.chart('tbarChartId', this.barChartOptions);
          }
          if (response.accountStatus) {
            this.LastPaid = this.decimalPipe.transform(response.accountStatus.lastPaid, this.roundFormat);
            if (response.accountStatus.lastPaidDate.toString() != '1900-01-01T00:00:00') {
              this.LastPaidDate = this.date.transform(response.accountStatus.lastPaidDate, this.dateFormat.toString());
            }
            if (response.accountStatus.totalDue < 0) {
              this.TotalDue = '(' + this.decimalPipe.transform(response.accountStatus.totalDue.toString(), this.roundFormat) + ')';
            }
            else {
              this.TotalDue = this.decimalPipe.transform(response.accountStatus.totalDue.toString(), this.roundFormat);
            }
          }
          if (response.averageMonthlyUsage) {
            this.LastBill = this.decimalPipe.transform(response.averageMonthlyUsage.lastBill, this.roundFormat);
            if (response.averageMonthlyUsage.lastBillDate != undefined && response.averageMonthlyUsage.lastBillDate.toString() != '1900-01-01T00:00:00')
              this.LastBillDate = this.date.transform(response.averageMonthlyUsage.lastBillDate, this.dateFormat.toString());
            this.LastConsumption = this.decimalPipe.transform(response.averageMonthlyUsage.lastConsumption, this.roundFormat);
            if (response.averageMonthlyUsage.consumptionDate != undefined && response.averageMonthlyUsage.consumptionDate.toString() != '1900-01-01T00:00:00')
              this.ConsumptionDate = this.date.transform(response.averageMonthlyUsage.consumptionDate, this.dateFormat.toString());
          }

          this.blnShow = true;
        }
        else {
          this.blnShow = false;
          this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, title, this.type, unit, this.roundOff);
          let tbarChartId = document.getElementById('tbarChartId');
          if (tbarChartId)
            Highcharts.chart('tbarChartId', this.barChartOptions);
        }
      },

        (error) => {
          this.blnShow = false;
          this.barChartOptions = this.tenantOwnerService.setBarChart(this.dctBarChart, title, this.type, unit, this.roundOff);
          let tbarChartId = document.getElementById('tbarChartId');
          if (tbarChartId)
            Highcharts.chart('tbarChartId', this.barChartOptions);
        }
      );
    }

    if (this.reportType == '') {
      this.reportType = this.dailyChart[0];
      let dailyTypeBtn = document.getElementById(this.dailyChart[0]);
      document.querySelectorAll('.revbuttons button.active').forEach(function (active) {
        active.className = '';
      });
      dailyTypeBtn.className = 'active';
    }
    this.setDates();
    this.makeDailyChart();
  }


  makeDailyChart() {
    let dailyTitle = '';  //(this.type === 'Consumption' ? 'Consumption in [' + this.utilityUnit + ']' : 'Charge in [' + this.currencySymbol + ']')
    this.dctConsumptionChart = {};
    this.dctConsumptionChart['labels'] = [];
    this.dctConsumptionChart['datas'] = [];

    //this.setConsumptionRoundOff(Number(this.utilityType));
    if (this.unitNo && this.utilityType) {
      this.tenantOwnerService.getOwnerTenantConsumptionData(this.ownerId, this.unitNo, this.utilityType, this.clientId, this.typeId, this.reportType, this.deviceId).subscribe((consumption: any) => {
        if (consumption) {
          this.dctConsumptionChart = {};
          this.dctConsumptionChart['labels'] = [];
          this.dctConsumptionChart['datas'] = [];

          if (consumption.dayWiseConsumptionDatas && consumption.dayWiseConsumptionDatas.length) {
            dailyTitle = (this.type === 'Consumption' ? 'Consumption in [' + this.utilityUnit + ']' : 'Charge in [' + this.currencySymbol + ']')

            let consumptionBarChartData = consumption.dayWiseConsumptionDatas;
            this.unit = consumption.dayWiseConsumptionDatas[0].unit;
            this.unit = this.unit.toUpperCase();

            Object.keys(consumptionBarChartData).map(key => {
              this.dctConsumptionChart['labels'].push(consumptionBarChartData[key]['dayId']);
              this.dctConsumptionChart['datas'].push(Number(consumptionBarChartData[key]['consumption']));
            });

            this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, dailyTitle, this.type);
            let tbarChartId2 = document.getElementById('tbarChartId2');
            if (tbarChartId2)
              Highcharts.chart('tbarChartId2', this.consumptionBarChartOptions);
          }
          else {
            this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, dailyTitle, this.type);
            let tbarChartId2 = document.getElementById('tbarChartId2');
            if (tbarChartId2)
              Highcharts.chart('tbarChartId2', this.consumptionBarChartOptions);
          }
        }
        else {
          //this.blnShow = false;
          this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, dailyTitle, this.type);
          let tbarChartId2 = document.getElementById('tbarChartId2');
          if (tbarChartId2)
            Highcharts.chart('tbarChartId2', this.consumptionBarChartOptions);
        }
      },
        (error) => {
          //this.blnShow = false;
          //this.barChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, dailyTitle, this.type);
          this.barChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart, '', this.type);
          let tbarChartId2 = document.getElementById('tbarChartId2');
          if (tbarChartId2)
            Highcharts.chart('tbarChartId2', this.barChartOptions);
        });
    }
  }

  setDailyConsumptionChart(dctTempData, title = 'Consumption in [' + this.utilityUnit + ']', type = 'Consumption') {
    let localRoundOff = 0;
    let localChartType = type;
    if ((this.consumptionRoundOffFormat) && (this.type == 'Consumption')) {
      localRoundOff = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
    }
    else {
      localRoundOff = parseInt(this.roundFormat.substring(this.roundFormat.indexOf('-') + 1, this.roundFormat.length));
    }
    let unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol;
    let barChartOptions = {
      chart: {
        height: 325,
        type: 'line',
      },
      credits: {
        enabled: false
      },
      title: {
        text: '',
        style: {
          fontFamily: "Roboto",
          fontWeight: "bold"
        }
      },
      subtitle: {
        text: null
      },
      xAxis: {
        categories: dctTempData['labels'] != undefined ? this.formatLabel(dctTempData['labels']) : '',
        // gridLineWidth: 2,
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: title,
          style: {
            fontSize: '12px',
            fontFamily: "Roboto"
          }
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
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal'
        },
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false
      },
      tooltip: {
        formatter: function () {
          if (localChartType == 'Cost') {
            return '' + this.x + ': ' + unit + this.y.toFixed(localRoundOff);
          }
          else {
            return '' + this.x + ': ' + this.y.toFixed(localRoundOff) + unit;
          }
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
      // lang: {
      //   noData: 'No data to display'
      // },
      // noData: {
      //   style: {
      //     fontWeight: 'bold',
      //     fontSize: '15px',
      //   }
      // },
      //// colors:this.lstColor1,
      series: [
        {
          name: type,
          data: dctTempData['datas'],
          //type: 'Unit Consumption'

        },]
    }

    return barChartOptions;
  }

  formatLabel(labels) {
    labels = labels.map(obj => {
      if (obj.length > 7) {
        obj = obj.slice(0, 5) + '..';
      }
      // obj = this.titlecasePipe.transform(obj);
      return obj;
    });
    return labels;
  }

  showDailyData(event) {
    let target = event.target || event.srcElement || event.currentTarget;
    let idAttr = target.attributes.id;
    let value = idAttr.nodeValue;
    let btn = document.getElementById(value);
    document.querySelectorAll('.revbuttons button.active').forEach(function (active) {
      active.className = '';
    });
    btn.className = 'active';
    this.reportType = value;

    this.setDates();
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());
    this.makeDailyChart();
  }

  setDates() {
    let myDate = new Date();
    if (this.reportType == 'CurrentMonth') {
      this.firstDate = new Date(myDate.getFullYear(), myDate.getMonth(), 1);
      this.lastDate = new Date(myDate.getFullYear(), myDate.getMonth() + 1, 0);
    }
    else if (this.reportType == 'PreviousMonth') {
      this.firstDate = new Date(myDate.getFullYear(), myDate.getMonth() - 1, 1);
      this.lastDate = new Date(myDate.getFullYear(), myDate.getMonth(), 0);
    }
  }


}
