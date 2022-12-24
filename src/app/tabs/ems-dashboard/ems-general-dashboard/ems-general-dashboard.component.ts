import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { EmsDashboardService } from '../ems-dashboard.service'
import * as Highcharts from 'highcharts/highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { UtilityDashboard } from '../../shared/models/utility-dashboard.model';
import { UtilityTypeMeterCount } from '../../shared/models/utility-type-meter-count.model';
import { environment } from 'src/environments/environment';
import { CountStat } from './count.model'
import highcharts3D from 'highcharts/highcharts-3d';
import { CookieService } from 'ngx-cookie-service';
import { Observable, interval, Subscription, ReplaySubject } from 'rxjs';
import { EstidamaChart } from '../../shared/models/estidama-chart.model';
import { EstidamadashboardService } from '../../estidamadashboard/estidamadashboard.service';
import { GeneraldashboardService } from '../../../pages/generaldashboard/generaldashboard.service';
import * as moment from 'moment';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { count } from 'console';
import { Item } from '@syncfusion/ej2-angular-navigations';
import { JwtHelperService } from '@auth0/angular-jwt';
import { getClientDataFormat } from '../../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';
import { isNumber } from 'highcharts/highcharts';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
highcharts3D(Highcharts);

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)
@Component({
  selector: 'fury-ems-general-dashboard',
  templateUrl: './ems-general-dashboard.component.html',
  styleUrls: ['./ems-general-dashboard.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation]
})
export class EmsGeneralDashboardComponent implements OnInit {

  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  private groupWiseEnergyCost: any[];

  @Input()
  displayedColumns: ListColumn[] = [
    { name: 'Group Name', property: 'groupName', visible: true, isModelProperty: true },
    { name: 'Consumption', property: 'currentConsumption', visible: true, isModelProperty: false },
    { name: 'Difference', property: 'consumptionDifference ', visible: true, isModelProperty: false },
    { name: ' ', property: 'status', visible: true, isModelProperty: false }
  ] as ListColumn[];

  public pageSize = 8;
  public dataSource: MatTableDataSource<any>;
  public columnsProps: string[] = this.displayedColumns.map((column: ListColumn) => {
    return column.property;
  });

  get visibleColumns() {
    return this.displayedColumns.filter(column => column.visible).map(column => column.property);
  }

  sort;
  //@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if ((this.sort) && (this.dataSource)) {
      this.dataSource.sort = this.sort;
    }
  }

  showSpinner: boolean = false;
  role: string = '';
  energyCostComparison = [];
  costComparisonChart = [];
  currentEnergyCost: number = 0;
  previousEnergyCost: number = 0;
  forecastEnergyCost: number = 0;
  lastPreviousTotalCost: number = 0;
  previousforecastTotalCost: number = 0;
  consumptionData = [];
  consumptionChartData = [];
  consumptionSeriesData = [];
  lineChartOptions = {};
  btuConsumptionData = [];
  electricityConsumptionData = [];
  waterConsumptionData = [];
  gasConsumptionData = [];
  frequency = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  meterTypes = []; //['BTU','Electricity','Gas','Water'];
  costLabelComparison: string = '';
  previousCostLabelComparison: string = '';
  forecastCostLabelComparison: string = '';
  isPreviousCostGain: boolean = false;
  isCurrentCostGain: boolean = false;
  isForecastCostGain: boolean = false;
  currentCostGain: number = 0;
  previousCostGain: number = 0;
  forecastCostGain: number = 0;
  noStackData = true;
  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  gaugeChartOptions = {};
  solidgaugeChartoptions = {};
  data: number[] = [80];
  clientId: string = '0';
  pieChartOptions = {};
  utilityTypeDatas: UtilityDashboard[] = [];
  electricityConsumption: string = '';
  btuConsumption: string = '';
  waterConsumption: string = '';
  gasConsumption: string = '';
  electricityYesterdayConsumption: string = '';
  btuYesterdayConsumption: string = '';
  waterYesterdayConsumption: string = '';
  gasYesterdayConsumption: string = '';
  electricityForecastConsumption: string = '';
  btuForecastConsumption: string = '';
  waterForecastConsumption: string = '';
  gasForecastConsumption: string = '';
  electricityCost: string = '';
  btuCost: string = '';
  waterCost: string = '';
  gasCost: string = '';
  electricityYesterdayCost: string = '';
  btuYesterdayCost: string = '';
  waterYesterdayCost: string = '';
  gasYesterdayCost: string = '';
  electricityForecastCost: string = '';
  btuForecastCost: string = '';
  waterForecastCost: string = '';
  gasForecastCost: string = '';
  selectedValue: string;
  electricityMeterCount: string = '';
  btuMeterCount: string = '';
  waterMeterCount: string = '';
  gasMeterCount: string = '';
  consumptionLabel: string = '';
  previousConsumptionLabel: string = '';
  forecastConsumptionLabel: string = '';
  costLabel: string = '';
  previousCostLabel: string = '';
  forecastCostLabel: string = '';
  currency = '';
  estidamaChart: EstidamaChart = {};

  countStats: CountStat[] = [];
  stackedBarChartOptions: any
  private updateSubscription: Subscription;
  currentChartFileName: string = '';
  previousChartFileName: string = '';
  forecastChartFileName: string = '';

  constructor(private emsDashboardService: EmsDashboardService,
    private snackbar: MatSnackBar,
    private generalDashBoardService: GeneraldashboardService,
    private dashBoardService: EstidamadashboardService,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.currency = getClientDataFormat('Currency') ?? envService.currencyFormat;
  }

  ngOnInit(): void {

    this.cookieService.set('ownerId', '0');
    this.getClientId();
    // this.getEMSDashBoardData();    
    this.currentChartFileName = 'assets/img/Green.png';
    this.previousChartFileName = 'assets/img/Yellow.png';
    this.forecastChartFileName = 'assets/img/Blue.png';
    // this.updateSubscription = interval(300000).subscribe(
    //   () => { 
    //     this.getEMSDashBoardData();
    //   }
    // );    
    this.getUtilities();

    this.selectedValue = 'Daily';
    this.setConsumptionLables();

    //this.getConsumptionData();
    //this.getGroupWiseEnergyCost();
    //this.getEnergyCost();

    // this.onValChange(null);
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

  getEnergyCost() {
    this.showSpinner = false; //true;
    let dctPieTempData = {};
    dctPieTempData['chartName'] = '';
    dctPieTempData['chartValues'] = [];
    dctPieTempData['percentage'] = [];
    this.energyCostComparison = [];
    this.costComparisonChart = [];
    let counter = 0;
    let chartData = [];
    this.currentEnergyCost = 0;
    this.previousEnergyCost = 0;
    this.forecastEnergyCost = 0;
    this.lastPreviousTotalCost = 0;
    this.currentCostGain = 0;
    this.previousCostGain = 0;
    this.forecastCostGain = 0;
    this.isCurrentCostGain = false;
    this.isPreviousCostGain = false;
    this.isForecastCostGain = false;

    this.pieChartOptions = this.setPieChart(dctPieTempData);
    let gdcontainer3 = document.getElementById('gdcontainer3');
    if (gdcontainer3)
      Highcharts.chart('gdcontainer3', this.pieChartOptions);

    this.stackedBarChartOptions = this.setStackedCostComparisonChart(this.energyCostComparison, this.costComparisonChart);
    let gdcontainer5 = document.getElementById('gdcontainer5');
    if (gdcontainer5)
      Highcharts.chart('gdcontainer5', this.stackedBarChartOptions);

    if (this.meterTypes && this.meterTypes.length > 0) {
      let utilityTypes = this.meterTypes.join(",");
      this.emsDashboardService.getGroupWiseEnergyCost(this.clientId, utilityTypes, this.selectedValue).subscribe({
        next: (groupWiseEnergyCost: any[]) => {
          if (groupWiseEnergyCost) {
            this.groupWiseEnergyCost = groupWiseEnergyCost
            this.showSpinner = false; //true;

            //Tile Data
            this.currentEnergyCost = this.groupWiseEnergyCost['currentTotalCost'];
            this.previousEnergyCost = this.groupWiseEnergyCost['previousTotalCost'];
            this.forecastEnergyCost = this.groupWiseEnergyCost['forecastTotalCost'];
            this.lastPreviousTotalCost = this.groupWiseEnergyCost['lastPreviousTotalCost'];
            this.currentCostGain = this.groupWiseEnergyCost['currentCostGain'];
            this.previousCostGain = this.groupWiseEnergyCost['previousCostGain'];
            this.forecastCostGain = this.groupWiseEnergyCost['forecastCostGain'];
            this.isCurrentCostGain = this.currentCostGain > 0 ? true : false;
            this.isPreviousCostGain = this.previousCostGain > 0 ? true : false;
            this.isForecastCostGain = this.forecastCostGain > 0 ? true : false;

            //2D Donut Chart - UtilityWiseEnergyCost
            dctPieTempData['chartValues'] = [];
            this.groupWiseEnergyCost['currentEnergyCost'].forEach(item => {
              dctPieTempData['chartValues'].push([item.utilityType, item.currentConsumption])
            });

            this.pieChartOptions = this.setPieChart(dctPieTempData);
            gdcontainer3 = document.getElementById('gdcontainer3');
            if (gdcontainer3)
              Highcharts.chart('gdcontainer3', this.pieChartOptions);

            this.groupWiseEnergyCost = this.groupWiseEnergyCost['groupWiseEnergyCost'];
            this.groupWiseEnergyCost.forEach(item => {
              item.currentConsumption = item.currentConsumption + item.unit;
              item.costDifference = item.costDifference == null ? '0' : item.costDifference;
            });
            this.dataSource = new MatTableDataSource(this.groupWiseEnergyCost);
            this.subject$.next(this.groupWiseEnergyCost);

            this.dataSource = new MatTableDataSource(this.groupWiseEnergyCost);
            this.data$.pipe(
              filter(data => !!data)
            ).subscribe((groupWiseEnergyCost) => {
              this.groupWiseEnergyCost = groupWiseEnergyCost;
              this.dataSource.data = groupWiseEnergyCost;
            });

            //Stacked Chart - Energy Cost Comparison
            this.energyCostComparison.push(groupWiseEnergyCost['previousEnergyCost']);
            this.energyCostComparison.push(groupWiseEnergyCost['currentEnergyCost']);
            this.costComparisonChart = [];

            this.meterTypes.forEach(meterType => {
              this.energyCostComparison.forEach(item => {
                item.forEach(row => {
                  if (row.utilityType == meterType) {
                    this.costComparisonChart.push(row.currentConsumption)
                  }
                })
              })
              chartData.push({
                name: meterType,
                data: this.costComparisonChart
              })
              this.costComparisonChart = [];
            })

            this.stackedBarChartOptions = this.setStackedCostComparisonChart(this.energyCostComparison, chartData);
            gdcontainer5 = document.getElementById('gdcontainer5');
            if (gdcontainer5)
              Highcharts.chart('gdcontainer5', this.stackedBarChartOptions);
            //this.showSpinner = false; 
          }
          else {
            this.showSpinner = false;
          }
        },
        error: (err) => {
          this.showSpinner = false;
        }
      });
      this.ngAfterViewInit();
    }
    else {
      this.showSpinner = false;
    }
  }


  getUtilities() {
    this.generalDashBoardService.getUtilities(this.clientId).subscribe((response: any) => {
      if (response) {
        this.meterTypes = [];
        response.forEach(item => {
          this.meterTypes.push(item.description);
          this.meterTypes.sort((a, b) => b.localeCompare(a)).reverse();
        });
        this.getConsumptionData();
        this.getEnergyCost();
      }
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  getGroupWiseEnergyCost() {
    this.groupWiseEnergyCost = [];

    let utilityTypes = this.meterTypes.join(",");
    this.emsDashboardService.getGroupWiseEnergyCost(this.clientId, utilityTypes, this.selectedValue).subscribe({
      next: (energyCost: any[]) => {
        this.groupWiseEnergyCost = energyCost['GroupWiseEnergyCost'];
        this.groupWiseEnergyCost.forEach(item => {
          item.currentCost = this.currency + " " + item.currentCost;
          item.costDifference = item.costDifference == null ? '0%' : item.costDifference;
        });
        this.dataSource = new MatTableDataSource(this.groupWiseEnergyCost);
        this.subject$.next(this.groupWiseEnergyCost);
      },
      error: (err) => {
        this.notificationMessage('Group-Wise Energy Cost Not Found.', 'red-snackbar');
      }
    });

    this.dataSource = new MatTableDataSource(this.groupWiseEnergyCost);
    this.data$.pipe(
      filter(data => !!data)
    ).subscribe((groupWiseEnergyCost) => {
      this.groupWiseEnergyCost = groupWiseEnergyCost;
      this.dataSource.data = groupWiseEnergyCost;
    });
    this.ngAfterViewInit();
  }

  ngAfterViewInit() {
    //this.dataSource.paginator = this.paginator;
    if (this.dataSource != undefined) {
      this.dataSource.sort = this.sort;
    }
  }

  getConsumptionData() {
    this.showSpinner = false; //true;
    this.consumptionData = [];
    let labels = [];
    let counter = 0;
    this.consumptionChartData = [];
    this.consumptionSeriesData = [];

    this.lineChartOptions = this.setLineChart(labels, this.consumptionChartData, this.consumptionSeriesData);
    let gdcontainer2 = document.getElementById('gdcontainer2');
    if (gdcontainer2)
      Highcharts.chart('gdcontainer2', this.lineChartOptions);

    let utilityTypes = this.meterTypes.join(",");
    let colors = ['#1fd286', '#1e5eff', '#ffda44', '#d80027', '#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
      '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'];
    if (this.meterTypes && this.meterTypes.length > 0) {
      this.emsDashboardService.getConsumptionData(this.clientId, utilityTypes, this.selectedValue).subscribe({
        next: (response: any) => {
          if (response) {
            this.showSpinner = false; //true;
            let lineChartData = response;
            this.consumptionData = lineChartData.consumptionData;
            this.consumptionData.forEach(item => {
              this.consumptionChartData.push({
                labels: {
                  format: '{value}' + item['unit'],
                  style: {
                    color: colors[counter]
                  }
                },
                title: {
                  text: item['utilityType'],
                  style: {
                    color: colors[counter]
                  }
                },
                opposite: counter % 2 == 0 ? false : true
              });

              this.consumptionSeriesData.push({
                name: item.utilityType,
                type: 'spline',
                yAxis: counter,
                data: item['data'],
                //data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
                marker: {
                  enabled: false
                },
                title: {
                  text: item['utilityType'],
                  style: {
                    color: colors[counter]
                  }
                },
                opposite: counter % 2 == 0 ? false : true
              });
              counter++;
            });

            if (lineChartData.consumptionData[0]) //&& lineChartData.consumptionData[0].length > 0)
              labels = lineChartData.consumptionData[0]['label'] != null ? lineChartData.consumptionData[0]['label'] : [];
            else
              labels = [];

            this.lineChartOptions = this.setLineChart(labels, this.consumptionChartData, this.consumptionSeriesData);
            gdcontainer2 = document.getElementById('gdcontainer2');
            if (gdcontainer2)
              Highcharts.chart('gdcontainer2', this.lineChartOptions);
            this.showSpinner = false;
          }
          else {
            this.showSpinner = false;
          }
        },
        error: (err) => {
          this.showSpinner = false;
        }
      });
    }
    else {
      this.showSpinner = false;
    }
  }


  setStackedCostComparisonChart(dctStackTempData = null, costComparisonChart) {
    let current = '';
    let previous = '';
    let today = new Date();
    let previousDate = new Date();
    if (this.selectedValue == 'Monthly') {
      previousDate.setDate(1);
      previousDate.setMonth(previousDate.getMonth() - 1);
      current = today.toLocaleString('en-us', { month: 'long' });
      previous = previousDate.toLocaleString('en-us', { month: 'long' });
    }
    else if (this.selectedValue == 'Daily') {
      current = 'Today';
      previous = 'Yesterday';
    }
    else if (this.selectedValue == 'Weekly') {
      current = 'This Week';
      previous = 'Last Week';
    }
    else if (this.selectedValue == 'Yearly') {
      current = today.getFullYear().toString();
      previousDate.setFullYear(previousDate.getFullYear() - 1);
      previous = previousDate.getFullYear().toString();
    }

    let chartOptions = {
      chart: {
        type: 'column',
        marginLeft: 130
      },
      title: {
        text: 'Energy Cost Comparison',
        style: {
          fontWeight: 'bolder',
          fontFamily: 'Roboto'
        }
      },
      credits: {
        enabled: false
      },
      colors: ['#1fd286', '#1e5eff', '#ffda44', '#d80027', '#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
      xAxis: {
        categories: [previous, current], //['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
        //stackLabels: {enabled: false},
        //labels: {enabled: false},
        visible: true
      },
      yAxis: {
        title: {
          text: 'Total Cost'
        }
        // ,stackLabels: {
        //     enabled: false,
        //     style: {
        //         fontWeight: 'bold',
        //         color: ( // theme
        //             Highcharts.defaultOptions.title.style &&
        //             Highcharts.defaultOptions.title.style.color
        //         ) || 'gray'
        //     }
        // }
      },
      legend: {
        align: 'center',
        x: 30,
        verticalAlign: 'bottom',
        y: 20,
        floating: false,
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || 'white',
        // borderColor: '#CCC',
        // borderWidth: 1,
        shadow: false
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: ' + this.currency + ' {point.y}' + '<br/>Total: ' + this.currency + ' {point.stackTotal}'
      },
      plotOptions: {
        series: {
          pointWidth: 50
        },
        column: {
          //marginLeft: 10,
          pointWidth: 50,
          stacking: 'normal',
          dataLabels: {
            enabled: false
          }
        }
      },
      series: costComparisonChart,
      // series: [{
      //     name: 'John',
      //     data: [5, 3, 4, 7, 2]
      // }, {
      //     name: 'Jane',
      //     data: [2, 2, 3, 2, 1]
      // }, {
      //     name: 'Joe',
      //     data: [3, 4, 4, 2, 5]
      // }]
    }

    return chartOptions;
  }


  setPieChart(dctPieTempData) {

    let pieOptions = {
      chart: {
        height: 390,
        type: 'pie',
        options3d: {
          enabled: false,
          alpha: 45
        }
      },
      title: {
        text: this.selectedValue + ' Energy Cost',
        align: 'left',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bolder'
        }
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          // color: '#808080'
        }
      },
      // xAxis: {
      //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      // },
      legend: {
        floating: false,
        align: 'left',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        // x: 0,
        // y: -15,
        fontFamily: 'Roboto',
        // labelFormatter: function () {
        //   let modifiedName = this.name.split(' ').slice(0, 2).join('');
        //   return modifiedName.replace(":", "");
        // }
      },

      plotOptions: {
        series: {
          shadow: false
        },
        pointPadding: 0.25,
        pie: {
          innerSize: 150,
          depth: 25,
          colors: ['#1fd286', '#1e5eff', '#ffda44', '#d80027', '#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
            '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
          //   colors: ['#1fd286','#1e5eff','#2f7ed8','#ffda44','#d80027', '#0d233a', '#8bbc21', '#910000', '#1aadce',
          // '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
          // colors: [
          //   Highcharts.getOptions().colors[0],
          //   Highcharts.getOptions().colors[1],
          //   Highcharts.getOptions().colors[2],
          //   Highcharts.getOptions().colors[3]
          //   // '#3c40c6',
          //   // '#ffd32a',
          //   // '#1e90ff',//'#0c2461',
          //   // '#fa983a'

          // ],
        },
      },
      series: [{
        name: 'Amount in ' + this.currency,
        type: 'pie',
        allowPointSelect: true,
        dataLabels: {
          enabled: false,

        },
        keys: ['name', 'y', 'selected', 'sliced'],
        data: dctPieTempData['chartValues'],
        // ['Chrome', 58.9],
        // ['Firefox', 13.29],
        // ['Internet Explorer', 13],
        // ['Edge', 3.78],
        // ['Safari', 3.42]

        showInLegend: true
      }]
    }

    let modifySeriesData = pieOptions.series[0].data
    modifySeriesData.forEach(element => {
      element[0] = element[0] + ": " + " " + this.currency + " " + element[1];
    });
    pieOptions.series[0].data = modifySeriesData

    return pieOptions;
  }

  public onValChange(event: any) {
    if (event != null)
      this.selectedValue = event.value;

    // let selectedButton = document.getElementById(this.selectedValue);
    // this.frequency.forEach(button => {
    //   let btn = document.getElementById(button);
    //   btn.className = 'inactive';
    // });
    // selectedButton.className = 'active';

    //this.selectButton();
    this.setConsumptionLables(event.value);
    // this.getUtilityTypeData(event.value);

    // this.fetchCountData();
    this.getConsumptionData();
    //this.getGroupWiseEnergyCost();
    this.getEnergyCost();
  }

  selectButton() {
    let reportType = '';
    reportType = this.selectedValue == undefined ? 'Daily' : this.selectedValue;
    let selectedButton = document.getElementById(reportType);
    this.frequency.forEach(button => {
      let btn = document.getElementById(button);
      btn.className = 'inactive';
    });
    selectedButton.className = 'active';
  }

  setConsumptionLables(reportType: string = 'Daily') {
    this.consumptionLabel = '';
    this.previousConsumptionLabel = '';
    this.forecastConsumptionLabel = '';
    this.costLabel = '';
    this.previousCostLabel = '';
    this.forecastCostLabel = '';
    if (reportType === 'Daily') {
      this.costLabel = "Today's Energy Cost";
      this.previousCostLabel = "Yesterday's Energy Cost";
      this.forecastCostLabel = "Forecast Energy Cost";
      this.costLabelComparison = " than yesterday";
      this.previousCostLabelComparison = " than day before yesterday";
      this.forecastCostLabelComparison = " than today";
    } else if (reportType === 'Weekly') {
      this.costLabel = 'Current Week Energy Cost';
      this.previousCostLabel = 'Last Week Energy Cost';
      this.forecastCostLabel = 'Forecast Energy Cost';
      this.costLabelComparison = " than last week";
      this.previousCostLabelComparison = " than last week";
      this.forecastCostLabelComparison = " than current week";
    } else if (reportType === 'Monthly') {
      this.costLabel = 'Current Month Energy Cost';
      this.previousCostLabel = 'Last Month Energy Cost';
      this.forecastCostLabel = 'Forecast Energy Cost';
      this.costLabelComparison = " than last month";
      this.previousCostLabelComparison = " than last month";
      this.forecastCostLabelComparison = " than current month";
    } else {
      this.costLabel = 'Current Year Energy Cost';
      this.previousCostLabel = 'Last Year Energy Cost';
      this.forecastCostLabel = 'Forecast Energy Cost';
      this.costLabelComparison = " than last year";
      this.previousCostLabelComparison = " than last year";
      this.forecastCostLabelComparison = " than current year";
    }
  }

  reset() {
    this.electricityConsumption = '';
    this.electricityYesterdayConsumption = '';
    this.electricityForecastConsumption = '';
    this.btuConsumption = '';
    this.btuYesterdayConsumption = '';
    this.btuForecastConsumption = '';
    this.waterConsumption = '';
    this.waterYesterdayConsumption = '';
    this.waterForecastConsumption = '';
    this.gasConsumption = '';
    this.gasYesterdayConsumption = '';
    this.gasForecastConsumption = '';
    this.electricityCost = '';
    this.btuCost = '';
    this.waterCost = '';
    this.gasCost = '';
    this.electricityYesterdayCost = '';
    this.btuYesterdayCost = '';
    this.waterYesterdayCost = '';
    this.gasYesterdayCost = '';
    this.electricityForecastCost = '';
    this.btuForecastCost = '';
    this.waterForecastCost = '';
    this.gasForecastCost = '';
  }


  setLineChart(labels = [], consumptionChartData = [], consumptionSeriesData = []) {

    //let tempLabels = dctSplineChart.label;

    const splineChartOptions =
    {
      chart: {
        zoomType: 'xy'
      },
      colors: ['#1fd286', '#1e5eff', '#ffda44', '#d80027', '#808080', '#0d233a', '#8bbc21', '#910000', '#1aadce',
        '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
      credits: {
        enabled: false
      },
      title: {
        text: this.selectedValue + ' Consumption',
        align: 'left',
        style: {
          fontWeight: 'bold',
          fontFamily: 'Roboto',
        }
      },
      xAxis: [
        {
          categories: isNaN(labels?.[0]) == false ? this.formatLabel(labels) : labels,
          // ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          //   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          // ],
          crosshair: true
          //,min: 1
        }],
      yAxis: consumptionChartData,
      // yAxis: [{ // Primary yAxis
      //   labels: {
      //     format: this.btuConsumptionData['unit'],
      //     style: {
      //       color: Highcharts.getOptions().colors[0]
      //     }
      //   },
      //   title: {
      //     text: this.btuConsumptionData['utilityType'],
      //     style: {
      //       color: Highcharts.getOptions().colors[0]
      //     }
      //   } //,opposite: true           
      // }, 
      //{ // Secondary yAxis
      //     gridLineWidth: 0,
      //     title: {
      //       text: this.electricityConsumptionData['utilityType'],
      //       style: {
      //         color: Highcharts.getOptions().colors[1]
      //       }
      //     },
      //     labels: {
      //       format: this.electricityConsumptionData['unit'],
      //       style: {
      //         color: Highcharts.getOptions().colors[1]
      //       }
      //     }    
      //   } 
      //   ,{ // Tertiary yAxis
      //     gridLineWidth: 0,
      //     title: {
      //       text: this.waterConsumptionData['utilityType'],
      //       style: {
      //         color: Highcharts.getOptions().colors[2]
      //       }
      //     },
      //     labels: {
      //       format: this.waterConsumptionData['unit'],
      //       style: {
      //         color: Highcharts.getOptions().colors[2]
      //       }
      //     },
      //     opposite: true
      //   },
      //   { // Fourth yAxis
      //     gridLineWidth: 0,
      //     title: {
      //       text: this.gasConsumptionData['utilityType'],
      //       style: {
      //         color: Highcharts.getOptions().colors[3]
      //       }
      //     },
      //     labels: {
      //       format: this.gasConsumptionData['unit'],
      //       style: {
      //         color: Highcharts.getOptions().colors[3]
      //       }
      //     },
      //     opposite: true
      //   }
      // ],
      tooltip: {
        shared: true
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        //x: 180,
        verticalAlign: 'top',
        //y: 55,
        floating: true,
        backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || // theme
          'rgba(255,255,255,0.25)'
      },
      series: consumptionSeriesData,
      
      // series: [{

      //     name: this.meterTypes[0] != null ? this.meterTypes[0] : '',
      //     type: 'spline',
      //     data: this.btuConsumptionData['data'],          
      //     marker: {
      //             enabled: false
      //           },
      //           tooltip: {
      //             valueSuffix: this.btuConsumptionData['unit']
      //           }   
      // },
      //   {
      //     name: this.meterTypes[1] != null ? this.meterTypes[1] : '',
      //     type: 'spline',
      //     yAxis: 1,
      //     data: this.electricityConsumptionData['data'],
      //     //data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
      //     marker: {
      //       enabled: false
      //     },
      //     dashStyle: 'shortdot',
      //     tooltip: {
      //       valueSuffix: this.electricityConsumptionData['unit'] 
      //     }    
      //   }, {
      //     name: this.meterTypes[2] != null ? this.meterTypes[2] : '',
      //     type: 'spline',
      //     yAxis: 2,
      //     data: this.waterConsumptionData['data'],
      //     //data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
      //     marker: {
      //       enabled: false
      //     },
      //     tooltip: {
      //       valueSuffix: this.waterConsumptionData['unit'] 
      //     }
      //   }, {
      //     name: this.meterTypes[3] != null ? this.meterTypes[3] : '',
      //     type: 'spline',
      //     yAxis: 3,
      //     data: this.gasConsumptionData['data'],
      //     //data: [5.0, 6, 10.5, 11.5, 15.2, 24.5, 25, 27.5, 20.3, 19.4, 10.1, 8.4],
      //     marker: {
      //       enabled: false
      //     },
      //     tooltip: {
      //       valueSuffix: this.gasConsumptionData['unit']
      //     }
      //   }
      // ],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              floating: false,
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
              x: 0,
              y: 0
            },
            yAxis: [{
              labels: {
                align: 'right',
                x: 0,
                y: -6
              },
              showLastLabel: false
            }, {
              labels: {
                align: 'left',
                x: 0,
                y: -6
              },
              showLastLabel: false
            }, {
              visible: false
            }]
          }
        }]
      }
    }
    return splineChartOptions;

  }

  formatLabel(labels) {
    if (labels != null) {
      // if (!isNaN(labels))
      // {
      //   return labels + 1;
      // }
      // else {
        labels = labels.map(obj => {
          if ((obj.length > 3) && (this.selectedValue == 'Monthly')) {
            obj = obj.slice(0, 3);
          }
          return obj;
        });
      //}
    }
    return labels;
  }

}
