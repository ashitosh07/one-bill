import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { CancelConfirmationDialogComponent } from 'src/app/tabs/shared/components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';
import { ListItem } from 'src/app/tabs/shared/models/list-item.model';
import { getClientDataFormat } from 'src/app/tabs/shared/utilities/utility';
import { Contract } from '../contract-create-update/contract.model';

@Component({
  selector: 'fury-contract-end-details',
  templateUrl: './contract-end-details.component.html',
  styleUrls: ['./contract-end-details.component.scss']
})
export class ContractEndDetailsComponent implements OnInit {
  clientId: string = '';
  form: FormGroup;
  totalOutstandingAmount: number = 0;
  totalSecurityDepositAmount: number = 0;
  dateFormat = getClientDataFormat('DateFormat');
  currencyFormat = getClientDataFormat('Currency');
  roundFormat = getClientDataFormat('RoundOff');
  checkDues = true;
  constructor(@Inject(MAT_DIALOG_DATA) private data: Contract,
    private dialogRef: MatDialogRef<ContractEndDetailsComponent>,
    private snackbar: MatSnackBar, private fb: FormBuilder,
    private cookieService: CookieService, private datePipe: DatePipe,
    private dialog: MatDialog, private router: Router) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.clientId = this.cookieService.get('globalClientId');
    this.form = this.fb.group({
      totalOutstandingAmount: [this.data.previousDueAmount || 0],
      totalSecurityDepositAmount: [this.data.securityDepositInHand || 0],
      contractEndDate: [this.data.contractEndDate || ''],
      reasonForContractEnd: [this.data.reasonForContractEnd || '']
    });
    this.form.get('contractEndDate').setValue(new Date());
    this.totalOutstandingAmount = this.data.previousDueAmount;
    this.totalSecurityDepositAmount = this.data.securityDepositInHand;
    this.checkDues = this.data.checkDues;
  }



  onEndContract() {
    let endContractValid = true;
    const contractEndDate = this.form.get('contractEndDate').value;
    if(!this.checkDues) {
      if (this.data && this.data.billMasters && this.data.billMasters.length) {
        let billMasters = this.data.billMasters.filter(x => x.billNumber != null && x.billAmount != x.paid && this.data.id == x.contractId);
        if(billMasters && billMasters.length)
        {
          let toDates: Date[] = this.data.billMasters.filter(x => x.billNumber != null).map(function (o) { return new Date(o.toDate); });
          const maxDate = Math.max.apply(Math, toDates);
          const billDate = moment(maxDate).startOf('day');
          const endDate = (contractEndDate ? moment(contractEndDate).startOf('day') : moment().startOf('day'));
          if (!(endDate <= billDate)) {
            endContractValid = false;
            this.redirectToFinalBill(contractEndDate);
          }
        }
      } else {
        if (moment(contractEndDate) <= moment()) {
          endContractValid = false;
          this.redirectToFinalBill(contractEndDate);
        }
        else if (moment(contractEndDate).diff(moment(this.data.contractDate), 'days') > 0) {
          endContractValid = false;
          this.redirectToFinalBill(contractEndDate);
        }
      }
    }
    if (endContractValid) {
      Object.assign(this.data, this.form.value);
      this.data.contractEndDate = this.datePipe.transform(this.data.contractEndDate, 'yyyy-MM-dd');
      if (!this.data.contractSuspendDate) {
        this.data.contractSuspendDate = null;
      }
      this.dialogRef.close(this.data);
    }
  }


  redirectToFinalBill(contractEndDate: Date) {
    const confirmMessage: ListItem = {
      label: "There are unbilled consumptions for this contract. Kindly generate bills for the same.Do you want to redirect to generate page?",
      selected: false
    };
    this.dialog.open(CancelConfirmationDialogComponent, { data: confirmMessage }).afterClosed().subscribe((message: any) => {
      if (message) {
        this.dialogRef.close();
        this.dialog.closeAll();
        this.router.navigate(['bills/final-bill-settlement'], { queryParams: { id: this.data.tenantId, unit: this.data.unitNumber, settlement_date: this.datePipe.transform(contractEndDate, 'yyyy-MM-dd') } });
      } else {
        this.dialogRef.close();
        this.dialog.closeAll();
      }
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  close() {
    this.dialogRef.close();
  }

  validateDates() {
    const startDate = this.datePipe.transform(this.data.contractDate, "MM-dd-yyyy");
    const endDate = this.datePipe.transform(this.form.get('contractEndDate').value, "MM-dd-yyyy");

    let isValidDate = true;
    var startYear = new Date(startDate).getFullYear();
    var endYear = new Date(endDate).getFullYear();
    if ((startYear != 1970) && (endYear != 1970)) {
      if (startYear < endYear) {
        return isValidDate;
      }
      else if (startYear > endYear) {
        isValidDate = false;
        return isValidDate;
      }
      else if (((startDate != null) || (startDate != '')) && ((endDate != null) || (endDate != ''))) {
        if ((endDate) <= (startDate)) {
          isValidDate = false;
        }
        return isValidDate;
      }
    }
    else {
      return isValidDate;
    }
  }
}
