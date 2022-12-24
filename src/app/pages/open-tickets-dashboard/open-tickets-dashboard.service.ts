import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OwnerTenantDashboardData } from 'src/app/tabs/shared/models/owner-tenant-dashboard-data.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class OpenTicketsDashboardService {

  baseUrl = '';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
      this.baseUrl = envService.backend;
     }



  getBillandConsumption(ownerId,unitNoId,utilityTypeId) {

    let params: HttpParams = new HttpParams();

        params = params.append('ownerId', `${ownerId}`);
        params = params.append('unitId', `${unitNoId}`);
        params = params.append('utilityTypeId', `${utilityTypeId}`);

    return this.httpClient.get(this.baseUrl + '/ownerTenantDashboard/AverageMonthlyUsage', { params });
}

getPaymentDetails(ownerId,unitNoId,utilityTypeId) {

  let params: HttpParams = new HttpParams();

      params = params.append('ownerId', `${ownerId}`);
      params = params.append('unitId', `${unitNoId}`);
      params = params.append('utilityTypeId', `${utilityTypeId}`);

  return this.httpClient.get(this.baseUrl + '/ownerTenantDashboard/AccountStatus', { params });
}

getBarChartData(ownerId,unitNoId,utilityTypeId) {

  let params: HttpParams = new HttpParams();

      params = params.append('ownerId', `${ownerId}`);
      params = params.append('unitId', `${unitNoId}`);
      params = params.append('utilityTypeId', `${utilityTypeId}`);

  return this.httpClient.get(this.baseUrl + '/ownerTenantDashboard/BarChartData', { params });
}

getOwnerTenantDashboardData(ownerId,unitNoId,utilityTypeId,clientId,type,deviceId) {

  let params: HttpParams = new HttpParams();

      params = params.append('ownerId', `${ownerId}`);
      params = params.append('unitId', `${unitNoId}`);
      params = params.append('utilityTypeId', `${utilityTypeId}`);
      params = params.append('clientId', `${clientId}`);
      params = params.append('type', `${type}`);
      params = params.append('deviceId', `${deviceId}`);
  return this.httpClient.get<OwnerTenantDashboardData>(this.baseUrl + '/ownerTenantDashboard/dashboard/data', { params });
}



// getMetadata() {
// return this.httpClient.get(this.url + '/metadata');
// }
 
getUnits(ownerId) {
  return this.httpClient.get(this.baseUrl + '/ownerTenantDashboard/' + ownerId + '/GetUnits');
}

// getUtilities(ownerId) {
//   return this.httpClient.get(this.url + '/owners/' + ownerId + '/GetUtilities');
// }

setBarChart(dctTempData,yAxisTitle,type,unit,roundOffFormat=0){
  let localChartType = type;
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
  // gridLineWidth: 2,
  categories:dctTempData['labels']
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
    if(localChartType == 'Cost')
    {
      return '' + this.x + ': ' + unit + this.y.toFixed(roundOffFormat);
    }
    else {
      return '' + this.x + ': ' + this.y.toFixed(roundOffFormat) + unit; 
    }    
  }
},
lang:{
  noData:'No data to display'
},

  noData: {
    style: {
        fontWeight: 'bold',
        fontSize: '15px',
    }
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
    pointWidth: 15
  }
},
// colors:this.lstColor1,
series: [
  
  {
  name: type,
  data: dctTempData['datas'],
  type: 'column'

}, ]
}

return barChartOptions;

}

}
