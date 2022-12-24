import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AverageMonthlyUsage } from '../../../../app/tabs/shared/models/average-monthly-usage.model'
import { environment } from '../../../../environments/environment'
import { AccountStatus } from '../../../../app/tabs/shared/models/account-status.model'
import { OwnerTenantDashboardData } from '../../../../app/tabs/shared/models/owner-tenant-dashboard-data.model'
import { EnvService } from 'src/app/env.service'

@Injectable({
  providedIn: 'root',
})
export class TenantOwnerDashboardService {
  baseUrl = ''
  constructor(private httpClient: HttpClient, private envService: EnvService) {
    this.baseUrl = envService.backend
  }

  getBillandConsumption(ownerId, unitNoId, utilityTypeId) {
    let params: HttpParams = new HttpParams()

    params = params.append('ownerId', `${ownerId}`)
    params = params.append('unitId', `${unitNoId}`)
    params = params.append('utilityTypeId', `${utilityTypeId}`)

    return this.httpClient.get<AverageMonthlyUsage>(
      this.baseUrl + '/ownerTenantDashboard/AverageMonthlyUsage',
      { params }
    )
  }

  getPaymentDetails(ownerId, unitNoId, utilityTypeId) {
    let params: HttpParams = new HttpParams()

    params = params.append('ownerId', `${ownerId}`)
    params = params.append('unitId', `${unitNoId}`)
    params = params.append('utilityTypeId', `${utilityTypeId}`)

    return this.httpClient.get<AccountStatus>(
      this.baseUrl + '/ownerTenantDashboard/AccountStatus',
      { params }
    )
  }

  getOwnerTenantName(ownerId) {
    let params: HttpParams = new HttpParams()
    params = params.append('ownerId', `${ownerId}`)
    return this.httpClient.get<string>(
      this.baseUrl + '/ownerTenantDashboard/ownerTenantName',
      { params }
    )
  }

  getOwnerTenantDashboardData(
    ownerId,
    unitNoId,
    utilityTypeId,
    clientId,
    type,
    deviceId
  ) {
    let params: HttpParams = new HttpParams()

    params = params.append('ownerId', `${ownerId}`)
    params = params.append('unitId', `${unitNoId}`)
    params = params.append('utilityTypeId', `${utilityTypeId}`)
    params = params.append('type', `${type}`)
    params = params.append('clientId', `${clientId}`)
    params = params.append('deviceId', `${deviceId}`)
    return this.httpClient.get<OwnerTenantDashboardData>(
      this.baseUrl + '/ownerTenantDashboard/dashboard/data',
      { params }
    )
  }

  getOwnerTenantConsumptionData(
    ownerId,
    unitNoId,
    utilityTypeId,
    clientId,
    type,
    reportType,
    deviceId
  ) {
    let params: HttpParams = new HttpParams()

    params = params.append('ownerId', `${ownerId}`)
    params = params.append('unitId', `${unitNoId}`)
    params = params.append('utilityTypeId', `${utilityTypeId}`)
    params = params.append('type', `${type}`)
    params = params.append('clientId', `${clientId}`)
    params = params.append('deviceId', `${deviceId}`)
    if (reportType == 'PreviousMonth')
      return this.httpClient.get<OwnerTenantDashboardData>(
        this.baseUrl +
          '/ownerTenantDashboard/dashboard/PreviousMonthdaywisedata',
        { params }
      )
    else
      return this.httpClient.get<OwnerTenantDashboardData>(
        this.baseUrl + '/ownerTenantDashboard/dashboard/daywisedata',
        { params }
      )
  }

  getNews(ownerId) {
    return this.httpClient.get(this.baseUrl + '/announcements/' + ownerId)
  }

  getUnits(ownerId) {
    return this.httpClient.get(
      this.baseUrl + '/ownerTenantDashboard/' + ownerId + '/GetUnits'
    )
  }

  getUtilities(ownerId) {
    return this.httpClient.get(
      this.baseUrl + '/owners/' + ownerId + '/GetUtilities'
    )
  }

  getUtilitiesForUnit(tenantId, unitId) {
    let params: HttpParams = new HttpParams()
    params = params.append('tenantId', `${tenantId}`)
    params = params.append('unitId', `${unitId}`)
    return this.httpClient.get(
      this.baseUrl + '/ownerTenantDashboard/GetUtilities',
      { params }
    )
  }

  getTenantUtilityDetails(tenantId, unitId) {
    return this.httpClient.get(
      this.baseUrl +
        '/ownerTenantDashboard/utilityTenant/' +
        tenantId +
        '/' +
        unitId
    )
  }

  getUtilityUnit(utilityTypeId) {
    let params: HttpParams = new HttpParams()
    params = params.append('utilityTypeId', `${utilityTypeId}`)
    return this.httpClient.get(
      this.baseUrl + '/ownerTenantDashboard/utilityUnit',
      { params }
    )
  }

  setBarChart(
    dctTempData,
    title = 'Consumption in [KWH]',
    type = 'Consumption',
    unit = '',
    roundOff = 0
  ) {
    let localChartType = type
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
          text: title,
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
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: false,
        shadow: false,
      },
      tooltip: {
        formatter: function () {
          if (localChartType == 'Cost') {
            return '' + this.x + ': ' + unit + this.y.toFixed(roundOff)
          } else {
            return '' + this.x + ': ' + this.y.toFixed(roundOff) + unit
          }
        },
      },
      // plotOptions: {
      //   series: {
      //     groupPadding: 0,
      //     pointPadding: 0.1,
      //     borderWidth: 0
      //   }
      // },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          pointWidth: 15,
        },
      },

      // colors:this.lstColor1,
      series: [
        {
          name: type,
          data: dctTempData['datas'],
          type: 'column',
        },
      ],
    }

    return barChartOptions
  }
}
