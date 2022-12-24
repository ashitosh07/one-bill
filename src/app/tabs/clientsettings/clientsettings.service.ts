import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { environment } from 'src/environments/environment';
import { CopyContent } from '../shared/models/copy-content.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsettingsService {

  baseUrl ='';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) { 
      this.baseUrl = envService.backend;
    }

  generalData(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/UserClients/' + clientId);
  }

  emailData(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/EmailSettings/' + clientId);
  }

  localisationData(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/ClientLocalisatonSettings/' + clientId);
  }

  getBillSettings() {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/billSettings');
  }

  getGroupandLedger() {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/GetGroupandLedgers');
  }

  messageGrid(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/ClientSettingsMessage/' + clientId);
  }

  sequenceGrid(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/SequenceControl/' + clientId);
  }

  groupandLedgerGrid(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/ClientSettingsLedgerRelation/' + clientId);
  }

  getTermsAndConditions(clientId) {
    return this.httpClient.get<any>(this.baseUrl + '/generalSettings/clientSettingsTermsAndConditions/' + clientId);
  }

  saveGeneral(general) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/UserClients', general);
  }

  saveSequenceNumber(sequenceNumber) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/SequenceControl', sequenceNumber);
  }
  
  saveEmail(email) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/EmailSettings', email);
  }

  saveMessage(message) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/ClientSettingsMessage', message);
  }

  saveLocalisation(localisation) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/ClientSettingsLocalisation', localisation);
  }

  saveLedger(ledger) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/ClientSettingsLedgerRelation', ledger);
  }

  saveInvoiceTerms(invoiceTermsAndConditions) {
    return this.httpClient.post<any>(this.baseUrl + '/generalSettings/clientSettingsTermsAndConditions', invoiceTermsAndConditions);
  }

  copyClientSettings(copyContents: CopyContent[]) {
    return this.httpClient.post<boolean>(this.baseUrl + '/generalSettings/copy/client/settings', copyContents);
  }

  deleteMessage(clientId) {
    return this.httpClient.delete(this.baseUrl + '/generalSettings/ClientSettingsMessage/' + clientId);
  }

  deleteLedger(clientId) {
    return this.httpClient.delete(this.baseUrl + '/generalSettings/ClientSettingsLedgerRelation/' + clientId);
  }

  checkForDuplicatePrefix(prefix,clientId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('prefix', `${prefix}`);
    return this.httpClient.get(this.baseUrl + '/generalSettings/checkDuplicatePrefix', {params});
  }
}
