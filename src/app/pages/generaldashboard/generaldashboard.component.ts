import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { PagesserviceService } from '../../pages/pagesservice.service'
import { GeneraldashboardService } from './generaldashboard.service'
import * as Highcharts from 'highcharts'
import { reduce, switchAll } from 'rxjs/operators'
import { CurrencyPipe, TitleCasePipe, DecimalPipe } from '@angular/common'
import { MenuItemService } from 'src/app/tabs/shared/services/menu-item.service'
import { environment } from 'src/environments/environment'
import { style } from '@angular/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MetadataUtilityType } from './../../tabs/shared/models/metadata.utility-type.model'
import { Observable, Subscription } from 'rxjs'
import { UserfilterService } from 'src/app/tabs/shared/services/userfilter.service'
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model'
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from '../../tabs/shared/services/dataservice'
import { DashboardParameters } from 'src/app/tabs/shared/models/dashboard-parameters.model'
import * as moment from 'moment'
import highcharts3D from 'highcharts/highcharts-3d'
highcharts3D(Highcharts)
import { DatePipe } from '@angular/common'
import { CookieService } from 'ngx-cookie-service'
import HighchartsMore from 'highcharts/highcharts-more.src.js'
import HC_exporting from 'highcharts/modules/exporting'
import HC_ExportData from 'highcharts/modules/export-data'
import { MasterService } from 'src/app/tabs/shared/services/master.service'
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility'
import { RevenueData } from '../../tabs/shared/models/revenue-data.model'
import { QuarterData } from '../../tabs/shared/models/quarter-data.model'
import { UnitConsumption } from '../../tabs/shared/models/unit-consumption.model'
import { ClientFormats } from 'src/app/tabs/shared/models/client-formats.model'
import { getCurrencySymbol } from '@angular/common'
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service'
import { EnvService } from 'src/app/env.service'
import offlineExporting from 'highcharts/modules/offline-exporting'
import offlineOption from 'highcharts/modules/offline-exporting'
import exportingOption from 'highcharts/modules/exporting'
import HC_More from 'highcharts/highcharts-more'
exportingOption(Highcharts)
offlineOption(Highcharts)
offlineExporting(Highcharts)
HC_exporting(Highcharts)
HighchartsMore(Highcharts)
HC_More(Highcharts)
HC_ExportData(Highcharts)
const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)

@Component({
  selector: 'fury-generaldashboard',
  templateUrl: './generaldashboard.component.html',
  styleUrls: ['./generaldashboard.component.scss'],
  providers: [PagesserviceService, TitleCasePipe],
})
export class GeneraldashboardComponent implements OnInit {
  clientId: number
  hideMoreInfo: boolean
  hideTextOnTile: boolean = false

  gain: number = 0
  isGain: boolean = false
  toolTip: string = ''
  outstandingPercentage: number = 0
  isOutstandingIncreased: boolean = false
  overallConsumptionNodata: boolean = true
  meterNodata: boolean = true
  unitNodata: boolean = true
  revenueNodata: boolean = true
  invoiceNodata: boolean = true
  consolidated: boolean = false
  contractsAboutToExpire: number = 0
  numberOfOpenTickets: number = 0
  consumptionUnit: string

  utilityType: Number = 0
  lstutilityType = []
  invoiceDate: string = ''

  currencyType = getClientDataFormat('Currency') //?? environment.currencyFormat;
  roundFormat = getClientDataFormat('RoundOff') //?? environment.roundOffFormat;
  consumptionRoundOffFormat = getClientDataFormat('ConsumptionRoundOff') //?? environment.consumptionRoundOffFormat;
  currencySymbol: string

  amountdecimalPlaces: number
  consumptiondecimalPlaces: number
  Highcharts1 = Highcharts
  chartConstructor1 = 'chart'
  barChartOptions = {}
  pieChartOptions = {}
  dailyRevenueOptions = {}
  quarterWiseColumnChartOptions = {}
  quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  revenueTypes = ['CurrentMonth', 'PreviousMonth', 'CurrentYear']
  allQuarterData = []
  currentQuarterData = []
  totalMonthCollectionForTile$: any //Observable<any>
  totalOutStandingForTile$: any //Observable<any>

  lineChartOptions = {}
  unitConsumptionbarChartOptions = {}
  dashboardTitle: string = 'Dashboard'
  consumptionTitle: string = 'Overall Consumption'

  meterBarChartOptions: any
  unitBarChartOptions: any

  updateFlag1 = false
  oneToOneFlag1 = true
  runOutsideAngular1 = false
  dashboardParameters: DashboardParameters = {}

  invoiceData = []
  unitNo: Number
  utilityTypeId: Number
  manageParams: ManageParams = {}
  expiryReminder: boolean = false
  fromQuickPanel: boolean = false
  parameterValue: boolean = false

  constructor(
    private pagesService: PagesserviceService,
    private data: DataService,
    private decimalPipe: DecimalPipe,
    private generalDashBoardService: GeneraldashboardService,
    private currency: CurrencyPipe,
    private menuItemService: MenuItemService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private router: Router,
    private date: DatePipe,
    private cookieService: CookieService,
    private masterService: MasterService,
    private clientSelectionService: ClientSelectionService,
    private envService: EnvService
  ) {}

  ngOnInit(): void {
    this.currencySymbol = getCurrencySymbol(this.currencyType, 'narrow')

    this.masterService
      .getParameterValue('TicketTile')
      .subscribe((parameterValue: boolean) => {
        if (parameterValue) {
          this.parameterValue = parameterValue
        }
      })
    this.cookieService.set('ownerId', '0')
    this.clientId = Number(this.cookieService.get('globalClientId'))

    const external_roleId = this.cookieService.get('external_role')
    if (external_roleId) {
      this.cookieService.delete(
        'external_role',
        '/',
        this.envService.cookieDomain
      )
      this.menuItemService.setIsAuthenticatedUser(true)
    }
    this.clientSelectionService.setIsClientVisible(false)
    this.getFilterParams()
    this.getUtilities()
    this.getCountOfContractsAboutToExpire()
    this.getNumberOfOpenTickets()
  }

