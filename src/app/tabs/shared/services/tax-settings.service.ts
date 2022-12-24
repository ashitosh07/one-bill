import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TaxSettingsService 
{
    
    baseUrl ='';


    constructor(private http: HttpClient,
        private envService:EnvService){
            this.baseUrl = envService.backend;
        }

    getTaxSettings() {
        return this.http.get(this.baseUrl + '/taxSettings/tax-settings');
    }

    // getBillPeriodsById(id) {
    //     return this.http.get(this.baseUrl + '/billperiods/' + id);
    // }
    
    createTaxSetting(taxSetting) {
        return this.http.post(this.baseUrl + '/taxSettings/', taxSetting);
    }
    
    updateTaxSettingById(id, taxSetting) {
        return this.http.put(this.baseUrl + '/taxSettings/' + id, taxSetting);
    }
    
    deleteTaxSettingById(id) {
        return this.http.delete(this.baseUrl + '/taxSettings/' + id);
    }

    getNonGroupTaxSettings() {
        return this.http.get<any>(this.baseUrl + '/taxSettings/nonGroupTaxSettings');
    }    

    getComputationType() {
        return this.http.get<any>(this.baseUrl + '/taxSettings/computationType');
    }
    
    getAllTaxSettings() {
        return this.http.get<any>(this.baseUrl + '/taxSettings/taxSettingsList');
    } 
}