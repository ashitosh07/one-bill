import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class BillsettingsService {
  baseUrl = '';


  constructor(private http: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }

  getBillSettings() {
    return this.http.get(this.baseUrl + '/billsettings');
  }

  createBillSettings(billsettings) {
    return this.http.post(this.baseUrl + '/billsettings', billsettings);
  }

  updateBillsettingsById(id, billsettings) {
    return this.http.put(this.baseUrl + '/billsettings/' + id, billsettings);
  }

  deleteBillsettingsById(id) {
    return this.http.delete(this.baseUrl + '/billsettings/' + id);
  }

  getTermsAndConditions(clientId) {
    return this.http.get(this.baseUrl + '/billsettings/termsConditions/' + clientId);
  }
}
