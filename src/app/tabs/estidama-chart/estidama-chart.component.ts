import { Component, OnInit, ViewChild } from '@angular/core';
import { group } from 'console';
import { EstidamaChartService } from './estidama-chart.service';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { DashboardChartEstidama } from '../shared/models/dashboard-chart-estidama.model';
import { environment } from 'src/environments/environment';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EstidamaChart } from '../shared/models/estidama-chart.model';
import { MatOption } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Master } from '../shared/models/master.model';
import { MasterService } from '../shared/services/master.service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';
import { CookieService } from 'ngx-cookie-service';
import { getClientDataFormat } from '../shared/utilities/utility';
import { EnvService } from 'src/app/env.service';
const noData = require('highcharts/modules/no-data-to-display')

noData(Highcharts)
@Component({
  selector: 'fury-estidama-chart',
  templateUrl: './estidama-chart.component.html',
  styleUrls: ['./estidama-chart.component.scss']
})
export class EstidamaChartComponent implements OnInit {

  blnToDate: boolean = false;
  blnToYear: boolean = false;
  blnFromMonth: boolean = false;
  blnToMonth: boolean = false;
  blnFromDate: boolean = false;

  peak: string = '';
  consumption: string = '';
  average: string = '';
  showSpinner: boolean = false;

  Highcharts1 = Highcharts;
  chartConstructor1 = 'chart';
  barChartOptions = {};

  blnCompare: boolean = false;

  meterType: string = '';
  meterTypeId: number = 0;
  lstMeterType: any = [];

  meterGroup: number = null;
  lstMeterGroup: any[] = [];

  meterId: string = '';
  lstMeterName: any = [];
  lstFilterMeterName: any = [];

  reportType: string = null;
  lstReportType: any = [];

  fromYear: string = null;
  lstFromYear: any = [];

  toYear: string = null;
  lstToYear: any = [];

  fromMonth: string = null;
  fromMonthName: string = '';
  lstFromMonth: any = [];

  toMonth: string = null;
  toMonthName: string = '';
  lstToMonth: any = [];

  fromDate: Date = new Date();
  toDate: Date = new Date();

  selectedMeters: any[] = [];
  estidamaChart: EstidamaChart = {};

  clientId: string = '';
  meterGroupList: any = [];
  dateFormat = '';
  roundOffFormat = '';
  chartData: DashboardChartEstidama = {};
  form: FormGroup;

  @ViewChild('allMetersSelected') private allMetersSelected: MatOption;

