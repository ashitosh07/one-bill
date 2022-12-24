import { Component, HostListener, OnInit } from '@angular/core';
import { OpenTicketsDashboardService } from '../../open-tickets-dashboard/open-tickets-dashboard.service'
import * as Highcharts from 'highcharts';
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OwnerTenantDashboardData } from 'src/app/tabs/shared/models/owner-tenant-dashboard-data.model';
import { TicketlistComponent } from '../../tickets/ticketlist/ticketlist.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MasterService } from 'src/app/tabs/shared/services/master.service';
import { CookieService } from 'ngx-cookie-service';
import { ContractService } from 'src/app/tabs/shared/services/contract.service';
import { TenantOwnerDashboardService } from '../../tenant-owner-dashboard/tenant-owner-dashboard/tenant-owner-dashboard.service';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { getCurrencySymbol } from '@angular/common';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';
import { EnvService } from 'src/app/env.service';
const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)

@Component({
  selector: 'fury-open-tickets-dashboard',
  templateUrl: './open-tickets-dashboard.component.html',
  styleUrls: ['./open-tickets-dashboard.component.scss']
})
export class OpenTicketsDashboardComponent implements OnInit {

  utilityUnit: string = '';
  reportType: string = '';
  dailyChart = ['CurrentMonth', 'PreviousMonth'];
  typeId: number = 1;
  unit: string = '';
  ticketsLength = 0;
  consumptionBarChartOptions = {};
  dctConsumptionChart = {};
  barChartOptions = {};
  dctBarChart = {};
  lstType = ['Consumption', 'Cost'];
  // lstType: ListItem[] = [
  //   { label: 'Unit Consumption', value: 1 },
  //   { label: 'Usage Charge', value: 2 }];
  blnShowChart: boolean = false;
  unitNo;
  utilityType;
  deviceId
  lstunitNo = [];
  lstutilityType = [];
  title: string;
  type: string = 'Consumption';

  LastBill = '0';
  LastBillDate;
  LastConsumption = '0';
  ConsumptionDate;

  LastPaid = '0';
  LastPaidDate;
  TotalDue = '0';

  ownerName = 'Tenant / Owner';

  dateFormat = '';
  currency = '';
  roundFormat = '';
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff');
  roundOff: number = 0;
  currencySymbol: string;
  ownerId = Number(this.cookieService.get('ownerId'));
  blnShow = false;
  role: string;
  dailyTitle: string = '';
  firstDate: Date;
  lastDate: Date;

