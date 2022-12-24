import { Injectable } from '@angular/core';
import { MailLabel } from '../apps/inbox/shared/mail-label.interface';
import { Mail } from '../apps/inbox/shared/mail.interface';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { inboxMails, labelColors } from '../..../../demo-data/inbox-demo-data';
import { HttpClient, HttpParams } from '@angular/common/http';

import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class ListemailsService {

  baseUrl = '';

  mails = inboxMails;
  availableLabels: MailLabel[] = [];

  lastRemovedMail: Mail;
  lastRemovedMailIndex: number;

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
  getStarred() {
    return of(this.mails).pipe(
      map(mails => mails.filter(mail => mail.starred))
    );
  }


  getNotificationEntities(entityType, clientId) {
    let params = new HttpParams();
    params = params.append('entityType', entityType);
    params = params.append('clientId', clientId);
    return this.httpClient.get(this.baseUrl + '/emails/GetNotificationEntities', { params: params });

  }
  getGroup(group: string) {

    return of(this.mails).pipe(
      map(mails => mails.filter(mail => mail.group === group))
    );
  }

  getEmailList(flag, clientId, userId, ownerId: number, role, mailId: number = 0) {

    let params: HttpParams = new HttpParams();
    params = params.append('flag', `${flag}`);
    params = params.append('clientId', `${clientId}`);
    params = params.append('receivedById', `${userId}`);
    params = params.append('ownerId', `${ownerId ?? 0}`);
    params = params.append('role', `${role}`);
    params = params.append('mailId', `${mailId}`);
    return this.httpClient.get<Mail[]>(this.baseUrl + '/emails/GetMailDetails', { params });
  }

  updateIsReadForMail(mail) {
    return this.httpClient.put<Mail[]>(this.baseUrl + '/emails/updateIsReadForMail', mail);
  }

  getMailFromServer(clientId, userId) {
    let params: HttpParams = new HttpParams();

    params = params.append('clientId', `${clientId}`);
    params = params.append('userId', `${userId}`);
    return this.httpClient.get<Mail[]>(this.baseUrl + '/emails', { params });
  }

  getMail(id: number | string) {
    return of(this.mails).pipe(
      map(mails => mails.find(mail => mail.id === id))
    );
  }

  toggleStarred(mail: Mail) {
    const foundMail = this.find(mail);
    if (foundMail) {
      foundMail.starred = !mail.starred;
    }

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

  removeMail(mail: Mail) {
    const foundMailIndex = this.mails.findIndex(m => m === mail);
    if (foundMailIndex > -1) {
      this.mails.splice(foundMailIndex, 1);
      this.lastRemovedMail = mail;
      this.lastRemovedMailIndex = foundMailIndex;
    }
  }

  undoRemove() {
    if (this.lastRemovedMail && this.lastRemovedMailIndex) {
      this.mails.splice(this.lastRemovedMailIndex, 0, this.lastRemovedMail);
      return this.lastRemovedMail;
    }

    return false;
  }

  find(mail: Mail) {
    return this.mails.find((existingMail) => existingMail.id === mail.id);
  }

  getLabelColors() {
    return of(labelColors);
  }
}
