import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import SimpleBar from 'simplebar';
import { EnvService } from '../env.service';
import { Mail } from '../pages/apps/inbox/shared/mail.interface';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  scrollbar: SimpleBar;
  baseUrl = '';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }


  getEmailNotifications(ownerId: number, role: string, userId: string) {

    let params: HttpParams = new HttpParams();
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`);
    params = params.append('role', `${role}`);
    params = params.append('receivedById', `${userId}`);
    return this.httpClient.get<Mail[]>(this.baseUrl + '/emails/login/user/email/notifications', { params });
  }

  getTicketNotifications(ownerId: number, role: string, userId: string) {
    let params: HttpParams = new HttpParams();
    params = params.append('role', `${role}`);
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`);
    params = params.append('receiverById', `${userId}`);
    return this.httpClient.get<any>(this.baseUrl + '/tickets/login/user/ticket/notifications', { params });
  }


  getNotifications(clientId, userId, ownerId: number, role, mailId: number = 0) {

    let params: HttpParams = new HttpParams();

    params = params.append('clientId', `${clientId}`);
    params = params.append('receivedById', `${userId}`);
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`);
    params = params.append('role', `${role}`);
    params = params.append('mailId', `${mailId}`);
    return this.httpClient.get<Mail[]>(this.baseUrl + '/emails/GetMailDetails', { params });
  }

  getTickets(clientId, role, ownerId: number, createdUserId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('role', `${role}`);
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`);
    params = params.append('createdUserId', `${createdUserId}`);

    return this.httpClient.get<any>(this.baseUrl + '/tickets/NotificationTickets', { params });
  }

  getAlarms(clientId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    return this.httpClient.get<any>(this.baseUrl + '/alarmsettings/NotificationAlarm', { params });
  }

  updateIsReadForMail(mail) {
    return this.httpClient.put<Mail[]>(this.baseUrl + '/emails/updateIsReadForMail', mail);
  }

  updateIsReadForTickets(ticket) {
    return this.httpClient.put<Mail[]>(this.baseUrl + '/tickets/UpdateIsReadForTickets', ticket);
  }

  updateIsNotifyForAlarm(alarm) {
    return this.httpClient.put<any[]>(this.baseUrl + '/alarmsettings/UpdateIsNotifyForAlarm', alarm);
  }

}
