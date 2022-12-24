import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Master } from '../../../tabs/shared/models/master.model';
import { Tenant } from '../../../tabs/shared/models/tenant.model';
import { ManageParams } from '../../../tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-advance-payment-toolbar',
  templateUrl: './advance-payment-toolbar.component.html',
  styleUrls: ['./advance-payment-toolbar.component.scss']
})
export class AdvancePaymentToolbarComponent implements OnInit {


  @Input() get tenants(): Tenant[] { return this.allTenants }
  set tenants(value: Tenant[]) {
    this.allTenants = this.fliterTenants = value;
  }
  @Output() searchClicked = new EventEmitter<ManageParams>();
  manageParams: ManageParams = {};
  allTenants: Tenant[] = [];
  fliterTenants: Tenant[] = [];
  fromDate: string = '';
  toDate: string = '';
  tenantId: number = 0;
  tenant: string = '';
  clientId: number = 0;
  role: string = '';
  ownerId: number = 0;


  constructor(
    private snackbar: MatSnackBar,
    private date: DatePipe,
    private jwtHelperService: JwtHelperService,
    private cookieService: CookieService) {
    this.fliterTenants = this.tenants;
  }

  ngOnInit(): void {
    let token = this.cookieService.get('access_token');
    const decodedToken = this.jwtHelperService.decodeToken(token);
    if (decodedToken)
      this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.ownerId = parseInt(this.cookieService.get('ownerId')) ?? 0;
    this.clientId = parseInt(this.cookieService.get("globalClientId"));
    //this.ownerId = parseInt((ownerId ? ownerId : '0'));
    //if (this.ownerId > 0) {
    // this.onSearch();
    //}
  }

  onSearch() {
    if ((this.fromDate && this.toDate) || this.tenantId) {
      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        tenantId: `${this.tenantId}`,
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

  search(query: string) {
    let result = this.select(query.toLowerCase())
    this.allTenants = result;
  }

  select(query: string): Tenant[] {
    let result: Tenant[] = [];
    if (query) {
      for (let a of this.fliterTenants) {
        if (a.ownerName.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.fliterTenants;
    }
    return result
  }

  handleInput(event: KeyboardEvent): void{
    event.stopPropagation();
  }

}
