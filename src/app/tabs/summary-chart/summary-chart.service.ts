import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SummaryChartService {

  baseUrl = '';
  constructor(private http: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }

  getTypes() {
    return this.http.get(this.baseUrl + '/dashboardchart/Summary/GateWayTypeData');
  }

  getPageContent(gatewayType) {
    let params: HttpParams = new HttpParams();

    params = params.append('GateWayType', `${gatewayType}`);
    return this.http.get(this.baseUrl + '/dashboardchart/ViewSummary', { params });
  }
}
