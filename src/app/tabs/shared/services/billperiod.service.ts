import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BillPeriodService {

    baseUrl = '';


    constructor(private http: HttpClient,
        private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getBillPeriods(clientId) {
        return this.http.get(this.baseUrl + '/billperiods/clientId/' + clientId);
    }

    getBillPeriodsById(id) {
        return this.http.get(this.baseUrl + '/billperiods/' + id);
    }

    createBillPeriod(billPeriod) {
        return this.http.post(this.baseUrl + '/billperiods/', billPeriod);
    }

    updateBillPeriodById(id, billPeriod) {
        return this.http.put(this.baseUrl + '/billperiods/' + id, billPeriod);
    }

    deleteBillPeriodById(id, billPeriod) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: billPeriod
        }
        return this.http.delete(this.baseUrl + '/billperiods/' + id, options);
    }

    getBillSettings(clientId) {
        return this.http.get<any>(this.baseUrl + '/billperiods/billSettings/' + clientId);
    }

}