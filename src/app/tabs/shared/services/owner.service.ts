import { HttpClient, HttpEvent, HttpHeaders, HttpRequest, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { EnvService } from 'src/app/env.service';

import { environment } from '../../../../environments/environment';
import { Tenant } from '../models/tenant.model';

@Injectable({
    providedIn: 'root'
})
export class OwnerService {
    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService  ) {
            this.baseUrl = envService.backend;
         }

    getOwners() {
        return this.http.get(this.baseUrl + '/owners');
    }

    getclientOwners(clientId) {

        return this.http.get(this.baseUrl + '/owners/GetAllClientOwners/' + clientId);
    }

    getNewlyRegisteredUsers(clientId) {

        return this.http.get(this.baseUrl + '/owners/newlyRegisteredOwners/' + clientId);
    }


    getUnits(clientId) {
        return this.http.get(this.baseUrl + '/owners/' + clientId + '/GetUnits');
    }

    createOwner(owner) {
        
        return this.http.post(this.baseUrl + '/owners', owner);
    }

    updateOwnerById(id, owner) {

        return this.http.put(this.baseUrl + '/owners/' + id, owner);
    }

    deleteOwnerById(id) {
        return this.http.delete(this.baseUrl + '/owners/' + id);

    }

    uploadLogo(file) //: Observable<HttpEvent<void>> 
    {
        const formData = new FormData();
        formData.append('file', file);
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: formData
        }

        return this.http.post(this.baseUrl + '/upload', options);
        // return this.http.request(new HttpRequest(
        //     'POST',
        //     this.baseUrl + '/upload',
        //     formData,
        //     {
        //         reportProgress: true
        //     }
        // ));         
    }

    getMovedOutTenants(clientId) {
        return this.http.get(this.baseUrl + '/owners/movedOutTenants/clientId/' + clientId);
    }

    registerOwner(owner) {
        return this.http.post(this.baseUrl + '/owners/register', owner);
    }

    getUserDeatils(userId: string) {
        let params: HttpParams = new HttpParams();
        if (userId) {
            params = params.append('userId', userId);
        }
        return this.http.get<Tenant>(this.baseUrl + '/owners/user/details', { params });
    }

    checkTRNDuplication(queryType,tRNNumber,id)
    {
        let params: HttpParams = new HttpParams();
        params = params.append('queryType', queryType);
        params = params.append('tRNNumber', tRNNumber);
        params = params.append('id', id);
        return this.http.get(this.baseUrl + '/owners/TRNNumber', {params});
    }
}