  getFilterParams() {
    this.invoiceDate = ''
    const filterData = this.cookieService.get('filterData')
    if (filterData) {
      this.manageParams = JSON.parse(filterData)
      this.clientId = this.manageParams.clientId
      if (this.manageParams.strClientId == '') {
        this.fromQuickPanel = false
      } else {
        this.fromQuickPanel = true
        let clients = this.manageParams.strClientId.split(',')
        if (clients && clients.length == 1) {
          this.clientId = Number(this.manageParams.strClientId)
        }
      }

      if (this.clientId) {
        const clientsList = localStorage.getItem('userClients')
        const clientData = JSON.parse(clientsList)
        const selectClient = clientData.find((x) => x.clientId == this.clientId)
        if (selectClient) {
          this.dashboardTitle = `Dashboard -  ${selectClient.clientName}`
          this.consumptionTitle = `Overall Consumption -  ${selectClient.clientName}`
          this.hideMoreInfo = true
          this.manageParams.strClientId = this.clientId.toString()
          const startDate = moment()
          this.masterService
            .getClientDataFormats(selectClient.clientId)
            .subscribe((dataFormat: ClientFormats[]) => {
              if (dataFormat) {
                localStorage.setItem('data_formats', JSON.stringify(dataFormat))
                this.roundFormat = dataFormat.find(
                  (item) => item.roundOffType == 'RoundOff'
                )?.roundOff
                this.consumptionRoundOffFormat = dataFormat.find(
                  (item) => item.roundOffType == 'ConsumptionRoundOff'
                )?.roundOff
                this.currencyType = dataFormat.find(
                  (item) => item.roundOffType == 'Currency'
                )?.roundOff
                this.currencySymbol = getCurrencySymbol(
                  this.currencyType,
                  'narrow'
                )
                if (this.roundFormat && this.roundFormat != '') {
                  this.amountdecimalPlaces = parseInt(
                    this.roundFormat.substring(
                      this.roundFormat.indexOf('-') + 1,
                      this.roundFormat.length
                    )
                  )
                }
                if (
                  this.consumptionRoundOffFormat &&
                  this.consumptionRoundOffFormat != ''
                ) {
                  this.consumptiondecimalPlaces = parseInt(
                    this.consumptionRoundOffFormat.substring(
                      this.consumptionRoundOffFormat.indexOf('-') + 1,
                      this.consumptionRoundOffFormat.length
                    )
                  )
                }
              }
            })
          this.invoiceDate =
            '(' +
            this.date.transform(startDate.add('month', -1), 'yyyy-MM-dd') +
            ' - ' +
            this.date.transform(moment(), 'yyyy-MM-dd') +
            ')'
        }
      } else {
        this.dashboardTitle = 'Dashboard'
        this.consumptionTitle = 'Overall Consumption'
        this.hideMoreInfo = false
        if (this.manageParams.strClientId == '') {
          this.manageParams.strClientId = '0'
        }
        this.masterService
          .getDefaultDataFormats()
          .subscribe((dataFormat: ClientFormats[]) => {
            if (dataFormat) {
              localStorage.setItem('data_formats', JSON.stringify(dataFormat))
              this.roundFormat = dataFormat.find(
                (item) => item.roundOffType == 'RoundOff'
              )?.roundOff
              this.consumptionRoundOffFormat = dataFormat.find(
                (item) => item.roundOffType == 'ConsumptionRoundOff'
              )?.roundOff
              this.currencyType = dataFormat.find(
                (item) => item.roundOffType == 'Currency'
              )?.roundOff
              this.currencySymbol = getCurrencySymbol(
                this.currencyType,
                'narrow'
              )
              if (this.roundFormat && this.roundFormat != '') {
                this.amountdecimalPlaces = parseInt(
                  this.roundFormat.substring(
                    this.roundFormat.indexOf('-') + 1,
                    this.roundFormat.length
                  )
                )
              }
              if (
                this.consumptionRoundOffFormat &&
                this.consumptionRoundOffFormat != ''
              ) {
                this.consumptiondecimalPlaces = parseInt(
                  this.consumptionRoundOffFormat.substring(
                    this.consumptionRoundOffFormat.indexOf('-') + 1,
                    this.consumptionRoundOffFormat.length
                  )
                )
              }
            }
          })
        this.invoiceDate =
          '(' +
          this.date.transform(this.manageParams.fromDate, 'yyyy-MM-dd') +
          ' - ' +
          this.date.transform(this.manageParams.toDate, 'yyyy-MM-dd') +
          ')'
      }
    }
  }

