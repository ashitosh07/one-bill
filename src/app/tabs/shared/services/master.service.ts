import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';
import { Master } from '../models/master.model';

@Injectable({
    providedIn: 'root'
})
export class MasterService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService) {
            this.baseUrl = envService.backend;
         }

    // getUtilityTypes() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/utilitytypes');
    // }

    // getParameters() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/parameters');
    // }

    // getWeekTypes() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/weektypes');
    // }

    // getMonths() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/months');
    // }

    // getDays() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/days');
    // }

    // getPeakTypes() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/peaktypes');
    // }

    // getSeasons() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/seasons');
    // }

    // getSlabs() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/slabs');
    // }

    getDataFormats() {
        return this.http.get<Master[]>(this.baseUrl + '/metadata/formats');
    }

    getDefaultDataFormats() {
        return this.http.get<Master[]>(this.baseUrl + '/masterdetails/defaultDataFormats');
    }

    getClientDataFormats(clientId: number=0) {        
        return this.http.get<Master[]>(this.baseUrl + '/masterdetails/clientFormats/clientId/'+ clientId);
    }

    // getNotificationModes() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/notifcation/modes');
    // }

    // getActions() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/actions');
    // }

    // getBillTypes() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/billtypes');
    // }

    // getFloors() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/floors');
    // }

    // getMasterdata(modeId: number, parentId: number) {
    //     let params: HttpParams = new HttpParams();
    //     params = params.append('modeId', `${modeId}`);
    //     params = params.append('parentId', `${parentId}`)

    //     return this.http.get<Master[]>(this.baseUrl + '/masterdetails/master', { params });
    // }

    // getDeviceGroups() {
    //     return this.http.get<Master[]>(this.baseUrl + '/metadata/device/groups');
    // }

    getSystemMasterdata(modeId: number, parentId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('modeId', `${modeId}`);
        params = params.append('parentId', `${parentId}`)
        return this.http.get<Master[]>(this.baseUrl + '/masterdetails/system/master', { params });
    }

    getUserMasterdata(modeId: number, parentId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('modeId', `${modeId}`);
        params = params.append('parentId', `${parentId}`)
        return this.http.get<Master[]>(this.baseUrl + '/masterdetails/user/master', { params });
    }

    getParameterValue(description: string='') {
        let params: HttpParams = new HttpParams();
        params = params.append('description', description);
        return this.http.get(this.baseUrl + '/parameters/ParameterValue', {params});
    }

    getUserMasterParentData(modeId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('modeId', `${modeId}`);
        return this.http.get<Master[]>(this.baseUrl + '/masterdetails/user/master/parent/data', { params });
    }
}