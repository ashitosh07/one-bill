import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { componentDestroyed } from '../../../../../@fury/shared/component-destroyed';
import { ListemailsService } from '../../listemails.service';
import { ListFilterPipe } from '../list-filter.pipe';
import { Mail } from '../shared/mail.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { InboxNavigationComponent } from 'src/app/pages/apps/inbox/inbox-navigation/inbox-navigation.component';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { ClientSelectionService } from 'src/app/tabs/shared/services/client-selection.service';


@Component({
  selector: 'fury-inbox-mail-list',
  templateUrl: './inbox-mail-list.component.html',
  styleUrls: ['./inbox-mail-list.component.scss'],
})
export class InboxMailListComponent implements OnInit, OnDestroy {

  txtSearch: string = '';

  mails$: Observable<Mail[]>;
  emails: Observable<Mail[]>;
  inboxMails: Observable<Mail[]>;

  unreadMails: any[];
  readMails: Observable<Mail[]>;

  maillist: any[] = [];
  clientId: String;
  userId: String;

  ownerId = parseInt(this.cookieService.get('ownerId') == '' ? '0' : this.cookieService.get('ownerId'));
  role: string;

  @Input() mailListType: string = 'receive';

  dateFormat = 'MMM d, y, h:mm:ss a';

  constructor(private route: ActivatedRoute,
    private date: DatePipe,
    private inboxService: ListemailsService,
    private searchPipe: ListFilterPipe,
    private jwtHelperService: JwtHelperService,
    private clientSelectionService: ClientSelectionService,
    private cookieService: CookieService
  ) {
  }

  valChange(value) {
    this.txtSearch = value;
  }


  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    let token = this.cookieService.get('access_token');

    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken) {
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }


    this.clientId = this.cookieService.get('globalClientId');
    this.userId = this.cookieService.get('userId');
    this.route.paramMap.pipe(
      takeUntil(componentDestroyed(this))
    ).subscribe(paramMap => {
      if (paramMap.get('category') === 'starred') {
        this.mails$ = this.inboxService.getStarred();
      }
      else if (paramMap.get('category') === 'primary') {
        this.mailListType = 'receive';
        this.emails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
      }
      else if (paramMap.get('category') === 'Update') {
        this.onUpdateMail();
      }
      else if (paramMap.get('category') === 'Sent') {
        this.mailListType = 'sent';
        this.emails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
      }
      else {
        this.mails$ = this.inboxService.getGroup(paramMap.get('category'));
      }
    });


    this.emails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
    this.inboxMails = this.emails;
  }

  ngOnChanges(changes) {

    this.inboxMails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
    //this.listMails();

    this.listMails();
  }

  listMails() {

    if (!this.mailListType)
      this.mailListType = 'receive';
    this.emails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
    this.inboxMails = this.emails;
  }

  onUpdateMail() {
    this.inboxService.getMailFromServer(this.clientId, this.userId).subscribe((data: any) => {
      if (data) {
        this.emails = this.inboxService.getEmailList(this.mailListType, this.clientId, this.userId, this.ownerId, this.role);
      }
    })
  }

  unreadMail() {
    this.emails = this.inboxMails;
    this.emails = this.emails.pipe(
      map(mail =>
        mail.filter(item => !item.isRead)));


  }

  readMail() {
    this.emails = this.inboxMails;
    this.emails = this.emails.pipe(
      map(mail =>
        mail.filter(item => item.isRead)));

  }

  enableIsread(id) {

    let mail = {
      id: Number(id),
      isRead: false
    }
    this.inboxService.updateIsReadForMail(mail).subscribe((data: any) => {
    },
    )
  }

  toggleStarred(mail: Mail) {
    this.inboxService.toggleStarred(mail);
  }

  ngOnDestroy(): void {
  }
}