  getData() {
    this.meterNodata = true
    this.unitNodata = true
    this.revenueNodata = true
    this.invoiceNodata = true
    this.overallConsumptionNodata = true
    this.manageParams.clientId = this.clientId
    this.manageParams.utilityTypeId = this.utilityType.toString()

    this.dashboardParameters.ClientId = this.manageParams.strClientId
    this.dashboardParameters.FromDate = this.manageParams.fromDate
    this.dashboardParameters.ToDate = this.manageParams.toDate

    let dctBarChart = {}

    let dctMeterBarChartData = {}
    dctMeterBarChartData['chartName'] = []
    dctMeterBarChartData['chartValues'] = []

    this.meterBarChartOptions = this.setMeterPieChart(
      dctMeterBarChartData,
      'Meter Status'
    )
    let gdacontainer3 = document.getElementById('gdacontainer3')
    if (gdacontainer3)
      Highcharts.chart('gdacontainer3', this.meterBarChartOptions)

    this.generalDashBoardService
      .getMeterData(this.dashboardParameters)
      .subscribe(
        (meterData: any) => {
          Object.keys(meterData).map((key) => {
            dctMeterBarChartData['chartValues'].push([
              meterData[key]['dataType'],
              Number(meterData[key]['dataCount']),
            ])
          })

          this.meterBarChartOptions = this.setMeterPieChart(
            dctMeterBarChartData,
            'Meter Status'
          )
          gdacontainer3 = document.getElementById('gdacontainer3')
          if (gdacontainer3)
            Highcharts.chart('gdacontainer3', this.meterBarChartOptions)
        },
        (error) => {
          this.notificationMessage('Error in MeterData', 'red-snackbar')
          return
        }
      )

    // Bar Chart
    // let dctMeterBarChartData = {};
    // dctMeterBarChartData['labels'] = [];
    // dctMeterBarChartData['datas'] = [];

    // this.meterBarChartOptions = this.setMeterBarChart(dctMeterBarChartData);
    // Highcharts.chart('container3', this.meterBarChartOptions);

    // this.generalDashBoardService.getMeterData(this.manageParams).subscribe((meterData: any) => {
    //   Object.keys(meterData).map(key => {

    //     dctMeterBarChartData['labels'].push(meterData[key]['dataType']);
    //     dctMeterBarChartData['datas'].push(Number(meterData[key]['dataCount']));
    //   });

    //   this.meterBarChartOptions = this.setMeterBarChart(dctMeterBarChartData);
    //   Highcharts.chart('container3', this.meterBarChartOptions);

    // },
    //   (error) => {
    //     this.notificationMessage('Error in MeterData', 'red-snackbar');
    //     return;
    //   }
    // );

    let dctUnitBarChartData = {}
    dctUnitBarChartData['chartName'] = []
    dctUnitBarChartData['chartValues'] = []

    this.unitBarChartOptions = this.setUnitPieChart(
      dctUnitBarChartData,
      'Occupancy Status'
    )
    let gdacontainer4 = document.getElementById('gdacontainer4')
    if (gdacontainer4)
      Highcharts.chart('gdacontainer4', this.unitBarChartOptions)

    this.generalDashBoardService
      .getUnitData(this.dashboardParameters)
      .subscribe(
        (UnitData: any) => {
          Object.keys(UnitData).map((key) => {
            dctUnitBarChartData['chartValues'].push([
              UnitData[key]['dataType'],
              Number(UnitData[key]['dataCount']),
            ])
          })

          this.unitBarChartOptions = this.setUnitPieChart(
            dctUnitBarChartData,
            'Occupancy Status'
          )
          gdacontainer4 = document.getElementById('gdacontainer4')
          if (gdacontainer4)
            Highcharts.chart('gdacontainer4', this.unitBarChartOptions)
        },
        (error) => {
          this.unitNodata = true
          this.notificationMessage('Error in UnitData', 'red-snackbar')
          return
        }
      )

    // Bar chart
    // let dctUnitBarChartData = {};
    // dctUnitBarChartData['labels'] = [];
    // dctUnitBarChartData['datas'] = [];

    // this.unitBarChartOptions = this.setUnitBarChart(dctUnitBarChartData);
    // Highcharts.chart('container4', this.unitBarChartOptions);

    // this.generalDashBoardService.getUnitData(this.manageParams).subscribe((UnitData: any) => {

    //   Object.keys(UnitData).map(key => {
    //     dctUnitBarChartData['labels'].push(UnitData[key]['dataType']);
    //     dctUnitBarChartData['datas'].push(Number(UnitData[key]['dataCount']));
    //   });

    //   this.unitBarChartOptions = this.setUnitBarChart(dctUnitBarChartData);
    //   Highcharts.chart('container4', this.unitBarChartOptions);

    // },
    //   (error) => {
    //     this.unitNodata = true;
    //     this.notificationMessage('Error in UnitData', 'red-snackbar');
    //     return;

    //   }
    // );

    // let dctPieTempData = {};
    // dctPieTempData['chartName'] = '';
    // dctPieTempData['chartValues'] = [];

    // this.pieChartOptions = this.setPieChart(dctPieTempData, 'Revenue of Current Month');
    // Highcharts.chart('container2', this.pieChartOptions);

    // this.generalDashBoardService.getRevenueOfCurrentMonth(this.dashboardParameters).subscribe((PieData: any) => {

    //   Object.keys(PieData).map(key => {

    //     dctPieTempData['chartValues'].push([PieData[key]['dataType'], Number(PieData[key]['dataCount'])])

    //   });

    //   this.revenueNodata = false;
    //   this.pieChartOptions = this.setPieChart(dctPieTempData, 'Revenue of Current Month', this.currencyType);
    //   Highcharts.chart('container2', this.pieChartOptions);

    // },
    //   (error) => {
    //     this.notificationMessage('Error in Revenue Of Current Month', 'red-snackbar');
    //     return;

    //   }
    // );

    //Daily Wise Revenue Line Graph
    let dctDailyRevenueData = {}
    dctDailyRevenueData['labels'] = []
    dctDailyRevenueData['datas'] = []

    this.dailyRevenueOptions = this.setDailyRevenueChart(dctDailyRevenueData)
    let gdacontainer2 = document.getElementById('gdacontainer2')
    if (gdacontainer2)
      Highcharts.chart('gdacontainer2', this.dailyRevenueOptions)
    this.dashboardParameters.ReportType = this.revenueTypes[0]
    let revenueTypeBtn = document.getElementById(this.revenueTypes[0])
    document
      .querySelectorAll('.revbuttons button.active')
      .forEach(function (active) {
        active.className = ''
      })
    revenueTypeBtn.className = 'active'
    this.makeRevenueDataChart(dctDailyRevenueData)

    // this.generalDashBoardService.getDailyRevenueData(this.dashboardParameters).subscribe((revenueData: any) => {
    //   console.log('response', revenueData)
    //   let revenueDailyDatas = revenueData['revenueDailyDatas']
    //   this.totalMonthCollectionForTile$ = revenueData['totalPaymentAmount']
    //   this.totalOutStandingForTile$ = revenueData['totalOutStandingAmount']
    //   Object.keys(revenueDailyDatas).map(key => {

    //     dctDailyRevenueData['labels'].push(revenueDailyDatas[key]['dayId']);
    //     dctDailyRevenueData['datas'].push(Number(revenueDailyDatas[key]['paymentAmount']));

    //   });

    //   console.log(dctDailyRevenueData)
    //   this.revenueNodata = false;
    //   this.dailyRevenueOptions = this.setDailyRevenueChart(dctDailyRevenueData);
    //   Highcharts.chart('container2', this.dailyRevenueOptions);

    // },
    //   (error) => {
    //     this.notificationMessage('Error in Revenue Of Current Month', 'red-snackbar');
    //     return;

    //   }
    // );

    // List of key value pair

    // dctBarChart['labels'] = [];
    // dctBarChart['datas'] = [];

    // this.barChartOptions = this.setBarChart(dctBarChart);
    // Highcharts.chart('container1', this.barChartOptions);

    // this.generalDashBoardService.getInvoiceData(this.dashboardParameters).subscribe((data: any) => {

    //   Object.keys(data).map(key => {
    //     dctBarChart['labels'].push(data[key]['dataType']);
    //     dctBarChart['datas'].push(Number(data[key]['dataCount']));
    //   });

    //   this.barChartOptions = this.setBarChart(dctBarChart);
    //   Highcharts.chart('container1', this.barChartOptions);

    // },
    //   (error) => {
    //     this.notificationMessage('Error in Invoice Data', 'red-snackbar');
    //     return;

    //   }
    // )

    //Quarter-Wise Column Chart
    let dctQuarterWiseColumnChart = {}
    dctQuarterWiseColumnChart['labels'] = []
    dctQuarterWiseColumnChart['datas'] = []
    dctQuarterWiseColumnChart['totalInvoice'] = []
    dctQuarterWiseColumnChart['totalReceived'] = []
    dctQuarterWiseColumnChart['totalOutStanding'] = []
    let currentQuarter = this.getCurrentQuarter()
    let btn = document.getElementById(currentQuarter)
    this.dashboardParameters.Quarter = currentQuarter

    // this.quarterWiseColumnChartOptions = this.setQuarterWiseColumnChart(dctQuarterWiseColumnChart);
    // Highcharts.chart('container1', this.quarterWiseColumnChartOptions);

    document
      .querySelectorAll('.buttons button.active')
      .forEach(function (active) {
        active.className = ''
      })
    btn.className = 'active'
    this.makeQuarteWiseChart(dctQuarterWiseColumnChart)

    //this.generalDashBoardService.getAllQuarterRevenueData(this.dashboardParameters).subscribe((data: any) => {
    // this.generalDashBoardService.getQuarterRevenueData(this.dashboardParameters).subscribe((data: any) => {

    //   //this.allQuarterData = data
    //   this.currentQuarterData = data;
    //   //filter via current quarter
    //   // let currentQuarter = this.getCurrentQuarter();
    //   // let btn = document.getElementById(currentQuarter);
    // // document.querySelectorAll('.buttons button.active').forEach(function (active) {
    // //   active.className = '';
    // // });
    // // btn.className = 'active';
    // //this.makeQuarteWiseChart(data, currentQuarter, dctQuarterWiseColumnChart);
    // this.makeQuarteWiseChart(dctQuarterWiseColumnChart);

    // },
    //   (error) => {
    //     this.notificationMessage('Error in Invoice Data', 'red-snackbar');
    //     return;

    //   }
    // )

    // //bar chart for consumption
    // let dctunitConsumptionBarChart = {};

    // dctunitConsumptionBarChart['labels'] = [];
    // dctunitConsumptionBarChart['datas'] = [];
    // this.consumptionUnit = 'Unit Consumption ';

    // this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(dctunitConsumptionBarChart);
    // Highcharts.chart('container6', this.unitConsumptionbarChartOptions);

    // this.generalDashBoardService.getBarChartData(this.manageParams).subscribe((response: any) => {
    //   let unitConsumptionbarChartData = response;
    //   this.consumptionUnit += response[0]['unit'];
    //   Object.keys(unitConsumptionbarChartData).map(key => {
    //     dctunitConsumptionBarChart['labels'].push(unitConsumptionbarChartData[key]['month']);
    //     dctunitConsumptionBarChart['datas'].push(Number(unitConsumptionbarChartData[key]['unitConsumption']));
    //   });

    //   this.overallConsumptionNodata = false;
    //   this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(dctunitConsumptionBarChart);
    //   Highcharts.chart('container6', this.unitConsumptionbarChartOptions);

    // },
    //   (error) => {
    //     this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(dctunitConsumptionBarChart);
    //     Highcharts.chart('container6', this.unitConsumptionbarChartOptions);

    //     return;

    //   }
    // )

    // //end of unit consumption
  }
  makeRevenueDataChart(dctDailyRevenueData: {}) {
    this.dailyRevenueOptions = this.setDailyRevenueChart(dctDailyRevenueData)
    let gdacontainer2 = document.getElementById('gdacontainer2')
    if (gdacontainer2)
      Highcharts.chart('gdacontainer2', this.dailyRevenueOptions)
    this.generalDashBoardService
      .getDailyRevenueData(this.dashboardParameters)
      .subscribe(
        (revenueData: RevenueData) => {
          let revenueDailyDatas = revenueData.revenueDailyDatas

          this.totalMonthCollectionForTile$ =
            revenueData.totalCurrentMonthPaymentAmount.toFixed(
              this.amountdecimalPlaces
            )
          this.totalOutStandingForTile$ =
            revenueData.totalCurrentMonthOutStandingAmount.toFixed(
              this.amountdecimalPlaces
            )
          let difference =
            revenueData.totalCurrentMonthPaymentAmount -
            revenueData.totalPreviousMonthPaymentAmount
          let paymentDifference =
            (difference / revenueData.totalPreviousMonthPaymentAmount) * 100

          //paymentDifference = parseFloat(this.decimalPipe.transform(paymentDifference, this.roundFormat));
          if (isNaN(paymentDifference)) {
            this.gain = 0
            this.isGain = false
            this.toolTip =
              this.gain + '% when compared with Previous Month Collection'
          } else if (paymentDifference == Infinity) {
            this.gain = 100
            this.isGain = true
            this.toolTip =
              this.gain +
              '% increase when compared with Previous Month Collection'
          } else if (paymentDifference >= 0) {
            this.gain = parseFloat(
              this.decimalPipe.transform(paymentDifference, this.roundFormat)
            )
            this.isGain = true
            this.toolTip =
              this.gain +
              '% increase when compared with Previous Month Collection'
          } else {
            this.gain = parseFloat(
              this.decimalPipe.transform(paymentDifference, this.roundFormat)
            )
            this.isGain = false
            this.toolTip =
              this.gain +
              '% decrease when compared with Previous Month Collection'
          }

          // let outstandingDifference = (revenueData['totalCurrentMonthOutStandingAmount'] - revenueData['totalPreviousMonthOutStandingAmount']);

          // if(isNaN(outstandingDifference))
          // {
          //   this.outstandingPercentage =  0;
          //   this.isOutstandingIncreased = false;
          // }
          // else if(outstandingDifference >= 0) {
          //   this.outstandingPercentage = outstandingDifference;
          //   this.isOutstandingIncreased = true;
          // }
          // else {
          //   this.outstandingPercentage = outstandingDifference;
          //   this.isOutstandingIncreased = false;
          // }

          Object.keys(revenueDailyDatas).map((key) => {
            dctDailyRevenueData['labels'].push(revenueDailyDatas[key].dayId)
            dctDailyRevenueData['datas'].push(
              Number(revenueDailyDatas[key].paymentAmount)
            )
          })

          //console.log(dctDailyRevenueData)
          this.revenueNodata = false
          this.dailyRevenueOptions =
            this.setDailyRevenueChart(dctDailyRevenueData)
          let gdacontainer2 = document.getElementById('gdacontainer2')
          if (gdacontainer2)
            Highcharts.chart('gdacontainer2', this.dailyRevenueOptions)
        }
        // ,(error) => {
        //   this.notificationMessage('Error in Revenue Data', 'red-snackbar');
        //   return;
        // }
      )
  }

