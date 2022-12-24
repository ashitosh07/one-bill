import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { MeterReading } from '../shared/models/meter-reading.model';

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  baseUrl = '';
  constructor(private http: HttpClient,
    private envService: EnvService) {
      this.baseUrl = envService.backend;
     }

  getPages(){
   return this.http.get(this.baseUrl + '/dashboardchart/PageData');
  }

  getVolts(){
   return this.http.get(this.baseUrl + '/dashboardchart/MeterGroupData');
  }

  getMeterListByClientId(clientId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.http.get(this.baseUrl + '/dashboardchart/MeterDataByClientID',{params})
  }

  getMeterData(meterReading:MeterReading){  
    //Made POST request due to the limitation in Query string length supported by Browser
   //return this.http.get(this.url + '/dashboardchart/ViewLCDChart',{params}); 
   return this.http.post(this.baseUrl + '/dashboardchart/ViewLCDChart',meterReading);
  }

  getTreeViewList(){
   return this.http.get(this.baseUrl + '/dashboardchart/MeterGroupData');
  }
}
