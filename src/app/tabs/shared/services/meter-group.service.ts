import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
//import { ParameterChart } from '../models/parameter-chart.model';

@Injectable({
  providedIn: 'root'
})
export class MeterGroupService {

  baseUrl = '';

  constructor(private http: HttpClient,
    private envService:EnvService) { 
      this.baseUrl = envService.backend;
    }

  
//   getMeters(clientId, meterTypeId) 
//   {
//     let params: HttpParams = new HttpParams();

//     params = params.append('clientId', `${clientId}`);
//     params = params.append('meterTypeId', `${meterTypeId}`);

//     return this.http.get(this.url + '/benchmarksettings/meterList', { params });
//   }
}
