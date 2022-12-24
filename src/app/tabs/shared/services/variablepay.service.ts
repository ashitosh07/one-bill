import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { VariablePay } from '../../bill/create-variablepay/variablepay-create-update/variablepay.model';
import { MetadataAccountHead } from '../models/metadata.account-head.model';

@Injectable({
    providedIn: 'root'
})
export class VariablePayService {

    baseUrl ='';


    constructor(private http: HttpClient,
        private envService:EnvService) { 
            this.baseUrl = envService.backend;
        }

    getVariablePays(clientId) {
        return this.http.get(this.baseUrl + '/variablepays/clientId/' + clientId);
    }

    getVariablePayId(id) {
        return this.http.get(this.baseUrl + '/variablepays/' + id);
    }

    createVariablePay(variablePay) {
        return this.http.post(this.baseUrl + '/variablepays/', variablePay);
    }

    updateVariablePayById(id, variablePay) {
        return this.http.put(this.baseUrl + '/variablepays/' + id, variablePay);
    }

    deleteVariablePayById(id, variablePay) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: variablePay
        }
        return this.http.delete(this.baseUrl + '/variablepays/' + id, options);
    }

    //Get the Units against selected Tenant by passing Tenant Id
    getUnitsOfTenant(id) {
        return this.http.get(this.baseUrl + '/variablepays/' + 'GetTenantUnits/' + id);
    }

    //Get the Units With TenantName against given client Id
    GetUnitsWithTenantName(clientId)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/variablepays/TenantUnits', { params })
    }
    
    //Get the Variable Bill Line Variable Amount for the given Account Head Id.
    getVariableAmount(accountHeadId)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('accountHeadId', `${accountHeadId}`);
        return this.http.get(this.baseUrl + '/variablepays/VariableAmount', { params })
    }

    //Get the Tenants against selected Client Id
    getTenants(clientId) {
        return this.http.get(this.baseUrl + '/variablepays/tenants/clientId/' + clientId);
    }

    //Get the Bill Periods against the selected Client Id
    getBillPeriods(clientId) {
        return this.http.get(this.baseUrl + '/variablepays/billPeriods/clientId/' + clientId);
    }

    //Get the Account Heads against the selected Client Id
    getAccountHeads(clientId) {
        return this.http.get<MetadataAccountHead[]>(this.baseUrl + '/variablepays/accountHeads/clientId/' + clientId);
    }

    getConsumptionValue(ownerId: number, billPeriodId: number, accountHeadId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('ownerId', `${ownerId}`);
        params = params.append('billPeriodId', `${billPeriodId}`);
        params = params.append('accountHeadId', `${accountHeadId}`);
        return this.http.get<number>(this.baseUrl + '/variablepays/billtype/consumption', { params });
    }

    createOtherTypeConsumptionVariablePay(variablePays: VariablePay[], type: string) {
        return this.http.post<any>(this.baseUrl + '/variablepays/' + type + '/consumption', variablePays);
    }

}