  private makeQuarteWiseChart(dctQuarterWiseColumnChart: {}) {
    //let currentQuarterData = data.filter(element => element.quarter == currentQuarter);
    //console.table(currentQuarterData);
    this.quarterWiseColumnChartOptions = this.setQuarterWiseColumnChart(
      dctQuarterWiseColumnChart
    )
    let gdacontainer1 = document.getElementById('gdacontainer1')
    if (gdacontainer1)
      Highcharts.chart('gdacontainer1', this.quarterWiseColumnChartOptions)

    this.generalDashBoardService
      .getQuarterRevenueData(this.dashboardParameters)
      .subscribe(
        (data: QuarterData[]) => {
          this.currentQuarterData = data

          Object.keys(this.currentQuarterData).map((key) => {
            dctQuarterWiseColumnChart['labels'].push(
              this.currentQuarterData[key].monthName
            )
            dctQuarterWiseColumnChart['totalInvoice'].push(
              this.currentQuarterData[key].totalInvoice
            )
            dctQuarterWiseColumnChart['totalReceived'].push(
              this.currentQuarterData[key].totalReceived
            )
            dctQuarterWiseColumnChart['totalOutStanding'].push(
              this.currentQuarterData[key].totalOutStanding
            )
          })

          this.quarterWiseColumnChartOptions = this.setQuarterWiseColumnChart(
            dctQuarterWiseColumnChart
          )
          gdacontainer1 = document.getElementById('gdacontainer1')
          if (gdacontainer1)
            Highcharts.chart(
              'gdacontainer1',
              this.quarterWiseColumnChartOptions
            )
        }
        // ,(error) => {
        //   this.notificationMessage('Error in Invoice Data', 'red-snackbar');
        //   return;

        // }
      )
  }

