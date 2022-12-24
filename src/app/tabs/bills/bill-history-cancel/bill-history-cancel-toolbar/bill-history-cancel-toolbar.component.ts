import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-bill-history-toolbar',
  templateUrl: './bill-history-toolbar.component.html',
  styleUrls: ['./bill-history-toolbar.component.scss']
})
export class BillHistoryToolbarComponent implements OnInit {

  @Input() billPeriods: Master[] = [];
  @Input() tenants: Tenant[] = [];
  @Input() isHide = true;
  @Output() searchClicked = new EventEmitter<ManageParams>();

  manageParams: ManageParams = {};
  tenantId: number = 0;
  fromDate: string = '';
  toDate: string = '';
  unitNumber: string = '';
  billPeriodId: number = 0;

  constructor(private snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onSearch() {
    if (this.fromDate || this.toDate || this.billPeriodId) {
      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`, 
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        billPeriodId: `${this.billPeriodId}`
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

  onChangeBillPeriod(value) {
    this.billPeriodId = value;
  }

  selectTenant(event: any) {
    this.tenants.forEach(tenant => {
      if (tenant.ownerName === event.option.value) {
        this.tenantId = tenant.id;
      }
    });
  }
}
