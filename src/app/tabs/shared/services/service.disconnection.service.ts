import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ServiceDisconnectionService 
{
    
    baseUrl = '';


    constructor(private http: HttpClient,
        private envService:EnvService){
            this.baseUrl = envService.backend;
        }

    getConnectionHistory(clientId) {
        return this.http.get(this.baseUrl + '/servicedisconnection/clientId/' + clientId);
    }
    
    createServiceDisconnection(serviceDisconnection) {
        return this.http.post(this.baseUrl + '/servicedisconnection/', serviceDisconnection);
    }
    
    getAllUnits(utilityTypeId)
    {
        return this.http.get(this.baseUrl + '/servicedisconnection/getallunits/' + utilityTypeId);
    }

    getMeter(utilityTypeId, unitId)
    {
        return this.http.get(this.baseUrl + '/servicedisconnection/getmeter/' + utilityTypeId + '/' + unitId);
    }
    
    getConnectionStatus(utilityTypeId, unitId, meterId)
    {
        return this.http.get(this.baseUrl + '/servicedisconnection/getconnectionstatus/' + utilityTypeId + '/' + unitId + '/' + meterId);
    }

    getUtilities(clientId) {
        return this.http.get(this.baseUrl + '/clients/' + clientId + '/utilities');
    }
}
