import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpBackend } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AccountHeadResponse, ImportEntityTypes } from './bulk-import-response.model';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class BulkImportService {

  baseUrl ='';
  http: HttpClient

  constructor(
    private handler: HttpBackend, private envService: EnvService) {
    this.http = new HttpClient(handler);
    this.baseUrl = envService.backend;
  }

  getEntityTypes() {
    return this.http.get<ImportEntityTypes[]>(this.baseUrl + '/bulkimports/entityTypes');
  }

  uploadImportFile(formData) {
    return this.http.post(this.baseUrl + '/bulkimports', formData)
  }

  getAccountHeadsForUnitCharge(clientId) {
    return this.http.get<AccountHeadResponse[]>(this.baseUrl + '/accountheads/' + clientId + '/accountHeadsByHeadTypes/0')
  }

  getMeterReadingsFileName(clientId) {
    return this.http.get<string>(this.baseUrl + '/bulkimports/file/meterData/' + clientId);
  }

  getAdvancePaymentReadingsFileName(clientId) {
    return this.http.get<string>(this.baseUrl + '/bulkimports/file/advancePaymentData/' + clientId);
  }

  getPaymentDuesFileName(clientId) {
    return this.http.get<string>(this.baseUrl + '/bulkimports/file/paymentDueData/' + clientId);
  }

  getUnitDetailsFileName(clientId) {
    return this.http.get<string>(this.baseUrl + '/bulkimports/file/unitData/' + clientId);
  }

  getUnitChargeDetailsFileName(clientId) {
    return this.http.get<string>(this.baseUrl + '/bulkimports/file/unitChargeData/' + clientId);
  }

}



