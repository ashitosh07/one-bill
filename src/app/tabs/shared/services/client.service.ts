import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserClients } from '../models/user-clients.model';
import { Client } from 'src/app/pages/client/client-create-update/client.model';
import { RolePermission } from '../models/role-permission.model';
import { ImageProperty } from '../models/imageProperty.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class ClientService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getClients() {
        return this.http.get<Client[]>(this.baseUrl + '/clients');
    }

    getRoles() {
        return this.http.get<RolePermission[]>(this.baseUrl + '/clients/roles');
    }

    saveUserClients(userClients: UserClients[]) {
        return this.http.post<boolean>(this.baseUrl + '/clients/userclients', userClients);
    }

    getClientImageProperties(clientId: number) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get<ImageProperty[]>(this.baseUrl + '/clients/image/properties', { params });
    }

    getUtilityTypes(clientId) {
        let params: HttpParams = new HttpParams();
        params = params.append('clientId', `${clientId}`);
        return this.http.get(this.baseUrl + '/clients/utilityType', { params });
    }
}
