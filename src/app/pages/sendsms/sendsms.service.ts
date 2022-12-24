import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';
import { AlertSetting } from 'src/app/tabs/shared/models/alert-setting.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SendsmsService {

  baseUrl = '';
  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }


  sendSms(sms) {
    return this.httpClient.post(this.baseUrl + '/template/customized', sms);

  }

  getSmsTemplates() {
    return this.httpClient.get(this.baseUrl + '/notifications/templates/sms');

  }

  sendEmail(email, userId, clientId) {
    let params = new HttpParams();
    params = params.append('userId', userId);
    params = params.append('clientId', clientId);
    return this.httpClient.post(this.baseUrl + '/emails/SendCustomEmails', email, { params: params });

  }

  getNotificationEntities(entityType, clientId) {
    let params = new HttpParams();
    params = params.append('entityType', entityType);
    params = params.append('clientId', clientId);
    return this.httpClient.get(this.baseUrl + '/emails/GetNotificationEntities', { params: params });

  }

  getNotificationEntity(entityType, id) {
    let params = new HttpParams();
    params = params.append('entityType', entityType);
    params = params.append('id', id);
    return this.httpClient.get(this.baseUrl + '/emails/GetNotificationEntity', { params: params });

  }

  getOwnerPhoneNumber(ownerId) {
    return this.httpClient.get(this.baseUrl + '/notifications/templates/GetOwnerPhoneNo/' + ownerId);
  }

  getTemplateTypes(clientId: number) {
    let params = new HttpParams();
    if (clientId) {
      params = params.append('clientId', `${clientId}`);
    }
    return this.httpClient.get<AlertSetting[]>(this.baseUrl + '/emails/client/TemplateTypes', { params });
  }

}