  getCurrentQuarter(): string {
    let today = new Date()
    let month = today.getMonth()
    let quarter = Math.floor(month / 3 + 1) //(today.getMonth() / 3) + 1;
    return 'Q' + quarter
  }

  showRevenueData(event) {
    let target = event.target || event.srcElement || event.currentTarget
    let idAttr = target.attributes.id
    let value = idAttr.nodeValue
    let btn = document.getElementById(value)
    document
      .querySelectorAll('.revbuttons button.active')
      .forEach(function (active) {
        active.className = ''
      })
    btn.className = 'active'
    this.dashboardParameters.ReportType = value

    //Daily Wise Revenue Line Graph
    let dctDailyRevenueData = {}
    dctDailyRevenueData['labels'] = []
    dctDailyRevenueData['datas'] = []
    this.makeRevenueDataChart(dctDailyRevenueData)
  }

  showQuarterData(event) {
    let target = event.target || event.srcElement || event.currentTarget
    let idAttr = target.attributes.id
    let value = idAttr.nodeValue
    let btn = document.getElementById(value)
    document
      .querySelectorAll('.buttons button.active')
      .forEach(function (active) {
        active.className = ''
      })
    btn.className = 'active'
    this.dashboardParameters.Quarter = value

    let dctQuarterWiseColumnChart = {}
    dctQuarterWiseColumnChart['labels'] = []
    dctQuarterWiseColumnChart['datas'] = []
    dctQuarterWiseColumnChart['totalInvoice'] = []
    dctQuarterWiseColumnChart['totalReceived'] = []
    dctQuarterWiseColumnChart['totalOutStanding'] = []

    //this.makeQuarteWiseChart(this.allQuarterData,value,dctQuarterWiseColumnChart)
    this.makeQuarteWiseChart(dctQuarterWiseColumnChart)
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    })
  }

  getUtilities() {
    this.generalDashBoardService.getUtilities(this.clientId).subscribe(
      (response: any) => {
        if (response) {
          this.lstutilityType = []
          this.lstutilityType = response
          if (this.lstutilityType && this.lstutilityType.length > 0)
            this.utilityType = this.lstutilityType[0].id
          if (this.utilityType == undefined) this.utilityType = 0
          this.getData()
          this.getUnitConsumption()
        } else {
          this.getData()
          this.getUnitConsumption()
        }
      },
      (error) => {
        this.getData()
        this.getUnitConsumption()
        //  this.notificationMessage('error','Error on Getting Utility Types')
      }
    )
  }

  onDropdownChange() {
    //this.getData();
    this.getUnitConsumption()
  }

  getUnitConsumption() {
    this.overallConsumptionNodata = true
    this.manageParams.clientId = this.clientId
    this.manageParams.utilityTypeId = this.utilityType.toString()

    this.dashboardParameters.ClientId = this.manageParams.strClientId
    this.dashboardParameters.FromDate = this.manageParams.fromDate
    this.dashboardParameters.ToDate = this.manageParams.toDate
    this.dashboardParameters.UtilityTypeId = parseInt(
      this.manageParams.utilityTypeId
    )

    let dctBarChart = {}

    //bar chart for consumption
    let dctunitConsumptionBarChart = {}

    dctunitConsumptionBarChart['labels'] = []
    dctunitConsumptionBarChart['datas'] = []
    this.consumptionUnit = 'Unit Consumption '
    let unit = ''

    this.consumptionRoundOffFormat = getClientDataFormat(
      'ConsumptionRoundOff',
      this.clientId == 0 ? 0 : this.dashboardParameters.UtilityTypeId
    )
    if (
      this.consumptionRoundOffFormat &&
      this.consumptionRoundOffFormat != ''
    ) {
      this.consumptiondecimalPlaces = parseInt(
        this.consumptionRoundOffFormat.substring(
          this.consumptionRoundOffFormat.indexOf('-') + 1,
          this.consumptionRoundOffFormat.length
        )
      )
    }
    this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(
      dctunitConsumptionBarChart
    )
    let gdacontainer6 = document.getElementById('gdacontainer6')
    if (gdacontainer6)
      Highcharts.chart('gdacontainer6', this.unitConsumptionbarChartOptions)

    this.generalDashBoardService
      .getBarChartData(this.dashboardParameters)
      .subscribe(
        (response: UnitConsumption[]) => {
          let unitConsumptionbarChartData = response
          unit = unitConsumptionbarChartData[0]?.unit
          this.consumptionUnit += unit
          Object.keys(unitConsumptionbarChartData).map((key) => {
            dctunitConsumptionBarChart['labels'].push(
              unitConsumptionbarChartData[key].month
            )
            dctunitConsumptionBarChart['datas'].push(
              Number(unitConsumptionbarChartData[key].unitConsumption)
            )
          })
          this.overallConsumptionNodata = false
          this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(
            dctunitConsumptionBarChart,
            unit
          )
          let gdacontainer6 = document.getElementById('gdacontainer6')
          if (gdacontainer6)
            Highcharts.chart(
              'gdacontainer6',
              this.unitConsumptionbarChartOptions
            )
        },
        (error) => {
          this.unitConsumptionbarChartOptions = this.setUnitConsumptionBarChart(
            dctunitConsumptionBarChart
          )
          let gdacontainer6 = document.getElementById('gdacontainer6')
          if (gdacontainer6)
            Highcharts.chart(
              'gdacontainer6',
              this.unitConsumptionbarChartOptions
            )
          return
        }
      )
    //end of unit consumption
  }

  setChart(dctTempData) {
    Highcharts.chart('gdacontainer1', {
      chart: {
        type: 'pie',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 50,
      },
      plotOptions: {
        series: {
          shadow: true,
        },
      },
      series: [
        {
          type: 'pie',
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
          },
          keys: ['name', 'y', 'selected', 'sliced'],
          data: dctTempData['chartValues'],
          showInLegend: true,
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
            },
          },
        ],
      },
    })
  }

  setMeterBarChart(dctMeterTempData) {
    let meterBarChartOptions = {
      chart: {
        height: 325,
        type: 'column',
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctMeterTempData['labels'],
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: 'Meter Statistics',
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto',
          },
        },
      },
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal',
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false,
      },
      tooltip: {
        formatter: function () {
          return '' + this.x + ': ' + this.y
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 40,
          // color: '#46b5d1'
          color: 'rgb(63, 81, 181)',
        },
      },
      lang: {
        noData: 'No data to display',
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        },
      },
      // colors:this.lstColor1,
      series: [
        {
          name: 'Meter Status',
          data: dctMeterTempData['datas'],
          type: 'column',
        },
      ],
    }

    return meterBarChartOptions
  }

  setUnitBarChart(dctUnitTempData) {
    let unitBarChartOptions = {
      chart: {
        height: 325,
        type: 'column',
      },
      credits: {
        enabled: false,
      },
      title: null,
      subtitle: {
        text: null,
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctUnitTempData['labels'],
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: 'Unit Statistics',
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto',
          },
        },
      },
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal',
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false,
      },
      tooltip: {
        formatter: function () {
          return '' + this.x + ': ' + this.y
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 40,
          // color:'#bc6ff1'
          // color: 'rgb(76, 175, 80)'
          color: '#00bcd4',
        },
      },
      lang: {
        noData: 'No data to display',
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        },
      },
      // colors:this.lstColor1,
      series: [
        {
          name: 'Occupancy Status',
          data: dctUnitTempData['datas'],
          type: 'column',
        },
      ],
    }

    return unitBarChartOptions
  }

  setPieChart(dctPieTempData, title: string, type: string = '') {
    let pieOptions = {
      chart: {
        height: 325,
        type: 'pie',
      },
      title: {
        text: title,
        style: {
          fontFamily: 'Roboto',
        },
      },
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: true,
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#CD534C',
        },
      },
      xAxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      legend: {
        floating: false,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        x: 0,
        y: -15,
        fontFamily: 'Roboto',
        labelFormatter: function () {
          let modifiedName = this.name.split(' ').slice(0, 2).join('')
          return modifiedName.replace(':', '')
        },
      },

      plotOptions: {
        series: {
          shadow: true,
        },
        pie: {
          colors: ['#EFC000', '#0073C2'],
        },
      },

      series: [
        {
          name:
            this.currencyType == undefined
              ? 'Amount'
              : 'Amount in ' + this.currencySymbol,
          type: 'pie',
          allowPointSelect: true,
          dataLabels: {
            enabled: false,
          },
          keys: ['name', 'y', 'selected', 'sliced'],
          data: dctPieTempData['chartValues'],
          showInLegend: true,
        },
      ],
    }

    let modifySeriesData = pieOptions.series[0].data
    modifySeriesData.forEach((element) => {
      element[0] = element[0] + ': ' + (type ? type : '') + ' ' + element[1]
    })
    pieOptions.series[0].data = modifySeriesData

    return pieOptions
  }

  setDailyRevenueChart(dctTempData) {
    let localCurrency = this.currencySymbol
    let localAmountRoundOff = this.amountdecimalPlaces
    let barChartOptions = {
      chart: {
        height: 387,
        type: 'line',
      },
      credits: {
        enabled: false,
      },
      title: {
        text: 'Collection Summary',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
        },
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        categories: this.formatLabel(dctTempData['labels']),
        // gridLineWidth: 2,
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text:
            this.currencyType == undefined
              ? 'Amount'
              : 'Amount in ' + this.currencySymbol,
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto',
          },
        },
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
          return (
            '' +
            this.x +
            ': ' +
            localCurrency +
            this.y.toFixed(localAmountRoundOff)
          )
        },
      },
      colors: ['#3366CC'],
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 8,
          // color: '#46b5d1'
          color: 'rgb(63, 81, 181)',
        },
      },
      lang: {
        noData: 'No data to display',
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        },
      },
      // colors:this.lstColor1,
      series: [
        {
          name:
            this.dashboardParameters.ReportType == 'CurrentYear'
              ? 'Monthly Revenue'
              : 'Day Wise Revenue',
          data: dctTempData['datas'],
          // type: 'column'
        },
      ],
    }

    return barChartOptions
  }

  setMeterPieChart(dctPieTempData, title: string, type: string = '') {
    let pieOptions = {
      chart: {
        height: 325,
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45,
        },
      },
      title: {
        text: title,
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          // textDecoration: 'underline'
        },
      },
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: true,
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          // color: '#808080'
        },
      },
      xAxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      legend: {
        floating: false,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        x: 0,
        y: -15,
        fontFamily: 'Roboto',
        labelFormatter: function () {
          let modifiedName = this.name.split(' ').slice(0, 2).join('')
          return modifiedName.replace(':', '')
        },
      },

      plotOptions: {
        series: {
          shadow: true,
        },
        pointPadding: 0.25,
        pie: {
          innerSize: 100,
          depth: 45,
          colors: [
            '#663399',
            '#DFD8EB',
            // '#04ACB5',
            // '#868686',
          ],
        },
      },

      series: [
        {
          name: 'Count: ',
          type: 'pie',
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
          },
          keys: ['name', 'y', 'selected', 'sliced'],
          data: dctPieTempData['chartValues'],
          showInLegend: true,
        },
      ],
    }

    let modifySeriesData = pieOptions.series[0].data
    modifySeriesData.forEach((element) => {
      element[0] = element[0] + ': ' + (type ? type : '') + ' ' + element[1]
    })
    pieOptions.series[0].data = modifySeriesData

    return pieOptions
  }

  setUnitPieChart(dctPieTempData, title: string, type: string = '') {
    let pieOptions = {
      chart: {
        height: 325,
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45,
        },
      },
      title: {
        text: title,
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
        },
      },
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: true,
      },

      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          // color: '#808080'
        },
      },
      xAxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      legend: {
        floating: false,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        x: 0,
        y: -15,
        fontFamily: 'Roboto',
        labelFormatter: function () {
          let modifiedName = this.name.split(' ').slice(0, 2).join('')
          return modifiedName.replace(':', '')
        },
      },

      plotOptions: {
        series: {
          shadow: true,
        },
        pointPadding: 0.25,
        pie: {
          innerSize: 100,
          depth: 45,
          colors: [
            '#454F8C',
            '#FF9E01',

            // '#016BA5',
            // '#868686'
          ],
        },
      },

      series: [
        {
          name: 'Count: ',
          type: 'pie',
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
          },
          keys: ['name', 'y', 'selected', 'sliced'],
          data: dctPieTempData['chartValues'],
          showInLegend: true,
        },
      ],
    }

    let modifySeriesData = pieOptions.series[0].data
    modifySeriesData.forEach((element) => {
      element[0] = element[0] + ': ' + (type ? type : '') + ' ' + element[1]
    })
    pieOptions.series[0].data = modifySeriesData

    return pieOptions
  }

  setLineChart(dctSplineChart) {
    let tempLabels = dctSplineChart.label

    const splineChart1Options = {
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal',
        },
      },
      chart: {
        type: 'spline',
        height: 340,
        width: 1100,
      },
      title: {
        text: dctSplineChart.chartName,
      },
      subtitle: {
        text: dctSplineChart.subTitle,
      },
      xAxis: {
        categories: this.formatLabel(dctSplineChart.label),
        title: {
          text: dctSplineChart.xTitle,
        },
      },
      yAxis: {
        title: {
          text: dctSplineChart.yTitle,
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: '#0000008f',
        borderWidth: 0,
        style: {
          fontFamily: 'comic sans ms',
          color: 'white',
          opacity: 1,
        },
      },
      plotOptions: {
        spline: {
          marker: {
            fillColor: '#FFFFFF',
            lineWidth: 2,
            lineColor: null,
          },
        },
        series: {
          shadow: true,
          point: {
            events: {},
          },
        },
      },

      credits: {
        enabled: false,
      },
      series: dctSplineChart.data,
      exporting: {
        enabled: true,
      },
    }
    return splineChart1Options
  }

  setBarChart(dctTempData) {
    let barChartOptions = {
      lang: {
        noData: 'No data to display',
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        },
      },
      chart: {
        height: 325,
        type: 'column',
      },
      credits: {
        enabled: false,
      },
      export: {
        enabled: true,
      },
      title: {
        text: 'Invoice and Receipt Details ' + this.invoiceDate,
        style: {
          fontFamily: 'Roboto',
          fontWeight: 10,
        },
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctTempData['labels'],
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: 'Invoice Statistics ' + this.currencySymbol,
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto',
          },
        },
      },
      legend: {
        itemStyle: {
          color: '#000000',
          fontWeight: 'normal',
          fontFamily: 'Roboto',
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false,
      },
      tooltip: {
        formatter: function () {
          return '' + this.x + ': ' + this.y
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 40,
          // color: '#87556f',
          // color: '#a7d129',
          // color:' rgb(3, 169, 244)'
          // color: '#008ECC'
          colorByPoint: true,
        },
      },
      colors: ['#016BA5', '#ABABAB', '#ff800f'],

      // colors:this.lstColor1,
      series: [
        {
          name: 'Invoice Data',
          data: dctTempData['datas'],
          type: 'column',
        },
      ],
    }

    return barChartOptions
  }

  setQuarterWiseColumnChart(dctTempData) {
    let localCurrency = this.currencySymbol
    let localAmountRoundOff = this.amountdecimalPlaces
    let chartOptions = {
      chart: {
        type: 'column',
        height: 387,
      },
      title: {
        text: 'Bills & Payment Summary',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
        },
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: dctTempData['labels'],
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: {
          text:
            this.currencyType == undefined
              ? 'Amount'
              : 'Amount in ' + this.currencySymbol,
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto',
          },
        },
      },
      tooltip: {
        headerFormat:
          '<span style = "font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
          '<td style = "padding:0"><b>' +
          localCurrency +
          '{point.y:.' +
          localAmountRoundOff +
          'f} ' +
          '</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true,
      },
      colors: ['#3366CC', '#10C8CD', '#DC0A59'],
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 29,
        },
        colors: ['#3366CC', '#10C8CD', '#DC0A59'],
      },

      series: [
        {
          type: 'column',
          name: 'Total Invoice',
          data: dctTempData['totalInvoice'],
        },
        {
          type: 'column',
          name: 'Total Received',
          data: dctTempData['totalReceived'],
        },
        {
          type: 'column',
          name: 'Total OutStanding',
          data: dctTempData['totalOutStanding'],
        },
      ],
    }

    return chartOptions
  }

  formatLabel(labels) {
    labels = labels.map((obj) => {
      if (obj.length > 7) {
        obj = obj.slice(0, 5) + '..'
      }
      // obj = this.titlecasePipe.transform(obj);
      return obj
    })
    return labels
  }

  setHighPieChart() {
    let data = [
      ['GDP value wise', 29.9, false],
      ['GDW Value wise', 71.5, false],
      ['Mobile', 106.4, false],
      ['ACC ZRD', 129.2, false],
      ['ACC BGN', 144.0, false],
      ['Peaches', 176.0, false],
      ['Prunes', 135.6, true, true],
      ['Avocados', 148.5, false],
    ]

    let dctTempData = {}

    // List of key value pair

    dctTempData['chartName'] = ''
    dctTempData['chartValues'] = []

    this.pagesService.getData('/invoiceData').subscribe(
      (response: any) => {
        if (response) {
          this.invoiceData = response

          Object.keys(this.invoiceData).map((key) => {
            dctTempData['chartValues'].push([
              this.invoiceData[key]['dataType'],
              Number(this.invoiceData[key]['dataCount']),
              true,
            ])
          })

          this.barChartOptions = {
            chart: {
              type: 'pie',
            },
            exporting: {
              enabled: true,
            },
            legend: {
              align: 'right',
              verticalAlign: 'top',
              layout: 'vertical',
              x: 0,
              y: 50,
            },
            title: {
              text: dctTempData['chartName'],
            },
            credits: {
              enabled: false,
            },

            plotOptions: {
              series: {
                point: {
                  events: {},
                },
              },
              pie: {
                dataLabels: {
                  enabled: false,
                },
              },
            },
            series: [
              {
                name: 'value',
                type: 'pie',
                allowPointSelect: true,
                keys: ['name', 'y', 'selected', 'sliced'],
                // colors:this.lstColor,
                data: [
                  ['GDP value wise', 29.9, false],
                  ['GDW Value wise', 71.5, false],
                  ['Mobile', 106.4, false],
                  ['ACC ZRD', 129.2, false],
                  ['ACC BGN', 144.0, false],
                  ['Peaches', 176.0, false],
                  ['Prunes', 135.6, true, true],
                  ['Avocados', 148.5, false],
                ],
                // data: dctTempData['chartValues'],
                // data:data,
                showInLegend: true,
                point: {
                  events: {
                    // click: (event) => this.pieChart1Clicked(event)
                  },
                },
              },
            ],
          }
        } else {
        }
      },
      (error) => {}
    )
  }

  setUnitConsumptionBarChart(dctTempData, unit: string = '') {
    let consumptiondecimalPlaces = this.consumptiondecimalPlaces
    let barChartOptions = {
      exporting: {
        chartOptions: {
          // specific options for the exported image
          plotOptions: {
            series: {
              dataLabels: {
                enabled: false,
              },
            },
          },
        },
        fallbackToExportServer: false,
      },
      chart: {
        height: 325,
        type: 'column',
      },
      credits: {
        enabled: false,
      },
      export: {
        enabled: true,
        fallbackToExportServer: false,
      },
      title: {
        text: 'Overall Consumption', //'Overall Consumption',
        style: {
          fontFamily: 'Roboto',
          display: 'none',
        },
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctTempData['labels'],
      },
      yAxis: {
        lineWidth: 1,
        min: 0,
        title: {
          text: this.consumptionUnit, //'Unit Consumption',
          style: {
            fontFamily: 'Roboto',
          },
        },
        stackLabels: {
          style: {
            color: 'black',
            fontWeight: 'bold',
          },
          enabled: true,
          verticalAlign: 'center',
        },
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false,
      },
      // tooltip: {
      //   formatter: function () {
      //     return (
      //       '' +
      //       this.x +
      //       ': ' +
      //       this.y.toFixed(consumptiondecimalPlaces) +
      //       ' ' +
      //       unit
      //     )
      //   },
      // },
      // plotOptions: {
      //   series: {
      //     groupPadding: 0,
      //     pointPadding: 0.1,
      //     borderWidth: 0
      //   }
      // },
      plotOptions: {
        column: {
          stacking: 'normal',
          pointPadding: 0.1,
          borderWidth: 0,
          pointWidth: 30,
          // color: '#ec625f'
          // color: '#008ECC'
          // color: ' rgb(3, 169, 244)'
          color: '#663399',
          // dataLabels: {
          //   enabled: 'false',
          // },
        },
      },
      // plotOptions: {
      //   column: {
      //     stacking: 'normal',
      //     pointPadding: 0,
      //     groupPadding: 0,
      //     dataLabels: {
      //       enabled: false,
      //     },
      //   },
      // },
      lang: {
        noData: 'No data to display',
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        },
      },
      // colors:this.lstColor1,
      series: [
        {
          name: 'Unit Consumption',
          data: dctTempData['datas'],
          type: 'column',
        },
      ],
    }

    return barChartOptions
  }

  getCountOfContractsAboutToExpire() {
    this.dashboardParameters.ClientId = this.manageParams.strClientId
    if (this.fromQuickPanel) {
      this.dashboardParameters.FromDate = this.date.transform(
        this.manageParams.fromDate,
        'yyyy-MM-dd'
      )
      this.dashboardParameters.ToDate = this.date.transform(
        this.manageParams.toDate,
        'yyyy-MM-dd'
      )
    } else {
      let today = moment()
      this.dashboardParameters.FromDate = this.date.transform(
        today,
        'yyyy-MM-dd'
      )
      this.dashboardParameters.ToDate = this.date.transform(
        today.add('month', 1),
        'yyyy-MM-dd'
      )
    }
    this.generalDashBoardService
      .getCountOfContractsAboutToExpire(this.dashboardParameters)
      .subscribe({
        next: (data) => {
          this.contractsAboutToExpire = parseInt(data.toString())
        },
        error: (error) => {
          this.contractsAboutToExpire = 0
          //this.notificationMessage('Error in Contracts About To Expire', 'red-snackbar');
        },
      })
  }

  getNumberOfOpenTickets() {
    this.dashboardParameters.ClientId = this.manageParams.strClientId
    if (this.fromQuickPanel) {
      this.dashboardParameters.FromDate = this.manageParams.fromDate
      this.dashboardParameters.ToDate = this.manageParams.toDate
    } else {
      this.dashboardParameters.FromDate = ''
      this.dashboardParameters.ToDate = ''
    }
    this.generalDashBoardService
      .getNumberOfOpenTickets(this.dashboardParameters)
      .subscribe({
        next: (data) => {
          this.numberOfOpenTickets = parseInt(data.toString())
        },
        error: (error) => {
          this.numberOfOpenTickets = 0
          //this.notificationMessage('Error in Open Tickets', 'red-snackbar');
        },
      })
  }

  contractReminder() {
    this.data.setMessage(true)
    this.router.navigate(['/owner-tenant/create-contract'])
  }

  openTickets() {
    this.router.navigate(['/tickets/list'])
  }
}
