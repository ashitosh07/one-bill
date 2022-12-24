import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class BenchmarkSettingService 
{
    
    baseUrl ='';


    constructor(private http: HttpClient,
        private envService:EnvService){
        this.baseUrl = envService.backend;
    }

    getBenchmarkSettings(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/benchmarksettings/EstidamaTargetList', {params});
    }

    getv1BenchmarkSettings(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/benchmarksettings/v1/EstidamaTargetList', {params});
    }
    
    createBenchmarkSetting(benchmarkSetting) {
        return this.http.post(this.baseUrl + '/benchmarksettings', benchmarkSetting);
    }
    
    deleteBenchmarkSettingById(id) {
        return this.http.delete(this.baseUrl + '/benchmarksettings/' + id);
    }

    getMeterTypes()
    {
        return this.http.get(this.baseUrl + '/benchmarksettings/GetMeterTypeData');
    }
    
    getMeterList(clientId, meterTypeId)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        params = params.append('meterTypeId', `${meterTypeId}`);
        return this.http.get(this.baseUrl + '/benchmarksettings/meterList',{params});
    }

    getParametersList(meterTypeId) 
    {
        let params: HttpParams = new HttpParams();
        params = params.append('meterId', `${meterTypeId}`);

        return this.http.get(this.baseUrl + '/benchmarksettings/parameters', { params });
    }

}