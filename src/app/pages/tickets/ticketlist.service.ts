import { Injectable } from '@angular/core';
import { Mail } from '../apps/inbox/shared/mail.interface';
import { inboxMails } from '../demo-data/inbox-demo-data';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MailLabel } from '../apps/inbox/shared/mail-label.interface';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class TicketlistService {
  mails = inboxMails;
  baseUrl = '';

  //clientId = Number(this.cookieService.get('globalClientId'));

  availableLabels: MailLabel[] = [];

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
    this.mails.forEach(mail => {
      mail.labels.forEach(label => {
        if (!this.availableLabels.find(l => l.name === label.name)) {
          this.availableLabels.push(label);
        }
      });
    });
  }


  getNotificationEntities(entityType, clientId, ownerId: number = 0, userId: string = '') {
    let params = new HttpParams();
    params = params.append('entityType', entityType);
    params = params.append('clientId', clientId);
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`)
    params = params.append('userId', userId)
    return this.httpClient.get(this.baseUrl + '/emails/GetNotificationEntities', { params: params });
  }

  getEntities(entityType, clientId) {
    let params = new HttpParams();
    params = params.append('entityType', entityType);
    params = params.append('clientId', clientId);
    return this.httpClient.get(this.baseUrl + '/tickets/entities', { params: params });
  }

  getTickets(clientId, role, ownerId: number, createdUserId) {
    let params: HttpParams = new HttpParams();
    params = params.append('clientId', `${clientId}`);
    params = params.append('role', `${role}`);
    params = params.append('ownerId', `${isNaN(ownerId) ? 0 : ownerId}`);
    params = params.append('createdUserId', `${createdUserId}`);

    return this.httpClient.get<any>(this.baseUrl + '/tickets/clientId', { params });
  }

  getTicketById(id) {
    return this.httpClient.get(this.baseUrl + '/tickets/' + id);
  }

  createTicket(ticket) {
    return this.httpClient.post(this.baseUrl + '/tickets', ticket);
  }

  updateTicketById(id, ticket) {
    return this.httpClient.put(this.baseUrl + '/tickets/' + id, ticket);
  }

  getMail(id: number | string) {
    return of(this.mails).pipe(
      map(mails => mails.find(mail => mail.id === id))
    );
  }


  addLabel(label: MailLabel, mail: Mail) {
    const foundMail = this.find(mail);
    if (foundMail) {
      const foundLabel = foundMail.labels.find(l => l === label);
      if (!foundLabel) {
        foundMail.labels.push(label);
        this.addToAvailableIfNotExists(label);
      }
    }
  }

  addToAvailableIfNotExists(label: MailLabel) {
    if (this.availableLabels.indexOf(label) === -1) {
      this.availableLabels.push(label);
    }
  }

  removeLabel(label: MailLabel, mail: Mail) {
    const foundMail = this.find(mail);
    if (foundMail) {
      const foundLabelIndex = foundMail.labels.findIndex(l => l === label);
      if (foundLabelIndex > -1) {
        foundMail.labels.splice(foundLabelIndex, 1);
      }
    }
  }


  toggleStarred(mail: Mail) {
    const foundMail = this.find(mail);
    if (foundMail) {
      foundMail.starred = !mail.starred;
    }

  }

  getStarred() {
    return of(this.mails).pipe(
      map(mails => mails.filter(mail => mail.starred))
    );
  }

  getGroup(group: string) {
    return of(this.mails).pipe(
      map(mails => mails.filter(mail => mail.group === group))
    );
  }

  find(mail: Mail) {
    return this.mails.find((existingMail) => existingMail.id === mail.id);
  }

}