  constructor(
    private estidamaChartService: EstidamaChartService,
    private date: DatePipe, private fb: FormBuilder,
    private masterService: MasterService,
    private decimalPipe: DecimalPipe,
    private meterReplacementService: MeterReplacementService,
    private cookieService: CookieService,
    private envService: EnvService) {
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
    this.roundOffFormat = getClientDataFormat('RoundOff') ?? envService.roundOffFormat;
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      meters: ['']
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
    //this.clientId = this.cookieService.get('globalClientId');
    this.getMeterTypes();
    this.getDeviceGroups();
  }
  getMeterTypes() {
    this.lstMeterType = [];
    this.meterGroupList = [];
    this.lstMeterGroup = [];
    this.lstMeterName = [];

    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {

      if (response) {
        this.lstMeterType = response['meterTypeList'];
        this.meterType = this.lstMeterType[0].meterTypeName;
        this.meterTypeId = this.lstMeterType[0].meterTypeID;

        this.meterGroupList = response['meterGroupList'];

        this.lstReportType = response['reportTypeList'];// Assign report type list
        if (this.lstReportType.length > 0)
          this.reportType = this.lstReportType[0].value; // Initialise report type list

        this.lstFromYear = response['fromYearList'];// Assign from year list
        if (this.lstFromYear.length > 0)
          this.fromYear = this.lstFromYear[0].value; // Initialise from year list

        this.lstToYear = response['toYearList'];// Assign to year list
        if (this.lstToYear.length > 0)
          this.toYear = this.lstToYear[0].value; // Initialise to year list

        this.lstFromMonth = response['fromWeekList'];// Assign from Month list
        if (this.lstFromMonth.length > 0)
          this.fromMonth = this.lstFromMonth[0].name; // Initialise from year list

        this.lstToMonth = response['toWeekList'];// Assign to Month list
        if (this.lstToMonth.length > 0)
          this.toMonth = this.lstToMonth[0].name; // Initialise to Week list

        this.getMeters();
      }
    })
  }

  getDeviceGroups() {
    this.lstMeterGroup = [];
    this.masterService.getUserMasterdata(71, 0).subscribe(meterGroups => {
      this.lstMeterGroup = meterGroups;
      this.lstMeterGroup.splice(0, 0, { id: 0, description: 'All' });
      this.meterGroup = 0;
      this.getMeters();
    });
  }

  onMeterTypeChange(value) {
    this.meterType = value;
    this.meterTypeId = this.lstMeterType.find(x => x.meterTypeName === value)?.meterTypeID;
    this.getMeters();
  }

  onMeterGroupChange(value) {
    this.meterGroup = value;
    this.meterGroup = 0;
    this.getMeters();
  }

  getMeters() {
    this.lstMeterName = [];
    this.meterId = '';
    this.selectedMeters = [];
    this.meterReplacementService.getV1DeviceGroupMeterList(this.meterTypeId ?? 0, this.meterGroup ?? 0, this.clientId).subscribe((response: any) => {
      if (response) {
        this.lstMeterName = this.lstFilterMeterName = response;
      }
    });
  }

  onReportTypeChange(value) {
    if (this.reportType == 'Yearly') {
      this.blnCompare = false;
    }
  }

  viewEstidamaChart() {
    this.showSpinner = true;
    let fromDate = '';
    let toDate = '';

    if ((this.reportType == 'Hourly') || (this.reportType == 'Daily')) {
      fromDate = this.fromDate == null ? '' : moment(this.fromDate).format('YYYY-MM-DD');
      toDate = this.toDate == null ? '' : moment(this.toDate).format('YYYY-MM-DD');
    }
    this.lstFromMonth.find((item) => {
      if (item.name == this.fromMonth)
        this.fromMonthName = item.value;
    })
    this.lstToMonth.find((item) => {
      if (item.name == this.toMonth)
        this.toMonthName = item.value;
    })

    let dctBarChart = {};
    dctBarChart['labels'] = [];
    dctBarChart['datas'] = [];
    dctBarChart['comparisonDatas'] = [];

    this.barChartOptions = this.setBarChart(dctBarChart);
    let echacontainer = document.getElementById('echacontainer');
    if (echacontainer)
      Highcharts.chart('echacontainer', this.barChartOptions);

    let index = this.selectedMeters.findIndex((meter) => meter == 0)
    if (index >= 0) {
      this.selectedMeters.splice(index, 1);
    }
    this.meterId = this.selectedMeters.join(",");

    if ((this.meterId != '') && (this.meterType != '') && (this.reportType != null) && (this.fromYear != null)) {
      this.estidamaChart.MeterId = this.meterId;
      this.estidamaChart.GroupId = this.meterGroup.toString();
      this.estidamaChart.MeterTypeName = this.meterType;
      this.estidamaChart.ClientId = this.clientId;
      this.estidamaChart.ReportType = this.reportType;
      this.estidamaChart.FromYear = this.fromYear;
      this.estidamaChart.ToYear = this.toYear;
      this.estidamaChart.FromDate = fromDate;
      this.estidamaChart.ToDate = toDate;
      this.estidamaChart.FromMonth = this.fromMonth;
      this.estidamaChart.ToMonth = this.toMonth;
      this.estidamaChart.BlnCompare = this.blnCompare;

      //this.meterType, this.clientId, this.meterName, this.reportType, this.fromYear, this.toYear, fromDate, toDate, this.fromMonth, this.toMonth, this.blnCompare
      this.estidamaChartService.viewEstidamaChart(this.estidamaChart).subscribe({
        next: (response: DashboardChartEstidama) => {

          if (response) {
            // List of key value pair
            // Object.keys(response).map(key => {
            //   dctBarChart['labels'].push(response[key]['dataType']);
            //   dctBarChart['datas'].push(Number(response[key]['dataCount']));
            // });

            this.peak = response.peak;
            this.average = response.average;
            this.consumption = response.consumption;

            let title = 'Estidama Dashboard ' + this.reportType;
            if (response) {
              this.chartData = response;
              let minimumDate = response.graphItemList[0].fromDate, maximumDate = response.graphItemList[0].toDate;
              if (response.graphItemList && response.graphItemList.length) {
                response.graphItemList.forEach(element => {
                  dctBarChart['labels'].push(element.name);
                  dctBarChart['datas'].push(Number(element.value));
                  let v = element.fromDate;
                  let z = element.toDate;
                  minimumDate = (v < minimumDate) ? v : minimumDate;
                  maximumDate = (z > maximumDate) ? z : maximumDate;
                });
              }
              if (response.graphItemComparisonList && response.graphItemComparisonList.length) {
                response.graphItemComparisonList.forEach(element => {
                  dctBarChart['comparisonDatas'].push(Number(element.value));
                });
              }
              title = title + ' ' + this.date.transform(minimumDate, this.dateFormat.toString()) + '-' + this.date.transform(maximumDate, this.dateFormat.toString());
            }
            const benchMark = this.chartData.graphItemList[0].benchMark;
            const type = this.blnCompare ? 'line' : 'column';
            this.barChartOptions = this.setBarChart(dctBarChart, type, title, benchMark);
            let echacontainer = document.getElementById('echacontainer');
            if (echacontainer)
              Highcharts.chart('echacontainer', this.barChartOptions);
            this.showSpinner = false;
          }
          else {
            this.showSpinner = false;
          }
        },
        error: (err) => {
          this.showSpinner = false;
        }
      })
    }
  }


  setBarChart(dctTempData, type: string = 'column', title = 'Estidama Dashboard', benchMark = 0) {

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
        type: type,
      },
      credits: {
        enabled: false
      },
      title: {
        text: title,
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
        categories: dctTempData['labels']
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: 'Consumption in KWH',
          style: {
            fontSize: '12px',
            fontFamily: "Roboto",
          }
        },
        plotLines: [{
          value: benchMark,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: 'Bench Mark'
          }
        }]
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
          pointWidth: 10,
          // color: '#87556f',
          // color: '#a7d129',
          // color:' rgb(3, 169, 244)'
          // color: '#008ECC'
        }
      },

      // colors:this.lstColor1,
      series: [

        {
          name: this.reportType === 'Hourly' ? this.date.transform(this.fromDate, this.dateFormat.toString()) :
            (this.reportType === 'Daily' ? this.fromMonthName : (this.reportType === 'Weekly' ? this.fromYear : (this.reportType === 'Monthly' ? this.fromYear : 'Consumption Chart'))),
          data: dctTempData['datas'],
          type: type,
          color: '#008ECC'
        },
        {
          name: dctTempData['comparisonDatas'] && dctTempData['comparisonDatas'].length ? this.reportType === 'Hourly' ? this.date.transform(this.toDate, this.dateFormat.toString()) :
            (this.reportType === 'Daily' ? this.toMonthName : (this.reportType === 'Weekly' ? this.toYear : (this.reportType === 'Monthly' ? this.toYear : 'Consumption Chart'))) : '',
          data: dctTempData['comparisonDatas'],
          type: type,
          color: dctTempData['comparisonDatas'] && dctTempData['comparisonDatas'].length ? '#87556f' : '#FFFFFF'
        },]
    }

    return barChartOptions;

  }

  generarPDF() {

    const div = document.getElementById('echacontainer');
    const options = {
      background: 'white',
      scale: 3
    };

    html2canvas(div, options).then((canvas) => {

      var img = new Image()
      img.src = canvas.toDataURL("image/PNG");
      var doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter"
      });

      // Add image Canvas to PDF
      const bufferX = 5;
      const bufferY = 5;
      const imgProps = (<any>doc).getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');

      let firstTableCols = [];
      let firstTableRows: any[] = [];
      let row: any[] = [];
      let total = 0;
      let comparisonTotal = 0;
      if (this.reportType === 'Hourly') {
        if (this.blnCompare) {
          firstTableCols = [
            'Date',
            'Compare Date',
            'Hours',
            'Value',
            'Compare Value',
            'BenchMark'];
        } else {
          firstTableCols = [
            'Date',
            'Hours',
            'Value',
            'BenchMark'];
        }

        if (this.chartData && this.chartData.graphItemList && this.chartData.graphItemList.length) {
          for (let a = 0; a < this.chartData.graphItemList.length; a++) {
            row.push(this.date.transform(this.fromDate, this.dateFormat.toString()))
            if (this.blnCompare) {
              row.push(this.date.transform(this.toDate, this.dateFormat.toString()))
            }
            row.push(this.chartData.graphItemList[a].name)
            row.push(this.chartData.graphItemList[a].value)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  row.push(item.value)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].benchMark)
            firstTableRows.push(row);
            row = [];
          }
          this.chartData.graphItemList.forEach(element => {
            total = total + Number(element.value);
          });
          this.chartData.graphItemComparisonList.forEach(element => {
            comparisonTotal = comparisonTotal + Number(element.value);
          });
        }
      }
      else if (this.reportType === 'Daily') {
        if (this.blnCompare) {
          firstTableCols = [
            'Date',
            'Compare Month',
            'Month',
            'Value',
            'Compare Value',
            'BenchMark'];
        } else {
          firstTableCols = [
            'Date',
            'Month',
            'Value',
            'BenchMark'];
        }
        if (this.chartData && this.chartData.graphItemList && this.chartData.graphItemList.length) {
          for (let a = 0; a < this.chartData.graphItemList.length; a++) {
            row.push(this.date.transform(this.chartData.graphItemList[a].fromDate, this.dateFormat.toString()))
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  row.push(this.date.transform(item.fromDate, this.dateFormat.toString()))
                }
              }
            }
            row.push(this.chartData.graphItemList[a].name)
            row.push(this.chartData.graphItemList[a].value)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  row.push(item.value)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].benchMark)
            firstTableRows.push(row);
            row = [];
          }
          this.chartData.graphItemList.forEach(element => {
            total = total + Number(element.value);
          });
          this.chartData.graphItemComparisonList.forEach(element => {
            comparisonTotal = comparisonTotal + Number(element.value);
          });
        }
      }
      else if (this.reportType === 'Weekly') {
        if (this.blnCompare) {
          firstTableCols = [
            'Date',
            'Compare Date',
            'Weeks',
            'Value',
            'Compare Value',
            'BenchMark'];
        } else {
          firstTableCols = [
            'Date',
            'Weeks',
            'Value',
            'BenchMark'];
        }
        if (this.chartData && this.chartData.graphItemList && this.chartData.graphItemList.length) {
          for (let a = 0; a < this.chartData.graphItemList.length; a++) {
            const startDate = this.date.transform(this.chartData.graphItemList[a].fromDate, this.dateFormat.toString());
            const toDate = this.date.transform(this.chartData.graphItemList[a].toDate, this.dateFormat.toString());
            row.push(startDate + ' - ' + toDate)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  const startDate = this.date.transform(item.fromDate, this.dateFormat.toString());
                  const toDate = this.date.transform(item.toDate, this.dateFormat.toString());
                  row.push(startDate + ' - ' + toDate)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].name)
            row.push(this.chartData.graphItemList[a].value)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  row.push(item.value)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].benchMark)
            firstTableRows.push(row);
            row = [];
          }
          this.chartData.graphItemList.forEach(element => {
            total = total + Number(element.value);
          });
          this.chartData.graphItemComparisonList.forEach(element => {
            comparisonTotal = comparisonTotal + Number(element.value);
          });
        }
      }
      else if (this.reportType === 'Monthly') {
        if (this.blnCompare) {
          firstTableCols = [
            'Date',
            'Compare Date',
            'Months',
            'Value',
            'Compare Value',
            'BenchMark'];
        } else {
          firstTableCols = [
            'Date',
            'Months',
            'Value',
            'BenchMark'];
        }
        if (this.chartData && this.chartData.graphItemList && this.chartData.graphItemList.length) {
          for (let a = 0; a < this.chartData.graphItemList.length; a++) {
            const startDate = this.date.transform(this.chartData.graphItemList[a].fromDate, this.dateFormat.toString());
            const toDate = this.date.transform(this.chartData.graphItemList[a].toDate, this.dateFormat.toString());
            row.push(startDate + ' - ' + toDate)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  const startDate = this.date.transform(item.fromDate, this.dateFormat.toString());
                  const toDate = this.date.transform(item.toDate, this.dateFormat.toString());
                  row.push(startDate + ' - ' + toDate)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].name)
            row.push(this.chartData.graphItemList[a].value)
            if (this.blnCompare) {
              if (this.chartData.graphItemComparisonList && this.chartData.graphItemComparisonList.length) {
                const item = this.chartData.graphItemComparisonList.find(x => x.name === this.chartData.graphItemList[a].name);
                if (item) {
                  row.push(item.value)
                }
              }
            }
            row.push(this.chartData.graphItemList[a].benchMark)
            firstTableRows.push(row);
            row = [];
          }
          this.chartData.graphItemList.forEach(element => {
            total = total + Number(element.value);
          });
          this.chartData.graphItemComparisonList.forEach(element => {
            comparisonTotal = comparisonTotal + Number(element.value);
          });
        }
      }
      else {
        firstTableCols = [
          'Year',
          'Value',
          'BenchMark'];
        if (this.chartData && this.chartData.graphItemList && this.chartData.graphItemList.length) {
          for (let a = 0; a < this.chartData.graphItemList.length; a++) {
            row.push(this.chartData.graphItemList[a].name)
            row.push(this.chartData.graphItemList[a].value)
            row.push(this.chartData.graphItemList[a].benchMark)
            firstTableRows.push(row);
            row = [];
          }
          this.chartData.graphItemList.forEach(element => {
            total = total + Number(element.value);
          });
        }
      }

      if (this.reportType !== 'Yearly') {
        row.push('');
      }
      if (this.blnCompare) {
        row.push('');
      }
      row.push('Total')
      row.push(this.decimalPipe.transform(total, this.roundOffFormat.toString()).replace(',', ''))
      if (this.blnCompare) {
        row.push(this.decimalPipe.transform(comparisonTotal, this.roundOffFormat.toString()).replace(',', ''))
      }
      row.push('')
      firstTableRows.push(row);

      var pageContent = function (data) {
        // HEADER

        // FOOTER
        var str = "Page " + data.pageCount;
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
          doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10, 'S');
        }
        doc.setFontSize(9);
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10); // showing current page number
      };

      const autoTable = 'autoTable';
      doc[autoTable](firstTableCols, firstTableRows, {
        startX: 50,
        startY: pdfHeight + 20,
        didDrawPage: pageContent,
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 9,
          cellPadding: 6,
          overflowColumns: 'linebreak',
          lineColor: [0, 0, 0]
        },
        margin: { left: 50 },
        theme: 'grid',
        tableWidth: 'auto',
        cellWidth: 'wrap',
        columnStyles: {
          0: {
            cellWidth: this.blnCompare ? 110 : 150,
            halign: 'center'
          },
          1: {
            cellWidth: this.blnCompare ? 110 : 120,
            halign: 'center'
          },
          2: {
            cellWidth: this.blnCompare ? 65 : 120,
            halign: 'center'
          },
          3: {
            cellWidth: this.blnCompare ? 65 : 120,
            halign: 'center'
          },
          4: {
            cellWidth: 80,
            halign: 'center'
          },
          5: {
            cellWidth: 80,
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
      return doc;
    }).then((doc) => {
      doc.save('Estidama Chart.pdf');
    });
  }

  search(query: string) {
    let result = this.select(query)
    this.lstMeterName = result;
  }

  select(query: string): any[] {
    let result: any[] = [];
    if (query) {
      for (let a of this.lstFilterMeterName) {
        if (a.deviceName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.lstFilterMeterName;
    }
    return result
  }

  toggleMetersAllSelection() {
    if (this.allMetersSelected.selected) {
      this.form.controls.meters
        .patchValue([...this.lstMeterName.map(item => item.id), 0]);
    } else {
      this.form.controls.meters.patchValue([]);
    }
  }

  toggleMeterPerOne(all) {
    if (this.allMetersSelected.selected) {
      this.allMetersSelected.deselect();
      return false;
    }
    if (this.form.controls.meters.value.length == this.lstMeterName.length)
      this.allMetersSelected.select();
  }

}
