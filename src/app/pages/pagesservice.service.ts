import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
// import * as Rx from "rxjs/Rx";
import { from, Observable, throwError } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { TitleCasePipe } from '@angular/common'
import { CookieService } from 'ngx-cookie-service'
import { EnvService } from '../env.service'

@Injectable({
  providedIn: 'root',
})
export class PagesserviceService {
  baseUrl = ''
  clientId = Number(this.cookieService.get('globalClientId'))

  constructor(
    private httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private cookieService: CookieService,
    private envService: EnvService
  ) {
    this.baseUrl = envService.backend
  }

  getDatas(componentUrl) {
    // return this.httpClient.get(this.url+componentUrl+{id:"2"})
    return this.httpClient.get(this.baseUrl + componentUrl)
  }
  // getMetadata() {
  //   // return this.httpClient.get(this.url+componentUrl+{id:"2"})
  //   return this.httpClient.get(this.url + '/metadata');
  // }
  getById(componentUrl, data) {
    return this.httpClient.get(this.baseUrl + componentUrl + data)
  }
  postData(componentUrl, data) {
    return this.httpClient.post(this.baseUrl + componentUrl, data)
  }
  putData(componentUrl, data) {
    return this.httpClient.put(this.baseUrl + componentUrl, data)
  }

  patchData(componentUrl, data) {
    return this.httpClient.patch(this.baseUrl + componentUrl, data)
  }

  getData(localUrl) {
    return this.httpClient.get(this.baseUrl + localUrl).pipe(
      map((data: any[]) => {
        return data
      }),
      catchError((error) => {
        return throwError('Something went wrong!')
      })
    )
  }

  setPieChart(dctTempData) {
    let pieOptions = {
      chart: {
        type: 'pie',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      exporting: {
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
        floating: true,
        align: 'left',
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
          // colors:this.lstColor,
          // data: [
          //   ['GDP value wise', 29.9, false],
          //   ['GDW Value wise', 71.5, false],
          //   ['Mobile', 106.4, false],
          //   ['ACC ZRD', 129.2, false],
          //   ['ACC BGN', 144.0, false],
          //   ['Peaches', 176.0, false],
          //   ['Prunes', 135.6, true, true],
          //   ['Avocados', 148.5, false]
          // ],
          data: dctTempData['chartValues'],
          showInLegend: true,
        },
      ],
    }

    return pieOptions
  }

  setBarChart(dctTempData) {
    let barChartOptions = {
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
        categories: dctTempData['labels'],
      },
      yAxis: {
        // lineWidth: 1,
        min: 0,
        title: {
          text: 'Invoice Statistics',
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
      tooltip: {
        formatter: function () {
          return '' + this.x + ': ' + this.y
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          pointWidth: 15,
        },
      },
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

  setLineChart(dctSplineChart) {
    let tempLabels = dctSplineChart.label

    const splineChart1Options = {
      chart: {
        type: 'spline',
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
        // formatter: function() {
        //   let labelIndex=this.points[0].point.index;
        //   return '<span style="font-size:10px">'
        //   +tempLabels[labelIndex]+
        //   '</span><table><tr><td>'+this.points[0].series.name+': <b>'+this.points[0].y+'</b></td></tr><br/>';

        // },
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
        enabled: false,
      },
    }
    return splineChart1Options
  }

  formatLabel(labels) {
    labels = labels.map((obj) => {
      if (obj.length > 7) {
        obj = obj.slice(0, 5) + '..'
      }
      obj = this.titlecasePipe.transform(obj)
      return obj
    })
    return labels
  }
}
