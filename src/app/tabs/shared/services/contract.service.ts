import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContractService {

    baseUrl = '';


    constructor(private http: HttpClient,
        private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getContracts(clientId) {
        return this.http.get(this.baseUrl + '/contracts/clientId/' + clientId);
    }

    getContractById(id) {
        return this.http.get(this.baseUrl + '/contracts/' + id);
    }

    createContract(contract) {
        return this.http.post(this.baseUrl + '/contracts/', contract);
    }

    updateContractById(id, contract) {
        return this.http.put(this.baseUrl + '/contracts/' + id, contract);
    }

    activateContractById(id) {
        return this.http.put(this.baseUrl + '/contracts/activate/' + id, null);
    }

    renewContract(id, contract) {
        return this.http.patch(this.baseUrl + '/contracts/' + id, contract);
    }

    deleteContractById(id, contract) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: contract
        }
        return this.http.delete(this.baseUrl + '/contracts/' + id, options);
    }

    suspendContractById(id, contract) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: contract
        }
        return this.http.delete(this.baseUrl + '/contracts/' + id + '/suspend', options);
    }

    getSecurityDeposit(id) {
        return this.http.get(this.baseUrl + '/contracts/SecurityDeposit/' + id);
    }

    getTenants(clientId) {
        return this.http.get(this.baseUrl + '/contracts/tenants/clientId/' + clientId);
    }

    getMovedOutTenants(clientId) {
        return this.http.get(this.baseUrl + '/contracts/ExpiredContracts/clientId/' + clientId);
    }

    getUtilities(clientId) {
        return this.http.get(this.baseUrl + '/clients/' + clientId + '/utilities');
    }

    getUnits(clientId) {
        return this.http.get(this.baseUrl + '/clients/' + clientId + '/units');
    }

    getContractsAboutToExpire(clientId) {
        return this.http.get(this.baseUrl + '/contracts/AboutToExpire/clientId/' + clientId);
    }

    getUtilityDetails(clientId, unitId) {
        return this.http.get(this.baseUrl + '/contracts/utility/' + clientId + '/' + unitId);
    }
}