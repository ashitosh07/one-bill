import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { Master } from '../models/master.model';
import { MeterReading } from '../models/meter-reading.model';

@Injectable({
    providedIn: 'root'
})
export class MeterReplacementService {

    baseUrl = '';


    constructor(private http: HttpClient,
        private envService:EnvService) {
            this.baseUrl = envService.backend;
         }

    getReplacedMeters(clientId) {
        return this.http.get(this.baseUrl + '/devicelistreplacements/clientId/' + clientId);
    }

    createMeterReplacement(deviceList) {
        return this.http.post(this.baseUrl + '/devicelistreplacements/', deviceList);
    }

    GetUtilityTypes(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/UtilityTypes', { params });
    }

    getAllUnits(clientId, utilityTypeId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        params = params.append('utilityTypeId', `${utilityTypeId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/Units', { params });
    }

    GetActiveDevices(clientId, utilityTypeId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        params = params.append('utilityTypeId', `${utilityTypeId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/ActiveDevices', { params });
    }

    getMeterErrorDetails(meterReading) {
        // let params: HttpParams = new HttpParams();
        // params = params.append('fromDate', `${fromDate}`);
        // params = params.append('toDate', `${toDate}`);
        // params = params.append('clientId', `${clientId}`);
        // params = params.append('unitId', `${unitId}`);
        return this.http.post(this.baseUrl + '/devicelistreplacements/MeterError', meterReading);
    }

    GetParametersList() {
        return this.http.get(this.baseUrl + '/devicelistreplacements/Parameters');
    }

    getDeviceDataDetails(meterReading: MeterReading) {
        // let params: HttpParams = new HttpParams();
        // params = params.append('parameterIds', `${parameterIds}`);
        // params = params.append('meterIds', `${meterIds}`);
        // params = params.append('fromDate', `${fromDate}`);
        // params = params.append('toDate', `${toDate}`);                
        //return this.http.get(this.baseUrl + '/devicelistreplacements/DeviceData', { params });
        //GET method changed to POST because of the Query string length limitation in browsers
        return this.http.post(this.baseUrl + '/devicelistreplacements/DeviceData', meterReading);
    }

    GetMeterList(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/MeterList', { params });
    }

    getDeviceGroupMeterList(meterTypeId: number, groupId: number, clientId: string='0') {
        let params: HttpParams = new HttpParams();
        params = params.append('meterTypeId', `${meterTypeId}`);
        params = params.append('groupId', `${groupId}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/type/group/meterList', { params });
    }

    getV1DeviceGroupMeterList(meterTypeId: number, groupId: number, clientId: string='0') {
        let params: HttpParams = new HttpParams();
        params = params.append('meterTypeId', `${meterTypeId}`);
        params = params.append('groupId', `${groupId}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/v1/type/group/meterListFilterByClient', { params });
    }

    getV1DeviceGroupMeterListWithoutFlowTypeFilter(meterTypeId: number, groupId: number, clientId: string='0') {
        let params: HttpParams = new HttpParams();
        params = params.append('meterTypeId', `${meterTypeId}`);
        params = params.append('groupId', `${groupId}`);
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl +'/devicelistreplacements/V1/type/group/meterListFilterByClientWithoutFlowTypeFilter', { params });
        //return this.http.get(this.baseUrl + '/devicelistreplacements/v1/type/group/meterListFilterByClient', { params });
    }

    getV1MeterList(clientId: number=0) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/devicelistreplacements/v1/meterListFilterByClient', { params });
    }

    getClients() {
        return this.http.get<Master[]>(this.baseUrl + '/devicelistreplacements/v1/clients');
    }

    getV1MeterGroupList(meterTypeId: number=0)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('meterTypeId', `${meterTypeId}`);
        return this.http.get<Master[]>(this.baseUrl + '/devicelistreplacements/v1/meterGroups', {params});
    }
}