import { Component, OnInit } from '@angular/core';
import { group } from 'console';
import { ParameterChartService } from '../shared/services/parameter-chart.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { ParameterChart } from '../shared/models/parameter-chart.model';
import { environment } from 'src/environments/environment';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Master } from '../shared/models/master.model';
import HighchartsMore from "highcharts/highcharts-more.src.js";
import HC_exporting from "highcharts/modules/exporting";
import noData from 'highcharts/modules/no-data-to-display';
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';
HC_exporting(Highcharts);
HighchartsMore(Highcharts);
noData(Highcharts);

@Component({
  selector: 'fury-parameter-chart',
  templateUrl: './parameter-chart.component.html',
  styleUrls: ['./parameter-chart.component.scss']
})
export class ParameterChartComponent implements OnInit {
  showSpinner: boolean = false;
  clientId: string;
  chartData: ParameterChart = {};
  fromDate: Date = new Date();
  barChartOptions = {};
  meters: any[] = [];
  filtermeters: any[] = [];
  meterId: number;
  parameters: Master[] = [];
  parameterId: number;
  parameterName: string = '';
  meterTypes: Master[] = [];
  meterTypeId: number;
  meterTypeName: string = '';
  meterGroupList: any = [];
  meterGroup: number = null;
  lstMeterGroup: any = [];
  dateFormat = '';
  constructor(
    private parameterChartService: ParameterChartService,
    private meterReplacementService: MeterReplacementService,
    private date: DatePipe,
    private decimalPipe: DecimalPipe,
    private estidamaChartService: EstidamaChartService,
    private cookieService: CookieService,
    private envService:EnvService
  ) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;
   }

  ngOnInit(): void {

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

    //this.clientId = parseInt(this.cookieService.get('globalClientId'));
    this.getMeterTypes();
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.meters = [];
    this.parameters = [];
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
    this.getParameters();
    // this.meterGroupList.forEach(group => {
    //   if (group.meterTypeID == this.meterTypeId) {
    //     if (!this.lstMeterGroup.some(meterGroup => meterGroup.groupID == group.groupID)) {
    //       this.lstMeterGroup.push({ groupID: group.groupID, groupName: group.groupName })
    //     }
    //   }
    // })

    // if (this.lstMeterGroup.length > 0)
    //   this.meterGroup = this.lstMeterGroup[0].groupID; //Initialise group list
    // this.onMeterGroupChange();
  }

  // onMeterGroupChange() {
  //   this.meters = [];
  //   this.meterGroupList.forEach(group => {
  //     if (group.meterTypeID == this.meterTypeId && group.groupID == this.meterGroup) {
  //       if (!this.meters.some(meterName => meterName.id == group.meterID)) {
  //         this.meters.push({ id: group.meterID, description: group.meterName })
  //       }
  //     }
  //   })
  //   //Initialise meter list
  //   this.getParameters();
  // }

  // getMeters() {
  //   this.parameterChartService.getMeters(this.clientId, this.meterTypeId).subscribe((response: any) => {
  //     if (response) {
  //       this.meters = response;
  //     }
  //   });
  // }

  getMeters() {
    this.meters = [];
    this.filtermeters = [];
    this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, 0, this.clientId).subscribe((response: any) => {
      if (response) {
        this.meters = this.filtermeters = response;
      }
    });
  }

  getParameters() {
    this.parameters = [];
    this.parameterChartService.getParameters(this.meterTypeName).subscribe((response: any) => {
      if (response) {
        this.parameters = response;
      }
    });
  }

  viewParameterChart() {
    this.showSpinner = true;
    let fromDate = '';
    fromDate = moment(this.fromDate).format('YYYY-MM-DD');

    let dctBarChart = {};
    dctBarChart['labels'] = [];
    dctBarChart['datas'] = [];

    // this.barChartOptions = this.setBarChart(dctBarChart);
    this.barChartOptions = this.setLineChart(dctBarChart);
    let pccontainer = document.getElementById('pccontainer');
    if(pccontainer)
      Highcharts.chart('pccontainer', this.barChartOptions);

    if ((this.meterId != undefined) && (this.parameterId != undefined)) {
      this.parameterChartService.viewParameterChart(this.meterId, this.parameterId, this.meterTypeName, fromDate).subscribe({
        next: (response: ParameterChart) => {

          if (response) {
            this.chartData = response['hourlyChart'];
            response['hourlyChart'].forEach(element => {
              dctBarChart['labels'].push(element.name);
              dctBarChart['datas'].push(Number(element.value));
            });
            let sideTitile = '';
            if (response['hourlyConsumption']) {
              const sideTitiles = response['hourlyConsumption'];
              sideTitile = sideTitiles.substr(sideTitiles.indexOf(' ') + 1);

              //const sideTitiles = response['hourlyConsumption'].split(' ');
              //sideTitile = sideTitiles ? sideTitiles[1] + ' ' + sideTitiles[2] : '';
            }
            // this.barChartOptions = this.setBarChart(dctBarChart, sideTitile);
            //console.log(JSON.stringify(dctBarChart))
            this.barChartOptions = this.setLineChart(dctBarChart, sideTitile);
            let pccontainer = document.getElementById('pccontainer');
            if(pccontainer)
              Highcharts.chart('pccontainer', this.barChartOptions);
            this.showSpinner = false;
          }
          else {

          }
        },
        error: (err) => {
          this.showSpinner = false;
        }
      })
    }
  }

  setBarChart(dctTempData, sideTitle: string = '') {
    let barChartOptions = {
      lang: {
        noData: 'No data to display'

      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
        }
      },
      chart: {
        height: 325,
        width: 1000,
        type: 'column',
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Parameter Chart',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 10,
        }
      },
      subtitle: {
        text: null
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctTempData['labels'],
        title: {
          text: 'Hours',
          style: {
            fontSize: '12px',
            fontFamily: "Roboto",
          }
        }
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: sideTitle,
          style: {
            fontSize: '12px',
            fontFamily: "Roboto",
          }
        }
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
          pointWidth: 30,
          // color: '#87556f',
          // color: '#a7d129',
          // color:' rgb(3, 169, 244)'
          color: '#008ECC'
        }
      },

      // colors:this.lstColor1,
      series: [
        {
          name: this.parameterName + (this.fromDate ? ' - ' + this.date.transform(this.fromDate, this.dateFormat.toString()) : ''),
          data: dctTempData['datas'],
          type: 'column'
        },]
    }
    return barChartOptions;
  }

  // onMeterTypeChange(event) {
  //   this.meterTypes.filter((item) => {
  //     if (item.id == event.value) {
  //       this.meterTypeId = item.id;
  //       this.getMeters();
  //       this.getParameters();
  //     }
  //   })
  // }



  setLineChart(dctTempData, sideTitle: string = '') {
    let lineChartOptions = {
      // lang: {
      //   noData: 'No data to display'

      // },
      // noData: {
      //   style: {
      //     fontWeight: 'bold',
      //     fontSize: '15px',
      //   }
      // },
      title: {
        text: 'Parameter Chart',
        style: {
          fontFamily: 'Roboto',
          fontWeight: 10,
        }
      },
      subtitle: {
        text: null
      },
      xAxis: {
        // gridLineWidth: 2,
        categories: dctTempData['labels'],
        title: {
          text: 'Hours',
          style: {
            fontSize: '12px',
            fontFamily: "Roboto",
          }
        }
      },

      yAxis: {
        // lineWidth: 1,
        // min: 0,//<----Remove
        /*max: 100,*/
        title: {
          text: sideTitle,
          style: {
            fontSize: '12px',
            fontFamily: "Roboto",
          }
        }

      },

      legend: {
        layout: 'vertical',
        align: 'center',
        verticalAlign: 'top'
      },
      tooltip: {
        formatter: function () {
          return '' +
            this.x + ': ' + this.y;
        }
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          // pointStart: 2010
        }
      },
      series: [
        {
          name: this.parameterName + (this.fromDate ? ' - ' + this.date.transform(this.fromDate, this.dateFormat.toString()) : ''),
          data: dctTempData['datas'],
        },]
      ,
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      },
      // -----

      chart: {
        height: 325,
        width: 1000,

      },
      credits: {
        enabled: false
      },


      // legend: {
      //   itemStyle: {
      //     color: '#000000',
      //     fontWeight: 'normal',
      //     fontFamily: 'Roboto',
      //   },
      //   layout: 'horizontal',
      //   align: 'center',
      //   verticalAlign: 'top',
      //   x: 0,
      //   y: 0,
      //   floating: false,
      //   shadow: false
      // },

      // plotOptions: {
      //   column: {
      //     pointPadding: 0.2,
      //     borderWidth: 0,
      //     pointWidth: 30,
      //     // color: '#87556f',
      //     // color: '#a7d129',
      //     // color:' rgb(3, 169, 244)'
      //     color: '#008ECC'
      //   }
      // },

      // colors:this.lstColor1,
      // series: [
      //   {
      //     name: this.parameterName + (this.fromDate ? ' - ' + this.date.transform(this.fromDate, this.dateFormat.toString()) : ''),
      //     data: dctTempData['datas'],
      //     type: 'column'
      //   },]
    }
    return lineChartOptions;
  }

  onMeterChange(event) {
    this.meters.filter((item) => {
      if (item.id == event.value) {
        this.meterId = item.id;
      }
    })
  }

  onParameterChange(event) {
    this.parameters.filter((item) => {
      if (item.id == event.value) {
        this.parameterId = item.id;
        this.parameterName = item.description;
      }
    })
  }

  search(query: string) {
    let result = this.select(query)
    this.meters = result;
  }

  select(query: string): Master[] {
    let result: Master[] = [];
    if (query) {
      for (let a of this.filtermeters) {
        if (a.deviceName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.filtermeters;
    }
    return result
  }
}
