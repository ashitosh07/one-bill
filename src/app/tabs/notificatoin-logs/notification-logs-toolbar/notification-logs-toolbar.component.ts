import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-notification-logs-toolbar',
  templateUrl: './notification-logs-toolbar.component.html',
  styleUrls: ['./notification-logs-toolbar.component.scss']
})
export class NotificationLogsToolbarComponent implements OnInit {

  @Input() billPeriods: ListItem[] = [];
  @Input() tenants: Tenant[] = [];
  @Input() modes: ListItem[] = [];
  @Input() isHide = true;

  @Output() searchClicked = new EventEmitter<ManageParams>();
  @Output() modeChanged = new EventEmitter<string>();

  manageParams: ManageParams = {};

  fromDate: string = '';
  toDate: string = '';

  statusId: number = 0;
  modeId: number = 0;
  mode: string = '';
  clientId: number = 0;
  role: string = '';
  isDisabled: boolean = true;


  constructor(private snackbar: MatSnackBar,
    private date: DatePipe,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const ownerId = this.cookieService.get('ownerId')
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    //this.ownerId = parseInt((ownerId ? ownerId : '0'));
    //if (this.ownerId > 0) {
    // this.onSearch();
    //}
    this.validateSearchParameters();
  }

  validateSearchParameters()
  {
    if ((this.fromDate && this.toDate) || this.modeId > 0 || this.statusId > 0)
    {
      this.isDisabled = false;
    }
    else {
      this.isDisabled = true;
    }
  }

  onSearch() {
    if ((this.fromDate && this.toDate) || this.modeId || this.statusId > 0) {
      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        statusId: this.statusId,
        modeId: this.modeId,
        clientId: this.clientId
      }
      this.searchClicked.emit(this.manageParams);
    } else {
      this.snackbar.open('Invalid search parameters', null, {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'end',
        panelClass: ['yellow-snackbar'],
      });
    }
  }

  onChangeStatus(value) {
    this.statusId = value;
    this.validateSearchParameters();
  }


  onChangeMode(value) {
    this.modeId = value;
    const mode = this.modes.find(x => x.value === value);
    if (mode) {
      this.mode = mode.label;
    }
    this.validateSearchParameters();
    this.modeChanged.emit(this.mode);
  }


}
