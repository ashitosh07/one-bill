import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { EstidamaChart } from '../shared/models/estidama-chart.model';

@Injectable({
  providedIn: 'root'
})
export class EstidamadashboardService {
  baseUrl = '';

  constructor(private http: HttpClient,
    private envService: EnvService) {
      this.  baseUrl = envService.backend
     }

  getChartData(estidamaChart: EstidamaChart) {
    // let params: HttpParams = new HttpParams();
    // params = params.append('MeterID', `${estidamaChart.MeterId}`);
    // params = params.append('selectedDate', `${estidamaChart.FromDate}`);
    // params = params.append('MeterType', `${estidamaChart.MeterTypeName}`);
    return this.http.post(this.baseUrl + '/dashboardchart/ViewDashboardChart', estidamaChart);
  }

  getMeterTypes() {
    return this.http.get(this.baseUrl + '/dashboardchart/MeterTypeData');
  }

}
