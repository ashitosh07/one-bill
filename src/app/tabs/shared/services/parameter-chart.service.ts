import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { ParameterChart } from '../models/parameter-chart.model';

@Injectable({
  providedIn: 'root'
})
export class ParameterChartService {

  baseUrl = '';

  constructor(private http: HttpClient,
    private envService:EnvService) { 
      this.baseUrl = envService.backend;
    }

  getMeterTypes() 
  {
    return this.http.get(this.baseUrl + '/benchmarksettings/GetMeterTypeData');
  }

  getMeters(clientId, meterTypeId) 
  {
    let params: HttpParams = new HttpParams();

    params = params.append('clientId', `${clientId}`);
    params = params.append('meterTypeId', `${meterTypeId}`);

    return this.http.get(this.baseUrl + '/benchmarksettings/meterList', { params });
  }

  getParameters(meterTypeName) 
  {
    let params: HttpParams = new HttpParams();

    params = params.append('meterTypeName', `${meterTypeName}`);

    return this.http.get(this.baseUrl + '/benchmarksettings/parameters', { params });
  }

  viewParameterChart(meterId, parameterId, meterTypeName, fromDate) 
  {
    let params: HttpParams = new HttpParams();

    params = params.append('meterId', `${meterId}`);
    params = params.append('parameterId', `${parameterId}`);
    params = params.append('meterTypeName', `${meterTypeName}`);
    params = params.append('searchDate', `${fromDate}`);

    return this.http.get<ParameterChart>(this.baseUrl + '/dashboardchart/ViewParameterChart', { params });
  }

}
