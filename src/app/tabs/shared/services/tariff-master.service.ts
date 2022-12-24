import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';

import { environment } from '../../../../environments/environment';
import { TariffMaster } from '../models/tariff-master.model';
import { TariffSettings } from '../models/tariff-settings.model';

@Injectable({
    providedIn: 'root'
})
export class TariffMasterService {

    baseUrl = '';

    constructor(private http: HttpClient,
        private envService:EnvService) { 
            this.baseUrl = envService.backend;
        }

    saveTariffMaster(tariffMaster: TariffMaster) {
        return this.http.post<TariffMaster>(this.baseUrl + '/tariffs', tariffMaster);
    }

    getTariffMasters() {
        return this.http.get<TariffMaster[]>(this.baseUrl + '/tariffs');
    }

    updateTariffMaster(tariffMaster: TariffMaster) {
        return this.http.put<TariffMaster>(this.baseUrl + `/tariffs/${tariffMaster.id}`, tariffMaster);
    }

    saveTariffSettings(tariffSettings: TariffSettings) {
        return this.http.post<boolean>(this.baseUrl + '/tariffs/settings', tariffSettings);
    }

    getTariffSettings() {
        return this.http.get<TariffSettings[]>(this.baseUrl + '/tariffs/settings');
    }

    deleteTariffSettings(tariffSettings: TariffSettings) {
        return this.http.post<boolean>(this.baseUrl + '/tariffs/delete/settings', tariffSettings);
    }

    deleteTariffMaster(tariffMaster: TariffMaster) {
        return this.http.delete(this.baseUrl + '/tariffs/' + tariffMaster.id);
    }
}
