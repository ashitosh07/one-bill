import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AlertSetting } from 'src/app/tabs/shared/models/alert-setting.model';
import { NotificationTemplate } from 'src/app/tabs/shared/models/notification-template.model';
import { NotificationLog } from "../../tabs/notificatoin-logs/notification-log.model";
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { SLDTransaction } from 'src/app/tabs/shared/models/sld-transaction.model';
import { SLDMaster } from 'src/app/tabs/shared/models/sld-master.model';
import { CopyContent } from 'src/app/tabs/shared/models/copy-content.model';
import { EnvService } from 'src/app/env.service';
@Injectable({
  providedIn: 'root'
})
export class TemplatesService {

  baseUrl = '';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
      this.baseUrl = envService.backend;
     }


  getTemplateByTemplateTypeId(templateTypeId: number, clientId: number, notificationType: string) {
    let params: HttpParams = new HttpParams();
    if (templateTypeId || clientId) {
      params = params.append('templateTypeId', `${templateTypeId}`);
      params = params.append('clientId', `${clientId}`);
      params = params.append('notificationType', `${notificationType}`);
    }
    return this.httpClient.get<NotificationTemplate>(this.baseUrl + '/notifications/templates/email/content', { params });
  }

  CheckForTemplateType(templateTypeId, notificationType, clientId) {

    let params: HttpParams = new HttpParams();
    params = params.append('templateTypeId', `${templateTypeId}`);
    params = params.append('notificationType', `${notificationType}`);
    params = params.append('clientId', `${clientId}`);

    return this.httpClient.get(this.baseUrl + '/notifications/templates/GetNotificationTemplateId', { params });
  }

  updateTemplateById(id, template) {
    return this.httpClient.put(this.baseUrl + '/notifications/templates/' + id, template);
  }

  insertTemplate(template) {
    return this.httpClient.post(this.baseUrl + '/notifications/templates', template);
  }

  getTemplateTypes() {
    return this.httpClient.get<Master[]>(this.baseUrl + '/notifications/templates/GetTemplateTypes');
  }

  getSmsTemplates(clientId) {
    return this.httpClient.get(this.baseUrl + '/notifications/templates/sms/clientId/' + clientId);
  }

  getEmailTemplates(clientId) {
    return this.httpClient.get(this.baseUrl + '/notifications/templates/email/clientId/' + clientId);
  }

  getNotificationTemplates(notificationCategoryId: number) {
    let params: HttpParams = new HttpParams();
    params = params.append('notificationCategoryId', `${notificationCategoryId}`);
    return this.httpClient.get<Master[]>(this.baseUrl + '/notifications/templates/getNotificationTemplates', { params });
  }

  getKeywords(notificationCategory: number = 0) {
    let params: HttpParams = new HttpParams();
    params = params.append('id', `${notificationCategory}`);
    return this.httpClient.get(this.baseUrl + '/notifications/templates/Keywords', { params });
  }

  getConditions(notificationCategory: number = 0) {
    let params: HttpParams = new HttpParams();
    params = params.append('id', `${notificationCategory}`);
    return this.httpClient.get(this.baseUrl + '/notifications/templates/conditions', { params });
  }

  getNotificationModes(clientId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.httpClient.get(this.baseUrl + '/notifications/templates/notificationModes', { params });
  }

  createAlertSettings(alertSetting: AlertSetting, isEnable: boolean) {
    return this.httpClient.post<boolean>(this.baseUrl + '/notifications/alert/settings/' + isEnable, alertSetting);
  }

  getAlertSettings(clientId: number = 0, notificationCategorId: number = 0, templateTypeId: number = 0, notificationModes: string = '') {
    let params: HttpParams = new HttpParams();
    if (clientId) {
      params = params.append('clientId', `${clientId}`);
      params = params.append('notificationCategorId', `${notificationCategorId}`);
      params = params.append('templateTypeId', `${templateTypeId}`);
      params = params.append('notificationModes', `${notificationModes}`);
    }
    return this.httpClient.get<AlertSetting[]>(this.baseUrl + '/notifications/alert/settings', { params });
  }

  copyNotificationTemplates(copyContents: CopyContent[]) {
    return this.httpClient.post<boolean>(this.baseUrl + '/notifications/templates/copy/contents', copyContents);
  }

  getNotificationLogs(manageParams: ManageParams) {
    let params = new HttpParams();
    params = params.append('fromDate', `${manageParams.fromDate}`);
    params = params.append('toDate', `${manageParams.toDate}`);
    params = params.append('status', `${manageParams.statusId}`);
    params = params.append('mode', `${manageParams.modeId}`);
    params = params.append('clientId', `${manageParams.clientId}`);
    return this.httpClient.get<NotificationLog[]>(this.baseUrl + '/notifications/logs', { params: params });

  }

  createSLDMaster(sldMaster: SLDMaster) {
    return this.httpClient.post<boolean>(this.baseUrl + '/notifications/sld/master', sldMaster);
  }

  updateSLDMaster(sldMaster: SLDMaster) {
    return this.httpClient.put<boolean>(this.baseUrl + '/notifications/sld/master', sldMaster);
  }

  getSLDMaster(masterId: number, clientId: number) {
    let params = new HttpParams();
    params = params.append('masterId', `${masterId}`);
    params = params.append('clientId', `${clientId}`);
    return this.httpClient.get<SLDMaster>(this.baseUrl + '/notifications/sld/master', { params: params });
  }

  getClientAlertSettings(clientId: number) {
    let params = new HttpParams();
    if (clientId) {
      params = params.append('clientId', `${clientId}`);
    }
    return this.httpClient.get<AlertSetting[]>(this.baseUrl + '/notifications/client/alert/settings', { params });
  }
}