  clientId: number = 0;

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    if (this.role == 'Admin') {
      this.menuItemService.setIsAuthenticatedUser(true);
      this.cookieService.delete('ownerId', '/', this.envService.cookieDomain);
      this.cookieService.delete('ownerName', '/', this.envService.cookieDomain)
      this.cookieService.delete('external_role', '/', this.envService.cookieDomain);
    }
  }

  constructor(private openticketsService: OpenTicketsDashboardService,
    private tenantOwnerService: TenantOwnerDashboardService,
    private route: ActivatedRoute,
    private masterService: MasterService,
    private menuItemService: MenuItemService,
    private ticketsList: TicketlistComponent,
    private date: DatePipe,
    private jwtHelperService: JwtHelperService,
    private router: Router,
    private decimalPipe: DecimalPipe,
    private cookieService: CookieService,
    private clientSelectionService: ClientSelectionService,
    private contractService: ContractService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
    this.roundFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {
    this.clientSelectionService.setIsClientVisible(false);
    this.currencySymbol = getCurrencySymbol(this.currency, "narrow");


    this.clientId = parseInt(this.cookieService.get('globalClientId'));

    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    let myDate = new Date();
    this.firstDate = new Date(myDate.getFullYear(), myDate.getMonth(), 1);
    this.lastDate = new Date(myDate.getFullYear(), myDate.getMonth() + 1, 0);
    //this.dailyTitle = 'Daily Consumption Chart [KWH] - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());


    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());

    if (this.role == 'Admin')
      this.ownerName = this.cookieService.get('ownerName');

    this.ticketsLength = this.ticketsList.lstData1.length;

    this.dctBarChart['labels'] = [];
    this.dctBarChart['datas'] = [];

    this.barChartOptions = this.openticketsService.setBarChart(this.dctBarChart, '', this.type, '', this.roundOff);
    Highcharts.chart('barChartId', this.barChartOptions);

    this.dctConsumptionChart['labels'] = [];
    this.dctConsumptionChart['datas'] = [];

    this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    Highcharts.chart('barChartId2', this.consumptionBarChartOptions);

    if (this.route) {
      this.route.paramMap.subscribe(params => {
        if (params) {
          this.menuItemService.setIsExteranlUser(this.envService.externalRoles.ownerExternal);

          this.cookieService.set('external_role', this.envService.externalRoles.ownerExternal.toString());
        }
      });
    }
    this.getUnits();
    this.menuItemService.setIsClientChange(true);
  }

  paymentNavigation() {
    this.router.navigateByUrl('bills/tenant-payment');
  }



  setData() {

    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());

    let yAxisTitle = ''; 
    let dctBarChart = {};

    dctBarChart['labels'] = [];
    dctBarChart['datas'] = [];
    this.LastBill = this.decimalPipe.transform(0, this.roundFormat);
    this.LastConsumption = this.decimalPipe.transform(0, this.roundFormat);
    this.TotalDue = this.decimalPipe.transform(0, this.roundFormat);
    this.LastPaid = this.decimalPipe.transform(0, this.roundFormat);
    let unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol;
    this.consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff', this.utilityType);
    if (this.type == 'Consumption') {
      this.roundOff = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
    }
    else {
      this.roundOff = parseInt(this.roundFormat.substring(this.roundFormat.indexOf('-') + 1, this.roundFormat.length));
    }

    this.openticketsService.getOwnerTenantDashboardData(this.ownerId, this.unitNo, this.utilityType, this.clientId, this.typeId, this.deviceId).subscribe((response: OwnerTenantDashboardData) => {
      if (response) {
        if (response.barChartDataList && response.barChartDataList.length) {
          yAxisTitle = (this.type === 'Consumption' ? 'Consumption in [' + this.utilityUnit + ']' : 'Charge in [' + this.currencySymbol + ']')
          let barChartData = response.barChartDataList;

          Object.keys(barChartData).map(key => {
            dctBarChart['labels'].push(barChartData[key]['month']);
            dctBarChart['datas'].push(Number(barChartData[key]['unitConsumption']));
          });

          this.barChartOptions = this.openticketsService.setBarChart(dctBarChart, yAxisTitle, this.type, unit, this.roundOff);
          let barChartId = document.getElementById('barChartId');
          if (barChartId)
            Highcharts.chart('barChartId', this.barChartOptions);
        }
        else {
          this.barChartOptions = this.openticketsService.setBarChart(this.dctBarChart, yAxisTitle, this.type, unit, this.roundOff);
          let barChartId = document.getElementById('barChartId');
          if (barChartId)
            Highcharts.chart('barChartId', this.barChartOptions);
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
        this.blnShowChart = true;
      }
      else {
        this.blnShow = false;
        this.blnShowChart = false;
        this.barChartOptions = this.openticketsService.setBarChart(this.dctBarChart, yAxisTitle, this.type, unit, this.roundOff);
        let barChartId = document.getElementById('barChartId');
        if (barChartId)
          Highcharts.chart('barChartId', this.barChartOptions);
      }
    },

      (error) => {
        this.blnShow = false;
        this.blnShowChart = false;
        this.barChartOptions = this.openticketsService.setBarChart(this.dctBarChart, yAxisTitle, this.type, unit, this.roundOff);
        let barChartId = document.getElementById('barChartId');
        if (barChartId)
          Highcharts.chart('barChartId', this.barChartOptions);
      });

    //   this.dctConsumptionChart = {};
    //   this.dctConsumptionChart['labels'] = [];
    //   this.dctConsumptionChart['datas'] = [];
    // this.tenantOwnerService.getOwnerTenantConsumptionData(this.ownerId, this.unitNo, this.utilityType, this.clientId, this.typeId)
    //   .subscribe((consumption: any) => {
    //   if(consumption)      
    //   {
    //     if (consumption.dayWiseConsumptionDatas && consumption.dayWiseConsumptionDatas.length) {
    //       let consumptionBarChartData = consumption.dayWiseConsumptionDatas;
    //       this.unit = consumption.dayWiseConsumptionDatas[0].unit.toUpperCase();
    //       //this.unit = '[' + this.unit.toUpperCase() + ']';

    //       Object.keys(consumptionBarChartData).map(key => {
    //         this.dctConsumptionChart['labels'].push(consumptionBarChartData[key]['dayId']);
    //         this.dctConsumptionChart['datas'].push(Number(consumptionBarChartData[key]['consumption']));            
    //       });

    //       this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    //       Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
    //     }
    //     else {
    //       this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    //       Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
    //     }
    //   }
    //   else {
    //     //this.blnShow = false;
    //     this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    //     Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
    //   }
    // },
    // (error) => {
    //   //this.blnShow = false;
    //   this.barChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    //   Highcharts.chart('barChartId2', this.barChartOptions);
    // })

    this.setDates();
    this.makeDailyChart();
  }

  getUtilityUnit() {
    this.utilityUnit = '';
    if(this.utilityType != undefined)
    {
      this.tenantOwnerService.getUtilityUnit(this.utilityType).subscribe((response: string) => {
        if (response != '') {
          this.utilityUnit = response['utilityUnit'];
          this.setData();
        }
      });
    }
  }

  onDropdownChange() {
    this.onChangeUtilityType();
    if (this.unitNo != undefined && this.utilityType != undefined) {
      this.getUtilityUnit();
      //this.setData();
    }
    else {
      this.blnShowChart = false;
    }
  }

  getUnits() {

    this.openticketsService.getUnits(this.ownerId).subscribe((response: any) => {
      if (response) {

        this.lstunitNo = [];
        this.lstunitNo = response;

        this.unitNo = this.lstunitNo && this.lstunitNo.length ? this.lstunitNo[0].id : 0;
        this.getUtilities(this.lstunitNo?.[0]?.id);
      }
    })
  }

  onUtilityChange() {
    this.getUtilities(this.unitNo);
  }

  getUtilities(unitId: number) {
    this.lstutilityType = [];
    //this.contractService.getUtilityDetails(this.clientId, unitId).subscribe((response: any) => {
    this.tenantOwnerService.getTenantUtilityDetails(this.ownerId, unitId).subscribe((response: any) => {
      if (response) {
        this.lstutilityType = response;
        if (this.lstutilityType.length > 0) {
          this.utilityType = this.lstutilityType?.[0].utilityTypeId;
          this.deviceId = this.lstutilityType?.[0].id;
          this.onDropdownChange();
        }
      }
    })
  }

  onChangeUtilityType() {
    if (this.utilityType && this.deviceId && this.lstutilityType) {
      this.utilityType = this.lstutilityType.find(x => x.id === this.deviceId)?.utilityTypeId;
    }
  }

  setDailyConsumptionChart(dctTempData) {
    let localRoundOff = 0;
    let localChartType = this.type;
    if (this.consumptionRoundOffFormat && this.type == 'Consumption') {
      localRoundOff = parseInt(this.consumptionRoundOffFormat.substring(this.consumptionRoundOffFormat.indexOf('-') + 1, this.consumptionRoundOffFormat.length));
    }
    else {
      localRoundOff = parseInt(this.roundFormat.substring(this.roundFormat.indexOf('-') + 1, this.roundFormat.length));
    }
    let unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol; //this.unit;
    let yAxisTitle = '';
    if(dctTempData['datas'].length > 0)
    {
      yAxisTitle = (this.type === 'Consumption' ? 'Consumption in [' + this.utilityUnit + ']' : 'Charge in [' + this.currencySymbol + ']')
    }
    
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
        categories: this.formatLabel(dctTempData['labels']),
        // gridLineWidth: 2,
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: yAxisTitle,
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
          if (localChartType == 'Cost') {
            return '' + this.x + ': ' + unit + this.y.toFixed(localRoundOff);
          }
          else {
            return '' + this.x + ': ' + this.y.toFixed(localRoundOff) + unit;
          }
          //return '' + this.x + ': ' + this.y.toFixed(localRoundOff) + unit;
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
          name: this.type,
          data: dctTempData['datas'],
          //type: 'column'
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

  makeDailyChart() {
    //this.dailyTitle = (this.type === 'Unit Consumption' ? 'Consumption in [KWH]' : 'Charge in [' + this.currency + ']')
    this.dctConsumptionChart = {};
    this.dctConsumptionChart['labels'] = [];
    this.dctConsumptionChart['datas'] = [];

    this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
    let barChartId2 = document.getElementById('barChartId2');
    if (barChartId2)
      Highcharts.chart('barChartId2', this.consumptionBarChartOptions);

    if (this.reportType == '') {
      let dailyTypeBtn = document.getElementById(this.dailyChart[0]);
      document.querySelectorAll('.revbuttons button.active').forEach(function (active) {
        active.className = '';
      });
      if (dailyTypeBtn != null) {
        dailyTypeBtn.className = 'active';
        this.reportType = this.dailyChart[0];
      }
    }

    this.tenantOwnerService.getOwnerTenantConsumptionData(this.ownerId, this.unitNo, this.utilityType, this.clientId, this.typeId, this.reportType, this.deviceId).subscribe((consumption: any) => {
      if (consumption) {
        this.dctConsumptionChart = {};
        this.dctConsumptionChart['labels'] = [];
        this.dctConsumptionChart['datas'] = [];

        if (consumption.dayWiseConsumptionDatas && consumption.dayWiseConsumptionDatas.length) {
          let consumptionBarChartData = consumption.dayWiseConsumptionDatas;
          this.unit = consumption.dayWiseConsumptionDatas[0].unit;
          this.unit = this.unit.toUpperCase();

          Object.keys(consumptionBarChartData).map(key => {
            this.dctConsumptionChart['labels'].push(consumptionBarChartData[key]['dayId']);
            this.dctConsumptionChart['datas'].push(Number(consumptionBarChartData[key]['consumption']));
          });

          this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
          let barChartId2 = document.getElementById('barChartId2');
          if (barChartId2)
            Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
        }
        else {
          this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
          let barChartId2 = document.getElementById('barChartId2');
          if (barChartId2)
            Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
        }
      }
      else {
        //this.blnShow = false;
        this.consumptionBarChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
        let barChartId2 = document.getElementById('barChartId2');
        if (barChartId2)
          Highcharts.chart('barChartId2', this.consumptionBarChartOptions);
      }
    },
      (error) => {
        //this.blnShow = false;
        this.barChartOptions = this.setDailyConsumptionChart(this.dctConsumptionChart);
        let barChartId2 = document.getElementById('barChartId2');
        if (barChartId2)
          Highcharts.chart('barChartId2', this.barChartOptions);
      })
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

    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString());
    if (this.unitNo != undefined && this.utilityType != undefined) {
      this.makeDailyChart();
    }
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

  onTypeChange() {
    this.getUtilityUnit();
    //this.type = this.lstType.find(x => x.value == this.typeId).label;
    this.unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol;
    this.setDates();
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString())
    // if (this.unitNo != undefined && this.utilityType != undefined) {
    //   this.setData();
    // }
  }

  onValChange(event: any) {
    this.getUtilityUnit();
    if (event != null)
      this.type = event.value;
    this.typeId = this.type === 'Cost' ? 2 : 1;

    this.unit = this.type === 'Consumption' ? this.utilityUnit : this.currencySymbol; //'KWH' : this.currency;    
    this.setDates();
    this.title = 'Last 12 Months ' + (this.type === 'Consumption' ? ' Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']')
    this.dailyTitle = 'Daily ' + (this.type === 'Consumption' ? 'Consumption Chart [' + this.utilityUnit + ']' : 'Usage Charges Chart [' + this.currencySymbol + ']');
    this.dailyTitle += ' - ' + this.date.transform(this.firstDate.toString(), this.dateFormat.toString()) + '-' + this.date.transform(this.lastDate.toString(), this.dateFormat.toString())
    // if (this.unitNo != undefined && this.utilityType != undefined) {
    //   this.setData();
    // }
  }

}
