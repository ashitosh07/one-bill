import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UtilityDashboard } from '../shared/models/utility-dashboard.model';
import { UtilityTypeMeterCount } from '../shared/models/utility-type-meter-count.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class EmsDashboardService {

  baseUrl ='';

  constructor(private http: HttpClient,
    private envService: EnvService) {
      this.  baseUrl = envService.backend
     }

  getUtilities(clientId) {
    return this.http.get(this.baseUrl + '/v1/energy-dashboard/' + clientId + '/utilities');
  }

  getOverallEnergyCost(clientId,utilityTypes,reportType,isCurrent)
  {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('utilityType', `${utilityTypes}`);
    params = params.append('reportType', `${reportType}`);
    params = params.append('isCurrent', `${isCurrent}`);
    return this.http.get<any>(this.baseUrl + '/v1/energy-dashboard/overallEnergyCost', { params });
  }

  getConsumptionData(clientId: string = '0',utilityTypes: string = '',reportType: string='')
  {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('utilityType', `${utilityTypes}`);
    params = params.append('reportType', `${reportType}`);
    return this.http.get<any>(this.baseUrl + '/v1/energy-dashboard/consumptionChart', { params });
  }

  getOverallGroupWiseEnergyCost(clientId: string = '0',meterGroupId: string = '',reportType: string='',isCurrent)
  {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('meterGroupId', `${meterGroupId}`);
    params = params.append('reportType', `${reportType}`);
    params = params.append('isCurrent', `${isCurrent}`);
    return this.http.get<any>(this.baseUrl + '/v1/energy-dashboard/overallGroupwiseEnergyCost', { params });
  }

  // GetEnergyCost(clientId: number = 0,utilityType: string = '',reportType: string='')
  // {
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('clientId', `${clientId}`);
  //   params = params.append('utilityType', `${utilityType}`);
  //   params = params.append('reportType', `${reportType}`);
  //   return this.http.get<any>(this.url + '/v1/energy-dashboard/energyCost', { params });
  // }

  getGroupWiseEnergyCost(clientId: string = '0',utilityType: string = '',reportType: string = '')
  {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('utilityType', `${utilityType}`);
    params = params.append('reportType', `${reportType}`);
    return this.http.get<any[]>(this.baseUrl + '/v1/energy-dashboard/groupWiseEnergyCost', { params });
  }

  // getGroupWiseEnergyCost(clientId: number = 0,reportType: string = '')
  // {
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('clientId', `${clientId}`);
  //   params = params.append('reportType', `${reportType}`);
  //   return this.http.get<any[]>(this.url + '/utilityDashboard/utilitytype/CostData', { params });
  // }

  // getEnergyCostComparison(clientId: number = 0,reportType: string = '')
  // {
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('clientId', `${clientId}`);
  //   params = params.append('reportType', `${reportType}`);
  //   return this.http.get<any[]>(this.url + '/utilityDashboard/utilitytype/CostComparisonData', { params });
  // }

  getUtilityData() {
    let params: HttpParams = new HttpParams();
    return this.http.post(this.baseUrl + '/dashboard/meterData', { params });
  }

  // getUtilityTypeData(clientId: number, reportType: string, meterType: string) {
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('clientId', `${clientId}`);
  //   params = params.append('reportType', `${reportType}`);
  //   params = params.append('meterType', `${meterType}`);
  //   return this.http.get<UtilityDashboard[]>(this.url + '/utilityDashboard/utilitytype/data', { params });
  // }

  // getUtilityTypeMeterCount(clientId: number,meterType: string) {
  //   let params: HttpParams = new HttpParams();
  //   params = params.append('clientId', `${clientId}`);
  //   params = params.append('meterType', `${meterType}`);
  //   return this.http.get<UtilityTypeMeterCount[]>(this.url + '/utilityDashboard/utilitytype/meter/count', { params });
  // }


}
