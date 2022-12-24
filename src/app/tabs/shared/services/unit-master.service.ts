import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UnitMasterService 
{
    
    baseUrl = '';


    constructor(private http: HttpClient,
        private envService:EnvService){
            this.baseUrl = envService.backend;
        }

    getClientProjects(id){
        return this.http.get(this.baseUrl + '/UserFilter/' + 'GetClientProjects/' + id);
    }
 
    getProjectBlocks(id){
        return this.http.get(this.baseUrl + '/UserFilter/' + 'GetProjectBlocks/' + id);
    }

    getBlockBuildings(id){
        return this.http.get(this.baseUrl + '/UserFilter/' + 'GetBlockBuildings/' + id);
    }

    getBuildingFloors(id){
        return this.http.get(this.baseUrl + '/UserFilter/' + 'GetBuildingFloors/' + id);
    }

    getAvailableDevices(utilityTypeId, clientId){
        return this.http.get(this.baseUrl + '/units/getAvailableDevices/' + utilityTypeId + '/' + clientId);
    }

    getUnitDetails(clientId,occupancyStatus) {
        let params: HttpParams = new HttpParams();
        params = params.append('occupancyStatus', occupancyStatus);
        return this.http.get(this.baseUrl + '/units/clientId/' + clientId, {params});
    }    

    getUnitDetailsById(id) {
        return this.http.get(this.baseUrl + '/units/' + id);
    }
    
    createUnit(unit) {
        return this.http.post(this.baseUrl + '/units/', unit);
    }
    
    updateUnitById(id, unit) {
        return this.http.put(this.baseUrl + '/units/' + id, unit);
    }
    
    deleteUnitById(id, unit) {   
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                
              }),
            body: unit
        }        
        return this.http.delete(this.baseUrl + '/units/' + id, options);
    }

    getMetadatas(api) {            
        return this.http.get(this.baseUrl + api);
    }

    getUtilities(clientId) {
        return this.http.get(this.baseUrl + '/clients/' + clientId + '/utilities');
    }
}