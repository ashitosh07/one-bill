import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MasterDetailsService 
{
    
    baseUrl = '';


    constructor(private http: HttpClient,
        private envService:EnvService){
            this.baseUrl = envService.backend;
        }

    getMasterDetails() {
        return this.http.get(this.baseUrl + '/masterdetails');
    }

    getMasterDetailsById(id) {
        return this.http.get(this.baseUrl + '/masterdetails/' + id);
    }

    getModes() {
        return this.http.get(this.baseUrl + '/masterdetails/getModes');
    }

    getParentModes(mode) {
        return this.http.get(this.baseUrl + '/masterdetails/getparentmodes/' + mode);
    }
    
    createMasterDetails(masterdetails) {
        return this.http.post(this.baseUrl + '/masterdetails/', masterdetails);
    }
    
    updateMasterDetails(id, masterdetails) {
        return this.http.put(this.baseUrl + '/masterdetails/' + id, masterdetails);
    }



    
}