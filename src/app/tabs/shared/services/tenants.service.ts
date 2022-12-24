import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { Tenant } from '../models/tenant.model';

@Injectable({
    providedIn: 'root'
})
export class TenantsService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService) { 
            this.baseUrl = envService.backend;
        }

    getTenantsDetails() {
        return this.http.get<Tenant[]>(`${this.baseUrl}/api/billsettlement/tenants`);
    }

    getCommunicationSummary(clientId, tenantId)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        params = params.append('tenantId', `${tenantId}`);
        return this.http.get(`${this.baseUrl}/owners/communicationSummary`, {params});
    }
}