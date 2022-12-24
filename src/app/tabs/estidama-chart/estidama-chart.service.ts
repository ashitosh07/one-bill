import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { DashboardChartEstidama } from "../shared/models/dashboard-chart-estidama.model";
import { EstidamaChart } from '../shared/models/estidama-chart.model';

@Injectable({
  providedIn: 'root'
})
export class EstidamaChartService {

  baseUrl  = '';

  constructor(private http: HttpClient,
    private envService: EnvService) {
      this.  baseUrl = envService.backend
     }

  getMeterTypes() {
    return this.http.get(this.baseUrl  + '/dashboardchart/Estidama/ParameterData');
  }

  //meterType, meterGroup, meterName, reportType, fromYear, toYear, fromDate, toDate, fromWeek, toWeek, blnCompare
  viewEstidamaChart(estidamaChart: EstidamaChart) {

    // let params: HttpParams = new HttpParams();
    // params = params.append('MeterType', `${estidamaChart.meterTypeName}`);
    // params = params.append('MeterGroup', `${estidamaChart.groupId ?? 0}`);
    // params = params.append('MeterID', `${estidamaChart.meterId}`);
    // params = params.append('Type', `${estidamaChart.reportType}`);
    // params = params.append('StartYear', `${estidamaChart.fromYear}`);
    // params = params.append('ToYear', `${estidamaChart.toYear}`);
    // params = params.append('SearchFromDate', `${estidamaChart.fromDate}`);
    // params = params.append('SearchToDate', `${estidamaChart.toDate}`);
    // params = params.append('StartWeek', `${estidamaChart.fromWeek}`);
    // params = params.append('EndWeek', `${estidamaChart.toWeek}`);
    // params = params.append('IsCompare', `${estidamaChart.blnCompare}`);

    return this.http.post(this.baseUrl  + '/dashboardchart/ViewEstidamaChart', estidamaChart);
  }
}
