import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ManageParams } from 'src/app/tabs/shared/models/manage-params.model';
import { Master } from 'src/app/tabs/shared/models/master.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'fury-failed-bills-toolbar',
  templateUrl: './failed-bills-toolbar.component.html',
  styleUrls: ['./failed-bills-toolbar.component.scss']
})
export class FailedBillsToolbarComponent implements OnInit {

  @Input() billPeriods: Master[] = [];
  @Output() searchClicked = new EventEmitter<ManageParams>();

  manageParams: ManageParams = {};
  tenantId: number = 0;
  fromDate: string = '';
  toDate: string = '';
  unitNumber: string = '';
  billPeriodId: number = 0;


  constructor(private snackbar: MatSnackBar, private date: DatePipe) { }

  ngOnInit(): void {
  }

  onSearch() {
    if (this.fromDate || this.toDate || this.billPeriodId) {
      this.manageParams = {
        fromDate: `${this.fromDate == '' ? '' : moment(this.fromDate).format('YYYY-MM-DD')}`,
        toDate: `${this.toDate == '' ? '' : moment(this.toDate).format('YYYY-MM-DD')}`,
        billPeriodId: `${this.billPeriodId}`,
        unitNumber: this.unitNumber,
        isFine: false,
        isPenalty: false
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
