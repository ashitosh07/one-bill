import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';

@Component({
  selector: 'fury-credit-note-history-toolbar',
  templateUrl: './credit-note-history-toolbar.component.html',
  styleUrls: ['./credit-note-history-toolbar.component.scss']
})
export class CreditNoteHistoryToolbarComponent implements OnInit {


  @Input() billPeriods: ListItem[] = [];
  @Input() billTypes: ListItem[] = [];
  @Input() isHide = true;

  @Output() searchClicked = new EventEmitter<ManageParams>();
  @Output() billTypeChanged = new EventEmitter<string>();

  manageParams: ManageParams = {};
  tenantId: number = 0;
  fromDate: string = '';
  toDate: string = '';
  unitNumber: string = '';
  billPeriodId: number = 0;
  billTypeId: number = 0;
  billType: string = '';
  role: string = '';
  ownerId: number = 0;

  constructor(
    private snackbar: MatSnackBar,
    private date: DatePipe) { }

  ngOnInit(): void {
  }

  onSearch() {
    if ((this.fromDate && this.toDate) || this.billPeriodId || this.ownerId > 0) {
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
}
